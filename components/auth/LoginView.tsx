'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';
import { AuthLayout } from './AuthLayout';
import { Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react';

export function LoginView() {
  const { setCurrentScreen, userProfile, updateProfile } = useApp();
  const { signIn, isConfigured, authNotice, clearAuthNotice } = useAuth();

  const [email, setEmail] = useState(() => userProfile.email || '');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const displayError = errorMessage || authNotice;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    clearAuthNotice();

    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail) {
      setErrorMessage('Please enter your email address.');
      return;
    }
    if (!/\S+@\S+\.\S+/.test(trimmedEmail)) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }
    if (!password) {
      setErrorMessage('Please enter your password.');
      return;
    }

    if (!isConfigured) {
      setErrorMessage(
        'Supabase is not configured in this environment. Please configure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to sign in.'
      );
      return;
    }

    setLoading(true);

    try {
      const result = await signIn(trimmedEmail, password);
      setLoading(false);

      if (!result.success) {
        setErrorMessage(result.error || 'Failed to sign in. Please verify your credentials.');
        return;
      }

      // Synchronize profile email
      void updateProfile({
        email: trimmedEmail,
        name: userProfile.name || trimmedEmail.split('@')[0],
      });

      setCurrentScreen('dashboard');
    } catch (err: unknown) {
      setLoading(false);
      setErrorMessage(
        err instanceof Error ? err.message : 'An unexpected error occurred during sign in.'
      );
    }
  };

  return (
    <AuthLayout backTo="welcome">
      <div className="bg-white dark:bg-[#0E0E11] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-xs w-full">
        {/* Header */}
        <div className="mb-6 text-center">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white mb-1.5">
            Welcome back
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Sign in to access your ledger, budgets, and savings goals.
          </p>
        </div>

        {/* Error Alert */}
        {displayError && (
          <div className="mb-5 p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 flex items-start gap-2.5 text-xs text-red-700 dark:text-red-400">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600 dark:text-red-400" />
            <div className="leading-relaxed">{displayError}</div>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Email address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              autoComplete="email"
              required
              className="w-full px-3.5 py-2.5 rounded-xl text-base sm:text-sm bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white transition-all text-slate-900 dark:text-white placeholder:text-slate-400 min-h-[44px]"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                Password
              </label>
              <button
                type="button"
                onClick={() => setCurrentScreen('forgot-password')}
                className="text-xs text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors py-1 min-h-[32px] flex items-center"
              >
                Forgot password?
              </button>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                required
                className="w-full px-3.5 py-2.5 rounded-xl text-base sm:text-sm bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white transition-all text-slate-900 dark:text-white pr-10 min-h-[44px]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-2 min-w-[40px] min-h-[40px] flex items-center justify-center"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl font-medium text-sm bg-slate-900 dark:bg-white text-white dark:text-black hover:bg-slate-800 dark:hover:bg-slate-100 disabled:opacity-60 transition-all duration-150 flex items-center justify-center gap-2 shadow-xs min-h-[44px]"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Signing in...</span>
              </>
            ) : (
              <span>Sign in</span>
            )}
          </button>
        </form>

        {/* Secondary Options */}
        <div className="mt-5 pt-5 border-t border-slate-100 dark:border-slate-850/80 space-y-3 text-center">
          <button
            type="button"
            onClick={() => setCurrentScreen('magic-link')}
            className="text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium transition-colors"
          >
            Sign in with a Magic Link
          </button>

          <div className="text-xs text-slate-500 dark:text-slate-400">
            Don&apos;t have an account?{' '}
            <button
              type="button"
              onClick={() => setCurrentScreen('signup')}
              className="font-medium text-slate-900 dark:text-white underline underline-offset-4 hover:opacity-80 transition-opacity"
            >
              Sign up
            </button>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
}
