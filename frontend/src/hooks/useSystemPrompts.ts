'use client';

import { useState, useEffect, useCallback } from 'react';
import SupabaseService, { type SystemPrompt as SupabaseSystemPrompt } from '@/lib/supabaseService';

export interface SystemPrompt {
  id: number;
  prompt: string;
  createdAt: Date;
}

export interface UseSystemPromptsReturn {
  prompts: SystemPrompt[];
  loading: boolean;
  error: string | null;
  createPrompt: (prompt: string) => Promise<SystemPrompt | null>;
  updatePrompt: (id: number, prompt: string) => Promise<SystemPrompt | null>;
  deletePrompt: (id: number) => Promise<boolean>;
  searchPrompts: (query: string) => Promise<SystemPrompt[]>;
  refreshPrompts: () => Promise<void>;
}

export function useSystemPrompts(): UseSystemPromptsReturn {
  const [prompts, setPrompts] = useState<SystemPrompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Convert Supabase SystemPrompt to our interface
  const convertPrompt = (supabasePrompt: SupabaseSystemPrompt): SystemPrompt => ({
    id: supabasePrompt.id,
    prompt: supabasePrompt.system_prompt || '',
    createdAt: new Date(supabasePrompt.created_at),
  });

  // Fetch all prompts
  const fetchPrompts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const supabasePrompts = await SupabaseService.getAllSystemPrompts();
      const convertedPrompts = supabasePrompts.map(convertPrompt);
      setPrompts(convertedPrompts);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch prompts';
      setError(errorMessage);
      console.error('Error fetching prompts:', err);
      // Set empty array as fallback
      setPrompts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Create a new prompt
  const createPrompt = async (prompt: string): Promise<SystemPrompt | null> => {
    try {
      setError(null);
      const newSupabasePrompt = await SupabaseService.createSystemPrompt(prompt);
      const newPrompt = convertPrompt(newSupabasePrompt);
      setPrompts(prev => [newPrompt, ...prev]);
      return newPrompt;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create prompt';
      setError(errorMessage);
      console.error('Error creating prompt:', err);
      return null;
    }
  };

  // Update an existing prompt
  const updatePrompt = async (id: number, prompt: string): Promise<SystemPrompt | null> => {
    try {
      setError(null);
      const updatedSupabasePrompt = await SupabaseService.updateSystemPrompt(id, prompt);
      const updatedPrompt = convertPrompt(updatedSupabasePrompt);
      setPrompts(prev => 
        prev.map(p => p.id === id ? updatedPrompt : p)
      );
      return updatedPrompt;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update prompt';
      setError(errorMessage);
      console.error('Error updating prompt:', err);
      return null;
    }
  };

  // Delete a prompt
  const deletePrompt = async (id: number): Promise<boolean> => {
    try {
      setError(null);
      await SupabaseService.deleteSystemPrompt(id);
      setPrompts(prev => prev.filter(p => p.id !== id));
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete prompt';
      setError(errorMessage);
      console.error('Error deleting prompt:', err);
      return false;
    }
  };

  // Search prompts
  const searchPrompts = async (query: string): Promise<SystemPrompt[]> => {
    try {
      setError(null);
      const supabasePrompts = await SupabaseService.searchSystemPrompts(query);
      return supabasePrompts.map(convertPrompt);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to search prompts';
      setError(errorMessage);
      console.error('Error searching prompts:', err);
      return [];
    }
  };

  // Refresh prompts
  const refreshPrompts = async () => {
    await fetchPrompts();
  };

  // Load prompts on mount
  useEffect(() => {
    fetchPrompts();
  }, [fetchPrompts]);

  return {
    prompts,
    loading,
    error,
    createPrompt,
    updatePrompt,
    deletePrompt,
    searchPrompts,
    refreshPrompts,
  };
}
