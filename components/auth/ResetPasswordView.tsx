'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';
import { AuthLayout } from './AuthLayout';
import { Eye, EyeOff, Loader2, AlertCircle, CheckCircle2, Info, ArrowRight } from 'lucide-react';

export function ResetPasswordView() {
  const { setCurrentScreen } = useApp();
  const { updatePassword, isConfigured } = useAuth();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submittedNotice, setSubmittedNotice] = useState(false);

  const passwordsMatch = confirmPassword.length > 0 && password === confirmPassword;
  const passwordsMismatch = confirmPassword.length > 0 && password !== confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (password.length < 8) {
      setErrorMessage('New password must be at least 8 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    setLoading(true);

    if (isConfigured) {
      const result = await updatePassword(password);
      setLoading(false);
      if (!result.success) {
        setErrorMessage(result.error || 'Failed to update password.');
        return;
      }
      setSubmittedNotice(true);
    } else {
      await new Promise((resolve) => setTimeout(resolve, 500));
      setLoading(false);
      setSubmittedNotice(true);
    }
  };

  return (
    <AuthLayout backTo="login" backLabel="Back to login">
      <div className="bg-white dark:bg-[#0E0E11] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-xs w-full">
        <div className="mb-6 text-center">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white mb-1.5">
            Set new password
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Your new password must be at least 8 characters long.
          </p>
        </div>

        {errorMessage && (
          <div className="mb-5 p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 flex items-start gap-2.5 text-xs text-red-700 dark:text-red-400">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="leading-relaxed">{errorMessage}</div>
          </div>
        )}

        {submittedNotice ? (
          <div className="space-y-5 text-center">
            <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-900/40 text-left text-xs leading-relaxed space-y-2">
              <div className="flex items-center gap-2 font-semibold text-blue-900 dark:text-blue-300">
                <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                <span>Frontend-Only Phase Notice</span>
              </div>
              <p className="text-blue-800/90 dark:text-blue-300/80">
                Password format and confirmation match verified successfully. In the backend phase, Supabase Auth will update your actual account credentials.
              </p>
              <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                No mock password updates were saved to storage.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setCurrentScreen('login')}
              className="w-full py-3 px-4 rounded-xl font-medium text-sm bg-slate-900 dark:bg-white text-white dark:text-black hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors flex items-center justify-center gap-2 shadow-xs min-h-[44px]"
            >
              <span>Return to Login</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  autoComplete="new-password"
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

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  autoComplete="new-password"
                  required
                  className={`w-full px-3.5 py-2.5 rounded-xl text-base sm:text-sm bg-slate-50 dark:bg-slate-900/80 border focus:outline-none focus:ring-2 transition-all text-slate-900 dark:text-white pr-10 min-h-[44px] ${
                    passwordsMismatch
                      ? 'border-red-300 dark:border-red-800 focus:ring-red-500'
                      : passwordsMatch
                      ? 'border-emerald-300 dark:border-emerald-800 focus:ring-emerald-500'
                      : 'border-slate-200 dark:border-slate-800 focus:ring-slate-900 dark:focus:ring-white'
                  }`}
                />
                {passwordsMatch && (
                  <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500 pointer-events-none" />
                )}
              </div>
              {passwordsMismatch && (
                <p className="mt-1 text-[11px] text-red-500">Passwords do not match</p>
              )}
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
                <span>Update password</span>
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
            Back to login
          </button>
        </div>
      </div>
    </AuthLayout>
  );
}
