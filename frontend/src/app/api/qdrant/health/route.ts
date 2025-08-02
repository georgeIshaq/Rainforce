import { NextResponse } from 'next/server';
import { qdrantClient, initializeCollection, COLLECTION_NAME } from '@/lib/qdrant';

// GET /api/qdrant/health - Test Qdrant connection
export async function GET() {
  try {
    // Test basic connection
    const info = await qdrantClient.getCollections();
    
    // Initialize collection if needed
    await initializeCollection();
    
    // Get collection info
    const collectionInfo = await qdrantClient.getCollection(COLLECTION_NAME);
    
    return NextResponse.json({
      success: true,
      message: 'Qdrant connection successful',
      data: {
        totalCollections: info.collections.length,
        systemPromptsCollection: {
          name: COLLECTION_NAME,
          vectorsCount: collectionInfo.vectors_count || 0,
          pointsCount: collectionInfo.points_count || 0,
          status: collectionInfo.status,
        },
      },
    });
  } catch (error) {
    console.error('Qdrant health check failed:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Qdrant connection failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
