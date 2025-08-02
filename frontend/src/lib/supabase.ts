import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseKey) {
  console.warn('Supabase environment variables are missing. Some features may not work.');
}

// Create client even if env vars are missing to prevent crashes
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co', 
  supabaseKey || 'placeholder-key'
);

// Attack data structure
export interface AttackData {
  source: string;
  vector: string;
  category: string;
  attack_id: string;
  attack_text: string;
  text_length: number;
  vector_size: number;
  generated_at: string;
  attack_number: number;
  technique_type: string;
  collection_name: string;
}

// Database types - you can generate these from your Supabase schema
export type Database = {
  public: {
    Tables: {
      system_prompts: {
        Row: {
          id: string;
          content: string;
          title: string;
          tags: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          content: string;
          title: string;
          tags?: string[];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          content?: string;
          title?: string;
          tags?: string[];
          updated_at?: string;
        };
      };
      attack_patterns: {
        Row: {
          id: number;
          collection_name: string | null;
          vector_size: number | null;
          attack_data: AttackData | null;
          created_at: string | null;
        };
        Insert: {
          id?: number;
          collection_name?: string | null;
          vector_size?: number | null;
          attack_data?: AttackData | null;
          created_at?: string | null;
        };
        Update: {
          id?: number;
          collection_name?: string | null;
          vector_size?: number | null;
          attack_data?: AttackData | null;
          created_at?: string | null;
        };
      };
    };
  };
};

// Type-safe Supabase client
export type SupabaseClient = typeof supabase;
