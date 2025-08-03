'use client';

import { useState, useEffect, useCallback } from 'react';
import SupabaseService, { type AgentResponse, type AgentResponseInsert, type AgentResponseUpdate } from '@/lib/supabaseService';

interface UseAgentResponsesReturn {
  responses: AgentResponse[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  searchResponses: (query: string) => Promise<void>;
  filterByEvaluation: (evaluation: string) => Promise<void>;
  createResponse: (response: AgentResponseInsert) => Promise<AgentResponse | null>;
  updateResponse: (id: number, updates: AgentResponseUpdate) => Promise<AgentResponse | null>;
  deleteResponse: (id: number) => Promise<boolean>;
  clearSearch: () => Promise<void>;
}

export function useAgentResponses(): UseAgentResponsesReturn {
  const [responses, setResponses] = useState<AgentResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadResponses = useCallback(async () => {
    // Check if Supabase environment variables are available
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.warn('Supabase environment variables are missing. Using mock data.');
      setResponses([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await SupabaseService.getAllAgentResponses();
      setResponses(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load agent responses';
      setError(errorMessage);
      console.error('Error loading agent responses:', err);
      // Set empty array as fallback
      setResponses([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const searchResponses = useCallback(async (query: string) => {
    if (!query.trim()) {
      await loadResponses();
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await SupabaseService.searchAgentResponses(query);
      setResponses(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to search agent responses';
      setError(errorMessage);
      console.error('Error searching agent responses:', err);
    } finally {
      setLoading(false);
    }
  }, [loadResponses]);

  const filterByEvaluation = useCallback(async (evaluation: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await SupabaseService.getAgentResponsesByEvaluation(evaluation);
      setResponses(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to filter agent responses';
      setError(errorMessage);
      console.error('Error filtering agent responses:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const createResponse = useCallback(async (response: AgentResponseInsert): Promise<AgentResponse | null> => {
    try {
      setError(null);
      const newResponse = await SupabaseService.createAgentResponse(response);
      setResponses(prev => [newResponse, ...prev]);
      return newResponse;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create agent response';
      setError(errorMessage);
      console.error('Error creating agent response:', err);
      return null;
    }
  }, []);

  const updateResponse = useCallback(async (id: number, updates: AgentResponseUpdate): Promise<AgentResponse | null> => {
    try {
      setError(null);
      const updatedResponse = await SupabaseService.updateAgentResponse(id, updates);
      setResponses(prev => prev.map(response => response.id === id ? updatedResponse : response));
      return updatedResponse;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update agent response';
      setError(errorMessage);
      console.error('Error updating agent response:', err);
      return null;
    }
  }, []);

  const deleteResponse = useCallback(async (id: number): Promise<boolean> => {
    try {
      setError(null);
      await SupabaseService.deleteAgentResponse(id);
      setResponses(prev => prev.filter(response => response.id !== id));
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete agent response';
      setError(errorMessage);
      console.error('Error deleting agent response:', err);
      return false;
    }
  }, []);

  const clearSearch = useCallback(async () => {
    await loadResponses();
  }, [loadResponses]);

  // Load responses on mount
  useEffect(() => {
    loadResponses();
  }, [loadResponses]);

  // Set up real-time subscription
  useEffect(() => {
    let subscription: { unsubscribe: () => void } | null = null;
    
    try {
      subscription = SupabaseService.subscribeToAgentResponses((payload) => {
        console.log('Real-time agent response update:', payload);
        
        switch (payload.eventType) {
          case 'INSERT':
            if (payload.new) {
              setResponses(prev => [payload.new as AgentResponse, ...prev]);
            }
            break;
          case 'UPDATE':
            if (payload.new) {
              setResponses(prev => prev.map(response => 
                response.id === payload.new.id ? payload.new as AgentResponse : response
              ));
            }
            break;
          case 'DELETE':
            if (payload.old) {
              setResponses(prev => prev.filter(response => response.id !== payload.old.id));
            }
            break;
        }
      });
    } catch (err) {
      console.error('Failed to set up real-time subscription:', err);
    }

    // Cleanup subscription on unmount
    return () => {
      if (subscription) {
        try {
          subscription.unsubscribe();
        } catch (err) {
          console.error('Error unsubscribing:', err);
        }
      }
    };
  }, []);

  return {
    responses,
    loading,
    error,
    refetch: loadResponses,
    searchResponses,
    filterByEvaluation,
    createResponse,
    updateResponse,
    deleteResponse,
    clearSearch,
  };
}
