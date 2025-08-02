import { QdrantClient } from '@qdrant/js-client-rest';

// Qdrant client configuration
export const qdrantClient = new QdrantClient({
  url: process.env.QDRANT_URL || 'http://localhost:6333',
});

// Collection name for system prompts
export const COLLECTION_NAME = 'system_prompts';

// Vector dimensions (we'll use a simple embedding for now)
export const VECTOR_SIZE = 384; // Standard sentence transformer size

// Initialize collection if it doesn't exist
export async function initializeCollection() {
  try {
    // Check if collection exists
    const collections = await qdrantClient.getCollections();
    const collectionExists = collections.collections.some(
      (collection) => collection.name === COLLECTION_NAME
    );

    if (!collectionExists) {
      // Create collection
      await qdrantClient.createCollection(COLLECTION_NAME, {
        vectors: {
          size: VECTOR_SIZE,
          distance: 'Cosine',
        },
      });
      console.log(`Collection '${COLLECTION_NAME}' created successfully`);
    }
  } catch (error) {
    console.error('Error initializing Qdrant collection:', error);
    throw error;
  }
}

// Simple text to vector conversion (you might want to use a proper embedding model)
export function textToVector(text: string): number[] {
  // This is a simple hash-based vector generation for demonstration
  // In production, use a proper embedding model like sentence-transformers
  const hash = text.split('').reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc);
  }, 0);
  
  const vector = Array.from({ length: VECTOR_SIZE }, (_, i) => {
    return Math.sin(hash * (i + 1)) * 0.1;
  });
  
  return vector;
}

export interface SystemPrompt {
  id: string;
  content: string;
  title?: string;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
}

// Upsert a system prompt to Qdrant
export async function upsertSystemPrompt(prompt: SystemPrompt): Promise<void> {
  try {
    await initializeCollection();
    
    const vector = textToVector(prompt.content);
    
    await qdrantClient.upsert(COLLECTION_NAME, {
      wait: true,
      points: [
        {
          id: prompt.id,
          vector,
          payload: {
            content: prompt.content,
            title: prompt.title || 'Untitled Prompt',
            tags: prompt.tags || [],
            createdAt: prompt.createdAt.toISOString(),
            updatedAt: prompt.updatedAt.toISOString(),
          },
        },
      ],
    });
  } catch (error) {
    console.error('Error upserting system prompt:', error);
    throw error;
  }
}

// Search for similar system prompts
export async function searchSystemPrompts(
  query: string,
  limit: number = 10
): Promise<SystemPrompt[]> {
  try {
    await initializeCollection();
    
    const queryVector = textToVector(query);
    
    const searchResult = await qdrantClient.search(COLLECTION_NAME, {
      vector: queryVector,
      limit,
      with_payload: true,
    });

    return searchResult.map((result) => ({
      id: result.id as string,
      content: result.payload?.content as string,
      title: result.payload?.title as string,
      tags: result.payload?.tags as string[],
      createdAt: new Date(result.payload?.createdAt as string),
      updatedAt: new Date(result.payload?.updatedAt as string),
    }));
  } catch (error) {
    console.error('Error searching system prompts:', error);
    throw error;
  }
}

// Get all system prompts
export async function getAllSystemPrompts(): Promise<SystemPrompt[]> {
  try {
    await initializeCollection();
    
    const scrollResult = await qdrantClient.scroll(COLLECTION_NAME, {
      limit: 100,
      with_payload: true,
    });

    return scrollResult.points.map((point) => ({
      id: point.id as string,
      content: point.payload?.content as string,
      title: point.payload?.title as string,
      tags: point.payload?.tags as string[],
      createdAt: new Date(point.payload?.createdAt as string),
      updatedAt: new Date(point.payload?.updatedAt as string),
    }));
  } catch (error) {
    console.error('Error fetching all system prompts:', error);
    throw error;
  }
}

// Delete a system prompt
export async function deleteSystemPrompt(id: string): Promise<void> {
  try {
    await qdrantClient.delete(COLLECTION_NAME, {
      wait: true,
      points: [id],
    });
  } catch (error) {
    console.error('Error deleting system prompt:', error);
    throw error;
  }
}

// Get a specific system prompt by ID
export async function getSystemPromptById(id: string): Promise<SystemPrompt | null> {
  try {
    const result = await qdrantClient.retrieve(COLLECTION_NAME, {
      ids: [id],
      with_payload: true,
    });

    if (result.length === 0) {
      return null;
    }

    const point = result[0];
    return {
      id: point.id as string,
      content: point.payload?.content as string,
      title: point.payload?.title as string,
      tags: point.payload?.tags as string[],
      createdAt: new Date(point.payload?.createdAt as string),
      updatedAt: new Date(point.payload?.updatedAt as string),
    };
  } catch (error) {
    console.error('Error fetching system prompt by ID:', error);
    throw error;
  }
}
