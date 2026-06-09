// Supabase client — auto-detects configuration
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const isConfigured = !!(supabaseUrl && supabaseAnonKey && supabaseUrl.includes('supabase.co'));

export const supabase = isConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: true, autoRefreshToken: true },
      db: { schema: 'public' },
    })
  : null;

export const DATA_MODE = isConfigured ? 'supabase' : 'local';

export function getDb() {
  return supabase;
}

export function getSupabase() {
  return supabase;
}

export function isSupabaseMode() {
  return DATA_MODE === 'supabase';
}
