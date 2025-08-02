import { NextRequest, NextResponse } from 'next/server';
import { qdrantClient } from '@/lib/qdrant';

interface Params {
  id: string;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<Params> }
) {
  try {
    const { id } = await params;
    
    const result = await qdrantClient.retrieve('analysis_entries', {
      ids: [id],
      with_payload: true,
    });

    if (result.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Entry not found' },
        { status: 404 }
      );
    }

    const entry = {
      id: result[0].id,
      ...result[0].payload
    };

    return NextResponse.json({ success: true, data: entry });
  } catch (error) {
    console.error('Error fetching analysis entry:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch analysis entry' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<Params> }
) {
  try {
    const { id } = await params;
    
    await qdrantClient.delete('analysis_entries', {
      wait: true,
      points: [id]
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting analysis entry:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete analysis entry' },
      { status: 500 }
    );
  }
}
