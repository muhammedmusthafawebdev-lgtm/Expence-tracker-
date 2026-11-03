'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { getSupabase, isSupabaseConfigured } from '@/services/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isConfigured: boolean;
  authEmail: string;
  setAuthEmail: (email: string) => void;

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

  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) {
      return;
    }

    // Get current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen to real-time auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string, fullName: string) => {
    const supabase = getSupabase();
    if (!supabase) {
      return {
        success: false,
        error: 'Supabase credentials are not configured in environment variables.',
      };
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: fullName.trim(),
          },
          emailRedirectTo: typeof window !== 'undefined' ? `${window.location.origin}` : undefined,
        },
      });

      if (error) {
        return { success: false, error: error.message };
      }

      const requiresConfirmation = !data.session && !!data.user;
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
        error: 'Supabase credentials are not configured in environment variables.',
      };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
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
        error: 'Supabase credentials are not configured in environment variables.',
      };
    }

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          emailRedirectTo: typeof window !== 'undefined' ? `${window.location.origin}` : undefined,
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
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: typeof window !== 'undefined' ? `${window.location.origin}` : undefined,
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
        error: 'Supabase credentials are not configured.',
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
      await supabase.auth.signOut();
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
