import { NextRequest, NextResponse } from 'next/server';
import {
  getSystemPromptById,
  upsertSystemPrompt,
  deleteSystemPrompt,
  SystemPrompt,
} from '@/lib/qdrant';

interface RouteParams {
  params: {
    id: string;
  };
}

// GET /api/prompts/[id] - Get a specific prompt
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const prompt = await getSystemPromptById(id);

    if (!prompt) {
      return NextResponse.json(
        {
          success: false,
          error: 'Prompt not found',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: prompt,
    });
  } catch (error) {
    console.error('Error fetching prompt:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch prompt',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// PUT /api/prompts/[id] - Update a specific prompt
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { content, title, tags } = body;

    // Check if prompt exists
    const existingPrompt = await getSystemPromptById(id);
    if (!existingPrompt) {
      return NextResponse.json(
        {
          success: false,
          error: 'Prompt not found',
        },
        { status: 404 }
      );
    }

    // Update the prompt
    const updatedPrompt: SystemPrompt = {
      ...existingPrompt,
      content: content || existingPrompt.content,
      title: title || existingPrompt.title,
      tags: tags || existingPrompt.tags,
      updatedAt: new Date(),
    };

    await upsertSystemPrompt(updatedPrompt);

    return NextResponse.json({
      success: true,
      data: updatedPrompt,
      message: 'Prompt updated successfully',
    });
  } catch (error) {
    console.error('Error updating prompt:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update prompt',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// DELETE /api/prompts/[id] - Delete a specific prompt
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    // Check if prompt exists
    const existingPrompt = await getSystemPromptById(id);
    if (!existingPrompt) {
      return NextResponse.json(
        {
          success: false,
          error: 'Prompt not found',
        },
        { status: 404 }
      );
    }

    await deleteSystemPrompt(id);

    return NextResponse.json({
      success: true,
      message: 'Prompt deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting prompt:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete prompt',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
