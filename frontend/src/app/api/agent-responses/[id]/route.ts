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
        { success: false, error: 'Invalid agent response ID' },
        { status: 400 }
      );
    }

    const agentResponse = await SupabaseService.getAgentResponseById(id);

    if (!agentResponse) {
      return NextResponse.json(
        { success: false, error: 'Agent response not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: agentResponse
    });
  } catch (error) {
    console.error('Error fetching agent response:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch agent response',
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
        { success: false, error: 'Invalid agent response ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const updatedAgentResponse = await SupabaseService.updateAgentResponse(id, body);

    return NextResponse.json({
      success: true,
      data: updatedAgentResponse
    });
  } catch (error) {
    console.error('Error updating agent response:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update agent response',
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
        { success: false, error: 'Invalid agent response ID' },
        { status: 400 }
      );
    }

    await SupabaseService.deleteAgentResponse(id);

    return NextResponse.json({
      success: true,
      message: 'Agent response deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting agent response:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to delete agent response',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
