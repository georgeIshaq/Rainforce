import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import {
  upsertSystemPrompt,
  getAllSystemPrompts,
  searchSystemPrompts,
  SystemPrompt,
} from '@/lib/qdrant';

// GET /api/prompts - Get all prompts or search
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const limit = parseInt(searchParams.get('limit') || '10');

    let prompts: SystemPrompt[];

    if (query) {
      // Search prompts
      prompts = await searchSystemPrompts(query, limit);
    } else {
      // Get all prompts
      prompts = await getAllSystemPrompts();
    }

    return NextResponse.json({
      success: true,
      data: prompts,
      count: prompts.length,
    });
  } catch (error) {
    console.error('Error fetching prompts:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch prompts',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// POST /api/prompts - Create a new prompt
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { content, title, tags } = body;

    if (!content) {
      return NextResponse.json(
        {
          success: false,
          error: 'Content is required',
        },
        { status: 400 }
      );
    }

    const now = new Date();
    const prompt: SystemPrompt = {
      id: uuidv4(),
      content,
      title: title || 'Untitled Prompt',
      tags: tags || [],
      createdAt: now,
      updatedAt: now,
    };

    await upsertSystemPrompt(prompt);

    return NextResponse.json({
      success: true,
      data: prompt,
      message: 'Prompt created successfully',
    });
  } catch (error) {
    console.error('Error creating prompt:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create prompt',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
