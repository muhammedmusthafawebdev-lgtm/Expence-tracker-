import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Database } from './types';

export interface SupabaseConfig {
  url: string;
  anonKey: string;
}

export function getSupabaseConfig(): SupabaseConfig | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (
    !url ||
    !anonKey ||
    url.includes('your-project-id') ||
    anonKey.includes('your-anon-public-key') ||
    url.trim() === '' ||
    anonKey.trim() === ''
  ) {
    return null;
  }

  return { url: url.trim(), anonKey: anonKey.trim() };
}

export const isSupabaseConfigured = (): boolean => {
  return getSupabaseConfig() !== null;
};

let supabaseInstance: SupabaseClient | null = null;

/**
 * Returns the singleton Supabase client instance or null if not configured.
 */
export function getSupabase(): SupabaseClient | null {
  const config = getSupabaseConfig();
  if (!config) {
    return null;
  }

  if (!supabaseInstance) {
    supabaseInstance = createClient(config.url, config.anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storage: typeof window !== 'undefined' ? window.localStorage : undefined,
      },
    });
  }

  return supabaseInstance;
}
