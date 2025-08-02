import { useState, useEffect, useCallback } from 'react';
import SupabaseService, { AttackPattern } from '@/lib/supabaseService';

interface UseAttackPatternsReturn {
  attacks: AttackPattern[];
  loading: boolean;
  error: string | null;
  searchAttacks: (query: string, limit?: number) => Promise<AttackPattern[]>;
  getAttacksByCategory: (category: string) => Promise<AttackPattern[]>;
  getAttacksByTechnique: (techniqueType: string) => Promise<AttackPattern[]>;
  refreshAttacks: () => Promise<void>;
  clearError: () => void;
}

export function useAttackPatterns(): UseAttackPatternsReturn {
  const [attacks, setAttacks] = useState<AttackPattern[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load all attack patterns
  const loadAttacks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Check if Supabase is properly configured
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        throw new Error('Supabase configuration missing. Please check your environment variables.');
      }
      
      const data = await SupabaseService.getAllAttackPatterns();
      setAttacks(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load attack patterns';
      setError(errorMessage);
      console.error('Error loading attack patterns:', err);
      // Set empty array on error to prevent UI crashes
      setAttacks([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Search attack patterns
  const searchAttacks = useCallback(async (
    query: string, 
    limit: number = 20
  ): Promise<AttackPattern[]> => {
    try {
      setError(null);
      const results = await SupabaseService.searchAttackPatterns(query, limit);
      return results;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to search attack patterns';
      setError(errorMessage);
      console.error('Error searching attack patterns:', err);
      return [];
    }
  }, []);

  // Get attacks by category
  const getAttacksByCategory = useCallback(async (category: string): Promise<AttackPattern[]> => {
    try {
      setError(null);
      const results = await SupabaseService.getAttackPatternsByCategory(category);
      return results;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get attacks by category';
      setError(errorMessage);
      console.error('Error getting attacks by category:', err);
      return [];
    }
  }, []);

  // Get attacks by technique
  const getAttacksByTechnique = useCallback(async (techniqueType: string): Promise<AttackPattern[]> => {
    try {
      setError(null);
      const results = await SupabaseService.getAttackPatternsByTechnique(techniqueType);
      return results;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get attacks by technique';
      setError(errorMessage);
      console.error('Error getting attacks by technique:', err);
      return [];
    }
  }, []);

  // Refresh attacks (reload from database)
  const refreshAttacks = useCallback(async () => {
    await loadAttacks();
  }, [loadAttacks]);

  // Clear error state
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Initial load
  useEffect(() => {
    loadAttacks();
  }, [loadAttacks]);

  // Set up real-time subscription
  useEffect(() => {
    let subscription: { unsubscribe: () => void } | null = null;
    
    try {
      subscription = SupabaseService.subscribeToAttackPatterns((payload) => {
        console.log('Real-time attack pattern update:', payload);
        
        switch (payload.eventType) {
          case 'INSERT':
            if (payload.new) {
              setAttacks(prev => [payload.new as AttackPattern, ...prev]);
            }
            break;
          case 'UPDATE':
            if (payload.new) {
              setAttacks(prev => prev.map(attack => 
                attack.id === payload.new.id ? payload.new as AttackPattern : attack
              ));
            }
            break;
          case 'DELETE':
            if (payload.old) {
              setAttacks(prev => prev.filter(attack => attack.id !== payload.old.id));
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
    attacks,
    loading,
    error,
    searchAttacks,
    getAttacksByCategory,
    getAttacksByTechnique,
    refreshAttacks,
    clearError,
  };
}
