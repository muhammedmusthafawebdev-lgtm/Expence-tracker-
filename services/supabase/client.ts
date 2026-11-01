/**
 * Supabase Client Integration Boundary
 *
 * Prepared for future Supabase connection.
 * When you are ready to connect Supabase:
 * 1. Install @supabase/supabase-js:
 *    npm install @supabase/supabase-js
 * 2. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your environment.
 * 3. Swap the active provider in services/data-provider.ts to SupabaseDataProvider.
 */

export interface SupabaseConfig {
  url: string;
  anonKey: string;
}

export function getSupabaseConfig(): SupabaseConfig | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey || url.includes('your-project') || anonKey.includes('your-anon-key')) {
    return null;
  }

  return { url, anonKey };
}

export const isSupabaseConfigured = (): boolean => {
  return getSupabaseConfig() !== null;
};
