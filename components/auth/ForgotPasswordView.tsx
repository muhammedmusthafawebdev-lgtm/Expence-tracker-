'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';
import { AuthLayout } from './AuthLayout';
import { Loader2, AlertCircle } from 'lucide-react';

export function ForgotPasswordView() {
  const { setCurrentScreen } = useApp();
  const { setAuthEmail, resetPasswordForEmail, isConfigured } = useAuth();

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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
      const result = await resetPasswordForEmail(trimmed);
      setLoading(false);
      if (!result.success) {
        setErrorMessage(result.error || 'Failed to dispatch password recovery email.');
        return;
      }
    } else {
      await new Promise((resolve) => setTimeout(resolve, 500));
      setLoading(false);
    }

    setAuthEmail(trimmed);
    setCurrentScreen('check-inbox');
  };

  return (
    <AuthLayout backTo="login" backLabel="Back to login">
      <div className="bg-white dark:bg-[#0E0E11] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-xs w-full">
        <div className="mb-6 text-center">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white mb-1.5">
            Reset your password
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Enter your email and we&apos;ll send instructions to reset your password.
          </p>
        </div>

        {errorMessage && (
          <div className="mb-5 p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 flex items-start gap-2.5 text-xs text-red-700 dark:text-red-400">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="leading-relaxed">{errorMessage}</div>
          </div>
        )}

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
                <span>Sending link...</span>
              </>
            ) : (
              <span>Send reset link</span>
            )}
          </button>
        </form>

        <div className="mt-5 pt-5 border-t border-slate-100 dark:border-slate-850/80 text-center">
          <button
            type="button"
            onClick={() => setCurrentScreen('login')}
            className="text-xs text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
          >
            Back to login
          </button>
        </div>
      </div>
    </AuthLayout>
  );
}
