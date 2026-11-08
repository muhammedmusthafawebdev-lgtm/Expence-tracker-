'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { getSupabase, isSupabaseConfigured, getAuthRedirectUrl } from '@/services/supabase/client';

export type AuthMode = 'signup' | 'magiclink' | 'recovery';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isConfigured: boolean;
  authEmail: string;
  setAuthEmail: (email: string) => void;
  authMode: AuthMode | null;
  setAuthMode: (mode: AuthMode | null) => void;
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
  resendConfirmationEmail: (email: string) => Promise<{
    success: boolean;
    error?: string;
  }>;
  verifyOtpCode: (
    email: string,
    token: string,
    type?: 'email' | 'signup' | 'magiclink' | 'recovery'
  ) => Promise<{
    success: boolean;
    error?: string;
  }>;
  verifyOtpTokenHash: (
    tokenHash: string,
    type?: 'email' | 'signup' | 'magiclink' | 'recovery' | 'invite'
  ) => Promise<{
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

export function formatAuthErrorMessage(err: unknown, defaultMessage: string = 'An error occurred during authentication.'): string {
  if (!err) return defaultMessage;
  const rawMessage = err instanceof Error ? err.message : typeof err === 'object' && err !== null && 'message' in err ? String((err as any).message) : String(err);
  const lower = rawMessage.toLowerCase();

  if (
    lower.includes('load failed') ||
    lower.includes('failed to fetch') ||
    lower.includes('networkerror') ||
    lower.includes('network error')
  ) {
    return 'Unable to connect to the Supabase authentication server. Please check your internet connection or verify that NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables are configured correctly in your Vercel deployment.';
  }

  if (lower.includes('email_address_not_authorized') || lower.includes('not authorized')) {
    return 'Your email address is not authorized on this Supabase project. When using default Supabase SMTP, your recipient email address must be added as a member of your Supabase Organization team.';
  }

  if (lower.includes('rate limit') || lower.includes('too many requests') || lower.includes('over_email_send_rate_limit')) {
    return 'Default Supabase SMTP rate limit reached (2 emails per hour). Please wait 1 hour before retrying or configure Custom SMTP in your Supabase Dashboard.';
  }

  if (lower.includes('user_already_exists') || lower.includes('user already registered') || lower.includes('already exists')) {
    return 'An account with this email address already exists. Please sign in or use Magic Link.';
  }

  return rawMessage || defaultMessage;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const isConfigured = isSupabaseConfigured();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const sessionRef = useRef(session);
  const [loading, setLoading] = useState<boolean>(() => isConfigured);
  const [authEmail, setAuthEmail] = useState<string>('');
  const [authMode, setAuthMode] = useState<AuthMode | null>(null);
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

  useEffect(() => {
    sessionRef.current = session;
  }, [session]);

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
        // Enforce exact-once PKCE exchange guard (prevents duplicate runs from React StrictMode or re-renders)
        const sessionKey = `pkce_exchanged_${code}`;
        let alreadyExchanged = false;
        try {
          alreadyExchanged = Boolean(sessionStorage.getItem(sessionKey));
          if (!alreadyExchanged) {
            sessionStorage.setItem(sessionKey, 'true');
          }
        } catch {
          // Ignore storage quota/permission restrictions
        }

        // Clean query parameter from address bar immediately to prevent secondary triggers
        url.searchParams.delete('code');
        window.history.replaceState({}, document.title, url.pathname + (url.search ? url.search : ''));

        if (!alreadyExchanged) {
          supabase.auth
            .exchangeCodeForSession(code)
            .then(({ data, error }) => {
              if (!isSubscribed) return;
              if (error) {
                const errMsg = error.message.toLowerCase();
                if (errMsg.includes('already') || errMsg.includes('flow state not found') || errMsg.includes('invalid grant')) {
                  // Reused, expired, or duplicate code: report friendly notice unless session already restored
                  if (!sessionRef.current) {
                    setAuthNotice('This login link has expired or has already been used. Please request a new magic link.');
                  }
                } else if (errMsg.includes('network') || errMsg.includes('failed to fetch')) {
                  // Transient network error: allow retry on reload
                  try {
                    sessionStorage.removeItem(sessionKey);
                  } catch {
                    // Ignore
                  }
                  setAuthNotice('Network connection issue while verifying login code. Please check your connection and retry.');
                } else {
                  setAuthNotice('Unable to authenticate with this link. It may be invalid or expired.');
                }
              } else if (data.session) {
                setSession(data.session);
                setUser(data.user);
              }
            })
            .catch((err: unknown) => {
              if (!isSubscribed) return;
              // Transient exception: clear sessionKey to allow legitimate retry
              try {
                sessionStorage.removeItem(sessionKey);
              } catch {
                // Ignore
              }
              if (!sessionRef.current) {
                const message = err instanceof Error ? err.message : 'Authentication network request failed.';
                setAuthNotice(`Network error during authentication verification: ${message}`);
              }
            })
            .finally(() => {
              if (isSubscribed) {
                setLoading(false);
              }
            });
        }
      } else if (tokenHash && type) {
        // Enforce exact-once OTP verification guard
        const tokenKey = `token_verified_${tokenHash}`;
        let alreadyVerified = false;
        try {
          alreadyVerified = Boolean(sessionStorage.getItem(tokenKey));
          if (!alreadyVerified) {
            sessionStorage.setItem(tokenKey, 'true');
          }
        } catch {
          // Ignore storage quota/permission restrictions
        }

        // Clean query parameters from address bar immediately
        url.searchParams.delete('token_hash');
        url.searchParams.delete('type');
        window.history.replaceState({}, document.title, url.pathname + (url.search ? url.search : ''));

        if (!alreadyVerified) {
          supabase.auth
            .verifyOtp({ token_hash: tokenHash, type })
            .then(({ data, error }) => {
              if (!isSubscribed) return;
              if (error) {
                const errMsg = error.message.toLowerCase();
                if (errMsg.includes('already') || errMsg.includes('expired')) {
                  if (!sessionRef.current) {
                    setAuthNotice('This verification link has expired or has already been used.');
                  }
                } else if (errMsg.includes('network') || errMsg.includes('failed to fetch')) {
                  try {
                    sessionStorage.removeItem(tokenKey);
                  } catch {
                    // Ignore
                  }
                  setAuthNotice('Network issue while verifying account. Please refresh to retry.');
                } else {
                  setAuthNotice('Verification link is invalid or has expired.');
                }
              } else if (data.session) {
                setSession(data.session);
                setUser(data.user);
              }
            })
            .catch((err: unknown) => {
              if (!isSubscribed) return;
              try {
                sessionStorage.removeItem(tokenKey);
              } catch {
                // Ignore
              }
              if (!sessionRef.current) {
                setAuthNotice('Failed to connect to authentication server. Please check your connection.');
              }
            })
            .finally(() => {
              if (isSubscribed) {
                setLoading(false);
              }
            });
        }
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
      const redirectUrl = getAuthRedirectUrl('/auth/confirm?type=signup');

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
        return { success: false, error: formatAuthErrorMessage(error, 'Failed to create account.') };
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
        error: formatAuthErrorMessage(err, 'An unexpected error occurred during signup.'),
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
        return { success: false, error: formatAuthErrorMessage(error, 'Failed to sign in.') };
      }

      setSession(data.session);
      setUser(data.user);
      return { success: true };
    } catch (err: unknown) {
      return {
        success: false,
        error: formatAuthErrorMessage(err, 'Failed to sign in.'),
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
      const redirectUrl = getAuthRedirectUrl('/auth/confirm');

      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          emailRedirectTo: redirectUrl,
          shouldCreateUser: true,
        },
      });

      if (error) {
        return { success: false, error: formatAuthErrorMessage(error, 'Failed to send magic link.') };
      }

      return { success: true };
    } catch (err: unknown) {
      return {
        success: false,
        error: formatAuthErrorMessage(err, 'Failed to send magic link.'),
      };
    }
  };

  const resendConfirmationEmail = async (email: string) => {
    const supabase = getSupabase();
    if (!supabase) {
      return {
        success: false,
        error:
          'Supabase credentials are not configured in environment variables. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.',
      };
    }

    try {
      const redirectUrl = getAuthRedirectUrl('/auth/confirm?type=signup');
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email.trim(),
        options: {
          emailRedirectTo: redirectUrl,
        },
      });

      if (error) {
        return { success: false, error: formatAuthErrorMessage(error, 'Failed to resend confirmation email.') };
      }

      return { success: true };
    } catch (err: unknown) {
      return {
        success: false,
        error: formatAuthErrorMessage(err, 'Failed to resend confirmation email.'),
      };
    }
  };

  const verifyOtpCode = async (
    email: string,
    token: string,
    type: 'email' | 'signup' | 'magiclink' | 'recovery' = 'email'
  ) => {
    const supabase = getSupabase();
    if (!supabase) {
      return {
        success: false,
        error:
          'Supabase credentials are not configured in environment variables. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.',
      };
    }

    const cleanToken = token.trim();
    if (!cleanToken || cleanToken.length < 6) {
      return {
        success: false,
        error: 'Please enter a valid verification code.',
      };
    }

    try {
      // Explicitly map verification types: 'recovery' for password reset, 'signup' for confirmation, 'magiclink' or 'email'
      const otpType =
        type === 'recovery'
          ? 'recovery'
          : type === 'signup'
          ? 'signup'
          : type === 'magiclink'
          ? 'magiclink'
          : 'email';

      const { data, error } = await supabase.auth.verifyOtp({
        email: email.trim(),
        token: cleanToken,
        type: otpType as any,
      });

      if (error) {
        // Fallback attempt to generic 'email' type if a specific type failed
        if (type !== 'email') {
          const fallback = await supabase.auth.verifyOtp({
            email: email.trim(),
            token: cleanToken,
            type: 'email',
          });
          if (!fallback.error && fallback.data.session) {
            setSession(fallback.data.session);
            setUser(fallback.data.user);
            return { success: true };
          }
        }
        return { success: false, error: formatAuthErrorMessage(error, 'Verification failed.') };
      }

      if (data.session) {
        setSession(data.session);
        setUser(data.user);
      }

      return { success: true };
    } catch (err: unknown) {
      return {
        success: false,
        error: formatAuthErrorMessage(err, 'Failed to verify authentication code.'),
      };
    }
  };

  const verifyOtpTokenHash = async (
    tokenHash: string,
    type: 'email' | 'signup' | 'magiclink' | 'recovery' | 'invite' = 'email'
  ) => {
    const supabase = getSupabase();
    if (!supabase) {
      return {
        success: false,
        error:
          'Supabase credentials are not configured in environment variables. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.',
      };
    }

    const cleanHash = tokenHash.trim();
    if (!cleanHash) {
      return {
        success: false,
        error: 'Invalid authentication link parameter.',
      };
    }

    try {
      const otpType =
        type === 'recovery'
          ? 'recovery'
          : type === 'signup'
          ? 'signup'
          : type === 'magiclink'
          ? 'magiclink'
          : 'email';

      const { data, error } = await supabase.auth.verifyOtp({
        token_hash: cleanHash,
        type: otpType as any,
      });

      if (error) {
        if (otpType !== 'email') {
          const fallback = await supabase.auth.verifyOtp({
            token_hash: cleanHash,
            type: 'email',
          });
          if (!fallback.error && (fallback.data.session || fallback.data.user)) {
            if (fallback.data.session) {
              setSession(fallback.data.session);
              setUser(fallback.data.user);
            }
            return { success: true };
          }
        }
        return { success: false, error: formatAuthErrorMessage(error, 'Verification link is invalid or expired.') };
      }

      if (data.session) {
        setSession(data.session);
        setUser(data.user);
      } else if (data.user) {
        setUser(data.user);
      }

      return { success: true };
    } catch (err: unknown) {
      return {
        success: false,
        error: formatAuthErrorMessage(err, 'Failed to verify token link.'),
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
      const redirectUrl = getAuthRedirectUrl('/auth/confirm?type=recovery');

      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: redirectUrl,
      });

      if (error) {
        return { success: false, error: formatAuthErrorMessage(error, 'Failed to initiate password reset.') };
      }

      return { success: true };
    } catch (err: unknown) {
      return {
        success: false,
        error: formatAuthErrorMessage(err, 'Failed to initiate password reset.'),
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
        authMode,
        setAuthMode,
        authNotice,
        clearAuthNotice,
        signUp,
        signIn,
        signInWithMagicLink,
        resendConfirmationEmail,
        verifyOtpCode,
        verifyOtpTokenHash,
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
