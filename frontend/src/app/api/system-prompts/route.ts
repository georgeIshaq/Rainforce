import { NextRequest, NextResponse } from 'next/server';
import SupabaseService from '@/lib/supabaseService';

// GET /api/system-prompts - Get all prompts or search
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const limit = parseInt(searchParams.get('limit') || '10');

    let systemPrompts;

    if (query) {
      // Search prompts
      systemPrompts = await SupabaseService.searchSystemPrompts(query, limit);
    } else {
      // Get all prompts
      systemPrompts = await SupabaseService.getAllSystemPrompts();
    }

    return NextResponse.json({
      success: true,
      data: systemPrompts,
      count: systemPrompts.length,
    });
  } catch (error) {
    console.error('Error fetching system prompts:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch system prompts',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// POST /api/system-prompts - Create a new prompt
export async function POST(request: NextRequest) {
  try {
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

    const newSystemPrompt = await SupabaseService.createSystemPrompt(system_prompt);

    return NextResponse.json({
      success: true,
      data: newSystemPrompt,
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating system prompt:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create system prompt',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
