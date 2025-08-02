import { NextResponse } from 'next/server';
import SupabaseService from '@/lib/supabaseService';

export async function GET() {
  try {
    const isConnected = await SupabaseService.checkConnection();
    
    return NextResponse.json({
      success: isConnected,
      message: isConnected ? 'Supabase connection healthy' : 'Supabase connection failed',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Supabase health check failed:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Supabase health check failed',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
