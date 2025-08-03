import { NextRequest, NextResponse } from 'next/server';
import SupabaseService from '@/lib/supabaseService';

interface RouteParams {
  params: { id: string };
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid system prompt ID' },
        { status: 400 }
      );
    }

    const systemPrompt = await SupabaseService.getSystemPromptById(id);

    if (!systemPrompt) {
      return NextResponse.json(
        { success: false, error: 'System prompt not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: systemPrompt,
    });
  } catch (error) {
    console.error('Error fetching system prompt:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch system prompt',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid system prompt ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { system_prompt } = body;

    if (!system_prompt) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required field: system_prompt' 
        },
        { status: 400 }
      );
    }

    const updatedSystemPrompt = await SupabaseService.updateSystemPrompt(id, system_prompt);

    return NextResponse.json({
      success: true,
      data: updatedSystemPrompt,
    });
  } catch (error) {
    console.error('Error updating system prompt:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update system prompt',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid system prompt ID' },
        { status: 400 }
      );
    }

    await SupabaseService.deleteSystemPrompt(id);

    return NextResponse.json({
      success: true,
      message: 'System prompt deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting system prompt:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to delete system prompt',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
