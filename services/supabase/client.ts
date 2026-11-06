import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Database } from './types';

export interface SupabaseConfig {
  url: string;
  anonKey: string;
}

export function getSupabaseConfig(): SupabaseConfig | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const anonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

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

/**
 * Generates the absolute redirect URL for Supabase Auth callbacks.
 * Defaults to `${origin}/auth/callback`.
 */
export function getAuthRedirectUrl(path: string = '/auth/callback'): string {
  if (typeof window !== 'undefined') {
    return `${window.location.origin}${path}`;
  }
  const appUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.APP_URL ||
    'http://localhost:3000';
  return `${appUrl.replace(/\/$/, '')}${path}`;
}

let supabaseInstance: SupabaseClient<any> | null = null;

/**
 * Returns the singleton Supabase browser client instance or null if not configured.
 */
export function getSupabase(): SupabaseClient<any> | null {
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
        flowType: 'pkce',
        storage: typeof window !== 'undefined' ? window.localStorage : undefined,
      },
    });
  }

  return supabaseInstance;
}
