import { useState, useEffect, useCallback } from 'react';
import SupabaseService, { SystemPrompt, SystemPromptInsert } from '@/lib/supabaseService';

interface UseSupabasePromptsReturn {
  prompts: SystemPrompt[];
  loading: boolean;
  error: string | null;
  createPrompt: (content: string, title: string, tags?: string[]) => Promise<SystemPrompt | null>;
  updatePrompt: (id: string, updates: Partial<SystemPrompt>) => Promise<SystemPrompt | null>;
  deletePrompt: (id: string) => Promise<boolean>;
  searchPrompts: (query: string, limit?: number) => Promise<SystemPrompt[]>;
  refreshPrompts: () => Promise<void>;
  clearError: () => void;
}

export function useSupabasePrompts(): UseSupabasePromptsReturn {
  const [prompts, setPrompts] = useState<SystemPrompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load all prompts
  const loadPrompts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await SupabaseService.getAllSystemPrompts();
      setPrompts(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load prompts';
      setError(errorMessage);
      console.error('Error loading prompts:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Create a new prompt
  const createPrompt = useCallback(async (
    content: string, 
    title: string, 
    tags: string[] = []
  ): Promise<SystemPrompt | null> => {
    try {
      setError(null);
      const promptData: SystemPromptInsert = {
        content,
        title,
        tags,
      };
      
      const newPrompt = await SupabaseService.createSystemPrompt(promptData);
      setPrompts(prev => [newPrompt, ...prev]);
      return newPrompt;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create prompt';
      setError(errorMessage);
      console.error('Error creating prompt:', err);
      return null;
    }
  }, []);

  // Update an existing prompt
  const updatePrompt = useCallback(async (
    id: string, 
    updates: Partial<SystemPrompt>
  ): Promise<SystemPrompt | null> => {
    try {
      setError(null);
      const updatedPrompt = await SupabaseService.updateSystemPrompt(id, updates);
      setPrompts(prev => prev.map(prompt => 
        prompt.id === id ? updatedPrompt : prompt
      ));
      return updatedPrompt;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update prompt';
      setError(errorMessage);
      console.error('Error updating prompt:', err);
      return null;
    }
  }, []);

  // Delete a prompt
  const deletePrompt = useCallback(async (id: string): Promise<boolean> => {
    try {
      setError(null);
      await SupabaseService.deleteSystemPrompt(id);
      setPrompts(prev => prev.filter(prompt => prompt.id !== id));
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete prompt';
      setError(errorMessage);
      console.error('Error deleting prompt:', err);
      return false;
    }
  }, []);

  // Search prompts
  const searchPrompts = useCallback(async (
    query: string, 
    limit: number = 10
  ): Promise<SystemPrompt[]> => {
    try {
      setError(null);
      const results = await SupabaseService.searchSystemPrompts(query, limit);
      return results;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to search prompts';
      setError(errorMessage);
      console.error('Error searching prompts:', err);
      return [];
    }
  }, []);

  // Refresh prompts (reload from database)
  const refreshPrompts = useCallback(async () => {
    await loadPrompts();
  }, [loadPrompts]);

  // Clear error state
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Initial load
  useEffect(() => {
    loadPrompts();
  }, [loadPrompts]);

  // Set up real-time subscription
  useEffect(() => {
    const subscription = SupabaseService.subscribeToSystemPrompts((payload) => {
      console.log('Real-time update:', payload);
      
      switch (payload.eventType) {
        case 'INSERT':
          if (payload.new) {
            setPrompts(prev => [payload.new as SystemPrompt, ...prev]);
          }
          break;
        case 'UPDATE':
          if (payload.new) {
            setPrompts(prev => prev.map(prompt => 
              prompt.id === payload.new.id ? payload.new as SystemPrompt : prompt
            ));
          }
          break;
        case 'DELETE':
          if (payload.old) {
            setPrompts(prev => prev.filter(prompt => prompt.id !== payload.old.id));
          }
          break;
      }
    });

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return {
    prompts,
    loading,
    error,
    createPrompt,
    updatePrompt,
    deletePrompt,
    searchPrompts,
    refreshPrompts,
    clearError,
  };
}
