'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { getSupabase, isSupabaseConfigured, getAuthRedirectUrl } from '@/services/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isConfigured: boolean;
  authEmail: string;
  setAuthEmail: (email: string) => void;
  authNotice: string | null;
  clearAuthNotice: () => void;

  signUp: (email: string, password: string, fullName: string) => Promise<{
    success: boolean;
    error?: string;
    requiresEmailConfirmation?: boolean;
  }>;
  signIn: (email: string, password: string) => Promise<{
    success: boolean;
    error?: string;
  }>;
  signInWithMagicLink: (email: string) => Promise<{
    success: boolean;
    error?: string;
  }>;
  resetPasswordForEmail: (email: string) => Promise<{
    success: boolean;
    error?: string;
  }>;
  updatePassword: (newPassword: string) => Promise<{
    success: boolean;
    error?: string;
  }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const isConfigured = isSupabaseConfigured();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState<boolean>(() => isConfigured);
  const [authEmail, setAuthEmail] = useState<string>('');
  const [authNotice, setAuthNotice] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      const authError = url.searchParams.get('auth_error');
      const authErrorDesc = url.searchParams.get('auth_error_description');
      if (authError || authErrorDesc) {
        url.searchParams.delete('auth_error');
        url.searchParams.delete('auth_error_description');
        window.history.replaceState({}, document.title, url.pathname + (url.search ? url.search : ''));
        return authErrorDesc || authError || 'Authentication link failed or expired.';
      }
    }
    return null;
  });

  const clearAuthNotice = useCallback(() => {
    setAuthNotice(null);
  }, []);

  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) {
      return;
    }

    let isSubscribed = true;

    // Process authentication callback parameters (PKCE code or OTP token_hash)
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      const code = url.searchParams.get('code');
      const tokenHash = url.searchParams.get('token_hash');
      const type = url.searchParams.get('type') as any;

      if (code) {
        // Exchange PKCE authorization code for session
        supabase.auth
          .exchangeCodeForSession(code)
          .then(({ data, error }) => {
            if (!isSubscribed) return;
            if (error) {
              setAuthNotice(`Authentication code exchange failed: ${error.message}`);
            } else if (data.session) {
              setSession(data.session);
              setUser(data.user);
            }
          })
          .catch((err: unknown) => {
            if (!isSubscribed) return;
            const message = err instanceof Error ? err.message : 'Failed to verify auth code.';
            setAuthNotice(message);
          })
          .finally(() => {
            if (isSubscribed) {
              url.searchParams.delete('code');
              window.history.replaceState({}, document.title, url.pathname + (url.search ? url.search : ''));
              setLoading(false);
            }
          });
      } else if (tokenHash && type) {
        // Verify token_hash OTP
        supabase.auth
          .verifyOtp({ token_hash: tokenHash, type })
          .then(({ data, error }) => {
            if (!isSubscribed) return;
            if (error) {
              setAuthNotice(`Verification link failed: ${error.message}`);
            } else if (data.session) {
              setSession(data.session);
              setUser(data.user);
            }
          })
          .catch((err: unknown) => {
            if (!isSubscribed) return;
            const message = err instanceof Error ? err.message : 'Failed to verify token.';
            setAuthNotice(message);
          })
          .finally(() => {
            if (isSubscribed) {
              url.searchParams.delete('token_hash');
              url.searchParams.delete('type');
              window.history.replaceState({}, document.title, url.pathname + (url.search ? url.search : ''));
              setLoading(false);
            }
          });
      }
    }

    // Retrieve active session from client storage
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (!isSubscribed) return;
      if (!error && session) {
        setSession(session);
        setUser(session.user);
      }
      setLoading(false);
    });

    // Real-time auth state changes listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      if (!isSubscribed) return;
      setSession(newSession);
      setUser(newSession?.user ?? null);
      setLoading(false);
    });

    return () => {
      isSubscribed = false;
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string, fullName: string) => {
    const supabase = getSupabase();
    if (!supabase) {
      return {
        success: false,
        error:
          'Supabase credentials are not configured in environment variables. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.',
      };
    }

    try {
      const redirectUrl = getAuthRedirectUrl('/auth/callback');

      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: fullName.trim(),
          },
          emailRedirectTo: redirectUrl,
        },
      });

      if (error) {
        return { success: false, error: error.message };
      }

      // If email confirmation is enabled on Supabase, data.session is null and data.user is pending confirmation
      const requiresConfirmation = !data.session && !!data.user;
      if (data.session) {
        setSession(data.session);
        setUser(data.user);
      }

      return {
        success: true,
        requiresEmailConfirmation: requiresConfirmation,
      };
    } catch (err: unknown) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'An unexpected error occurred during signup.',
      };
    }
  };

  const signIn = async (email: string, password: string) => {
    const supabase = getSupabase();
    if (!supabase) {
      return {
        success: false,
        error:
          'Supabase credentials are not configured in environment variables. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.',
      };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        if (error.message.toLowerCase().includes('email not confirmed')) {
          return {
            success: false,
            error:
              'Your email address has not been confirmed yet. Please click the confirmation link in your email or sign in with a Magic Link.',
          };
        }
        if (error.message.toLowerCase().includes('invalid login credentials')) {
          return {
            success: false,
            error: 'Invalid email or password. Please verify your credentials or sign in with Magic Link.',
          };
        }
        return { success: false, error: error.message };
      }

      setSession(data.session);
      setUser(data.user);
      return { success: true };
    } catch (err: unknown) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Failed to sign in.',
      };
    }
  };

  const signInWithMagicLink = async (email: string) => {
    const supabase = getSupabase();
    if (!supabase) {
      return {
        success: false,
        error:
          'Supabase credentials are not configured in environment variables. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.',
      };
    }

    try {
      const redirectUrl = getAuthRedirectUrl('/auth/callback');

      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          emailRedirectTo: redirectUrl,
          shouldCreateUser: true,
        },
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (err: unknown) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Failed to send magic link.',
      };
    }
  };

  const resetPasswordForEmail = async (email: string) => {
    const supabase = getSupabase();
    if (!supabase) {
      return {
        success: false,
        error: 'Supabase credentials are not configured in environment variables.',
      };
    }

    try {
      const redirectUrl = getAuthRedirectUrl('/auth/callback?next=/');

      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: redirectUrl,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (err: unknown) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Failed to initiate password reset.',
      };
    }
  };

  const updatePassword = async (newPassword: string) => {
    const supabase = getSupabase();
    if (!supabase) {
      return {
        success: false,
        error: 'Supabase credentials are not configured in environment variables.',
      };
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (err: unknown) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Failed to update password.',
      };
    }
  };

  const signOut = async () => {
    const supabase = getSupabase();
    if (supabase) {
      try {
        await supabase.auth.signOut();
      } catch {
        // Ignore network errors during sign out
      }
    }
    setSession(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        isConfigured,
        authEmail,
        setAuthEmail,
        authNotice,
        clearAuthNotice,
        signUp,
        signIn,
        signInWithMagicLink,
        resetPasswordForEmail,
        updatePassword,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
