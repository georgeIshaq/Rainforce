import { supabase, Database } from './supabase';
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js';

export type SystemPrompt = Database['public']['Tables']['system_prompts']['Row'];
export type SystemPromptInsert = Database['public']['Tables']['system_prompts']['Insert'];
export type SystemPromptUpdate = Database['public']['Tables']['system_prompts']['Update'];

export type AttackPattern = Database['public']['Tables']['attack_patterns']['Row'];
export type AttackPatternInsert = Database['public']['Tables']['attack_patterns']['Insert'];
export type AttackPatternUpdate = Database['public']['Tables']['attack_patterns']['Update'];

export class SupabaseService {
  // System Prompts operations
  static async getAllSystemPrompts(): Promise<SystemPrompt[]> {
    const { data, error } = await supabase
      .from('system_prompts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch system prompts: ${error.message}`);
    }

    return data || [];
  }

  static async getSystemPromptById(id: string): Promise<SystemPrompt | null> {
    const { data, error } = await supabase
      .from('system_prompts')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Not found
      }
      throw new Error(`Failed to fetch system prompt: ${error.message}`);
    }

    return data;
  }

  static async createSystemPrompt(prompt: SystemPromptInsert): Promise<SystemPrompt> {
    const { data, error } = await supabase
      .from('system_prompts')
      .insert({
        ...prompt,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create system prompt: ${error.message}`);
    }

    return data;
  }

  static async updateSystemPrompt(id: string, updates: SystemPromptUpdate): Promise<SystemPrompt> {
    const { data, error } = await supabase
      .from('system_prompts')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update system prompt: ${error.message}`);
    }

    return data;
  }

  static async deleteSystemPrompt(id: string): Promise<void> {
    const { error } = await supabase
      .from('system_prompts')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete system prompt: ${error.message}`);
    }
  }

  static async searchSystemPrompts(query: string, limit: number = 10): Promise<SystemPrompt[]> {
    const { data, error } = await supabase
      .from('system_prompts')
      .select('*')
      .or(`content.ilike.%${query}%,title.ilike.%${query}%`)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      throw new Error(`Failed to search system prompts: ${error.message}`);
    }

    return data || [];
  }

  // Real-time subscriptions
  static subscribeToSystemPrompts(callback: (payload: RealtimePostgresChangesPayload<SystemPrompt>) => void) {
    return supabase
      .channel('system_prompts_changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'system_prompts' 
        }, 
        callback
      )
      .subscribe();
  }

  // Utility methods
  static async checkConnection(): Promise<boolean> {
    try {
      const { error } = await supabase.from('system_prompts').select('id').limit(1);
      return !error;
    } catch {
      return false;
    }
  }

  // Attack Patterns operations
  static async getAllAttackPatterns(): Promise<AttackPattern[]> {
    try {
      const { data, error } = await supabase
        .from('attack_patterns')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(`Failed to fetch attack patterns: ${error.message}`);
      }

      return data || [];
    } catch (err) {
      console.error('Supabase getAllAttackPatterns error:', err);
      // Return empty array if there's a connection issue
      return [];
    }
  }

  static async getAttackPatternById(id: number): Promise<AttackPattern | null> {
    const { data, error } = await supabase
      .from('attack_patterns')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Not found
      }
      throw new Error(`Failed to fetch attack pattern: ${error.message}`);
    }

    return data;
  }

  static async searchAttackPatterns(query: string, limit: number = 20): Promise<AttackPattern[]> {
    const { data, error } = await supabase
      .from('attack_patterns')
      .select('*')
      .or(`attack_data->>attack_text.ilike.%${query}%,attack_data->>category.ilike.%${query}%,attack_data->>technique_type.ilike.%${query}%`)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      throw new Error(`Failed to search attack patterns: ${error.message}`);
    }

    return data || [];
  }

  static async getAttackPatternsByCategory(category: string): Promise<AttackPattern[]> {
    const { data, error } = await supabase
      .from('attack_patterns')
      .select('*')
      .eq('attack_data->>category', category)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch attack patterns by category: ${error.message}`);
    }

    return data || [];
  }

  static async getAttackPatternsByTechnique(techniqueType: string): Promise<AttackPattern[]> {
    const { data, error } = await supabase
      .from('attack_patterns')
      .select('*')
      .eq('attack_data->>technique_type', techniqueType)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch attack patterns by technique: ${error.message}`);
    }

    return data || [];
  }

  static async createAttackPattern(pattern: AttackPatternInsert): Promise<AttackPattern> {
    const { data, error } = await supabase
      .from('attack_patterns')
      .insert({
        ...pattern,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create attack pattern: ${error.message}`);
    }

    return data;
  }

  // Real-time subscriptions for attack patterns
  static subscribeToAttackPatterns(callback: (payload: RealtimePostgresChangesPayload<AttackPattern>) => void) {
    return supabase
      .channel('attack_patterns_changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'attack_patterns' 
        }, 
        callback
      )
      .subscribe();
  }
}

export default SupabaseService;
