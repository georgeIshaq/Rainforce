import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { qdrantClient } from '@/lib/qdrant';

export async function GET() {
  try {
    const results = await qdrantClient.search('analysis_entries', {
      vector: Array(384).fill(0), // Dummy vector for getting all entries
      limit: 1000,
      with_payload: true,
    });

    const entries = results.map(result => ({
      id: result.id,
      ...result.payload
    }));

    return NextResponse.json({ success: true, data: entries });
  } catch (error) {
    console.error('Error fetching analysis entries:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch analysis entries' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      input,
      output,
      analysis,
      responseTime,
      tokenCount,
      sentiment,
      status
    } = body;

    if (!input || !output || !analysis) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: input, output, analysis' },
        { status: 400 }
      );
    }

    const id = uuidv4();
    const timestamp = new Date().toISOString();

    // Create vector embedding from input + output + analysis for semantic search
    const text = `${input} ${output} ${analysis}`;
    const embeddingResponse = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        input: text,
        model: 'text-embedding-ada-002',
      }),
    });

    let vector = Array(384).fill(0); // Default vector
    if (embeddingResponse.ok) {
      const embeddingData = await embeddingResponse.json();
      vector = embeddingData.data[0].embedding;
    }

    // Ensure collection exists
    try {
      await qdrantClient.getCollection('analysis_entries');
    } catch {
      await qdrantClient.createCollection('analysis_entries', {
        vectors: { size: vector.length, distance: 'Cosine' }
      });
    }

    // Store in Qdrant
    await qdrantClient.upsert('analysis_entries', {
      wait: true,
      points: [{
        id,
        vector,
        payload: {
          timestamp,
          input,
          output,
          analysis,
          responseTime: responseTime || null,
          tokenCount: tokenCount || null,
          sentiment: sentiment || null,
          status: status || null
        }
      }]
    });

    return NextResponse.json({
      success: true,
      data: {
        id,
        timestamp,
        input,
        output,
        analysis,
        responseTime,
        tokenCount,
        sentiment,
        status
      }
    });
  } catch (error) {
    console.error('Error creating analysis entry:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create analysis entry' },
      { status: 500 }
    );
  }
}
