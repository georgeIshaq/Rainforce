import { NextRequest, NextResponse } from 'next/server';
import SupabaseService from '@/lib/supabaseService';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const evaluation = searchParams.get('evaluation');

    let agentResponses;

    if (search) {
      agentResponses = await SupabaseService.searchAgentResponses(search);
    } else if (evaluation) {
      agentResponses = await SupabaseService.getAgentResponsesByEvaluation(evaluation);
    } else {
      agentResponses = await SupabaseService.getAllAgentResponses();
    }

    return NextResponse.json({
      success: true,
      data: agentResponses,
      count: agentResponses.length
    });
  } catch (error) {
    console.error('Error fetching agent responses:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch agent responses',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const { agent_prompt, attack, agent_response, evaluation } = body;

    if (!attack || !agent_response) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required fields: attack and agent_response are required' 
        },
        { status: 400 }
      );
    }

    const newAgentResponse = await SupabaseService.createAgentResponse({
      agent_prompt,
      attack,
      agent_response,
      evaluation
    });

    return NextResponse.json({
      success: true,
      data: newAgentResponse
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating agent response:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create agent response',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
