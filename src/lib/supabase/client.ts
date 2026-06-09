// Supabase client with auto-fallback to dummy data
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const isSupabaseConfigured = supabaseUrl && supabaseAnonKey && supabaseUrl !== 'your-project-url';

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: true, autoRefreshToken: true },
      db: { schema: 'public' },
    })
  : null;

export function getSupabase() {
  return supabase;
}

export function isUsingSupabase() {
  return isSupabaseConfigured;
}

// Dummy mode indicator
export const DATA_MODE: 'supabase' | 'dummy' = isSupabaseConfigured ? 'supabase' : 'dummy';
