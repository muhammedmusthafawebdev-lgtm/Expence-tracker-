'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';
import { AuthLayout } from './AuthLayout';
import { Sparkles, Loader2, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';

export function MagicLinkView() {
  const { setCurrentScreen } = useApp();
  const { signInWithMagicLink, isConfigured } = useAuth();

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [sentSuccess, setSentSuccess] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmed = email.trim();
    if (!trimmed || !/\S+@\S+\.\S+/.test(trimmed)) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    setLoading(true);

    if (isConfigured) {
      const result = await signInWithMagicLink(trimmed);
      setLoading(false);
      if (!result.success) {
        setErrorMessage(result.error || 'Failed to dispatch magic link.');
        return;
      }
      setSentSuccess(true);
      setCountdown(60);
    } else {
      await new Promise((resolve) => setTimeout(resolve, 400));
      setLoading(false);
      setSentSuccess(true);
      setCountdown(60);
    }
  };

  return (
    <AuthLayout backTo="login" backLabel="Back to login">
      <div className="bg-white dark:bg-[#0E0E11] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-xs w-full">
        <div className="mb-6 text-center">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 mx-auto flex items-center justify-center mb-3">
            <Sparkles className="w-5 h-5" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white mb-1.5">
            Sign in with Magic Link
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            We&apos;ll send a passwordless login link directly to your inbox.
          </p>
        </div>

        {errorMessage && (
          <div className="mb-5 p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 flex items-start gap-2.5 text-xs text-red-700 dark:text-red-400">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="leading-relaxed">{errorMessage}</div>
          </div>
        )}

        {sentSuccess ? (
          <div className="space-y-5 text-center">
            <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-900/40 text-blue-900 dark:text-blue-300 text-xs leading-relaxed flex items-start gap-3 text-left">
              <CheckCircle2 className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-semibold">Frontend-Only Phase Notice</p>
                <p className="text-[11px] text-blue-800/80 dark:text-blue-300/80">
                  Magic link request for <span className="font-semibold break-all">{email}</span> validated successfully. Passwordless OTP emails will be dispatched once Supabase Auth is integrated by the backend engineer.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <button
                type="button"
                onClick={() => setCurrentScreen('dashboard')}
                className="w-full py-3 px-4 rounded-xl font-medium text-sm bg-slate-900 dark:bg-white text-white dark:text-black hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors flex items-center justify-center gap-2 shadow-xs min-h-[44px]"
              >
                <span>Explore Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                disabled={countdown > 0}
                onClick={handleSubmit}
                className="text-xs font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white disabled:opacity-40 transition-colors py-2 min-h-[44px] flex items-center justify-center w-full"
              >
                {countdown > 0 ? `Resend link in ${countdown}s` : 'Resend magic link'}
              </button>
            </div>
          </div>
        ) : (
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

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl font-medium text-sm bg-slate-900 dark:bg-white text-white dark:text-black hover:bg-slate-800 dark:hover:bg-slate-100 disabled:opacity-60 transition-all duration-150 flex items-center justify-center gap-2 shadow-xs min-h-[44px]"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Validating...</span>
                </>
              ) : (
                <span>Send magic link</span>
              )}
            </button>
          </form>
        )}

        <div className="mt-5 pt-5 border-t border-slate-100 dark:border-slate-850/80 text-center">
          <button
            type="button"
            onClick={() => setCurrentScreen('login')}
            className="text-xs text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors py-2 min-h-[40px]"
          >
            Back to password login
          </button>
        </div>
      </div>
    </AuthLayout>
  );
}
