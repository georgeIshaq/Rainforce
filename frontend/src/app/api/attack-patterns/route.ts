import { NextRequest, NextResponse } from 'next/server';
import SupabaseService from '@/lib/supabaseService';

// GET /api/attack-patterns - Get all attack patterns or search
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const category = searchParams.get('category');
    const technique = searchParams.get('technique');
    const limit = parseInt(searchParams.get('limit') || '50');

    let attacks;

    if (query) {
      // Search attack patterns
      attacks = await SupabaseService.searchAttackPatterns(query, limit);
    } else if (category) {
      // Filter by category
      attacks = await SupabaseService.getAttackPatternsByCategory(category);
    } else if (technique) {
      // Filter by technique
      attacks = await SupabaseService.getAttackPatternsByTechnique(technique);
    } else {
      // Get all attack patterns
      attacks = await SupabaseService.getAllAttackPatterns();
    }

    return NextResponse.json({
      success: true,
      data: attacks,
      count: attacks.length,
    });
  } catch (error) {
    console.error('Error fetching attack patterns:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch attack patterns',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// POST /api/attack-patterns - Create a new attack pattern
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { collection_name, vector_size, attack_data } = body;

    if (!attack_data) {
      return NextResponse.json(
        {
          success: false,
          error: 'Attack data is required',
        },
        { status: 400 }
      );
    }

    const pattern = await SupabaseService.createAttackPattern({
      collection_name: collection_name || 'attack_patterns',
      vector_size: vector_size || null,
      attack_data,
    });

    return NextResponse.json({
      success: true,
      data: pattern,
      message: 'Attack pattern created successfully',
    });
  } catch (error) {
    console.error('Error creating attack pattern:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create attack pattern',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
