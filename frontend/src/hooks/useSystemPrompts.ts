'use client';

import { useState, useEffect } from 'react';

export interface SystemPrompt {
  id: string;
  content: string;
  title?: string;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface UseSystemPromptsReturn {
  prompts: SystemPrompt[];
  loading: boolean;
  error: string | null;
  createPrompt: (content: string, title?: string, tags?: string[]) => Promise<SystemPrompt | null>;
  updatePrompt: (id: string, content: string, title?: string, tags?: string[]) => Promise<SystemPrompt | null>;
  deletePrompt: (id: string) => Promise<boolean>;
  searchPrompts: (query: string) => Promise<SystemPrompt[]>;
  refreshPrompts: () => Promise<void>;
}

export function useSystemPrompts(): UseSystemPromptsReturn {
  const [prompts, setPrompts] = useState<SystemPrompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all prompts
  const fetchPrompts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/prompts');
      const result = await response.json();
      
      if (result.success) {
        // Convert date strings back to Date objects
        const promptsWithDates = result.data.map((prompt: SystemPrompt & { createdAt: string; updatedAt: string }) => ({
          ...prompt,
          createdAt: new Date(prompt.createdAt),
          updatedAt: new Date(prompt.updatedAt),
        }));
        setPrompts(promptsWithDates);
      } else {
        setError(result.error || 'Failed to fetch prompts');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  // Create a new prompt
  const createPrompt = async (
    content: string,
    title?: string,
    tags?: string[]
  ): Promise<SystemPrompt | null> => {
    try {
      setError(null);
      
      const response = await fetch('/api/prompts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content, title, tags }),
      });
      
      const result = await response.json();
      
      if (result.success) {
        const newPrompt = {
          ...result.data,
          createdAt: new Date(result.data.createdAt),
          updatedAt: new Date(result.data.updatedAt),
        };
        setPrompts(prev => [newPrompt, ...prev]);
        return newPrompt;
      } else {
        setError(result.error || 'Failed to create prompt');
        return null;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      return null;
    }
  };

  // Update an existing prompt
  const updatePrompt = async (
    id: string,
    content: string,
    title?: string,
    tags?: string[]
  ): Promise<SystemPrompt | null> => {
    try {
      setError(null);
      
      const response = await fetch(`/api/prompts/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content, title, tags }),
      });
      
      const result = await response.json();
      
      if (result.success) {
        const updatedPrompt = {
          ...result.data,
          createdAt: new Date(result.data.createdAt),
          updatedAt: new Date(result.data.updatedAt),
        };
        setPrompts(prev => 
          prev.map(prompt => prompt.id === id ? updatedPrompt : prompt)
        );
        return updatedPrompt;
      } else {
        setError(result.error || 'Failed to update prompt');
        return null;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      return null;
    }
  };

  // Delete a prompt
  const deletePrompt = async (id: string): Promise<boolean> => {
    try {
      setError(null);
      
      const response = await fetch(`/api/prompts/${id}`, {
        method: 'DELETE',
      });
      
      const result = await response.json();
      
      if (result.success) {
        setPrompts(prev => prev.filter(prompt => prompt.id !== id));
        return true;
      } else {
        setError(result.error || 'Failed to delete prompt');
        return false;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      return false;
    }
  };

  // Search prompts
  const searchPrompts = async (query: string): Promise<SystemPrompt[]> => {
    try {
      setError(null);
      
      const response = await fetch(`/api/prompts?q=${encodeURIComponent(query)}`);
      const result = await response.json();
      
      if (result.success) {
        return result.data.map((prompt: SystemPrompt & { createdAt: string; updatedAt: string }) => ({
          ...prompt,
          createdAt: new Date(prompt.createdAt),
          updatedAt: new Date(prompt.updatedAt),
        }));
      } else {
        setError(result.error || 'Failed to search prompts');
        return [];
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
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
  };
}
