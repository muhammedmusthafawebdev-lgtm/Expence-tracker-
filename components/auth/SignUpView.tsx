'use client';

import React, { useState, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';
import { AuthLayout } from './AuthLayout';
import { Eye, EyeOff, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';

export function SignUpView() {
  const { setCurrentScreen, updateProfile } = useApp();
  const { signUp, isConfigured, setAuthEmail, setAuthMode } = useAuth();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Password strength evaluation
  const passwordStrength = useMemo<{
    score: number;
    label: string;
    color: string;
  }>(() => {
    if (!password) return { score: 0, label: '', color: '' };
    let score = 0;
    if (password.length >= 8) score += 1;
    if (password.length >= 12) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;

    if (score <= 1) return { score: 1, label: 'Weak', color: 'bg-red-500' };
    if (score <= 3) return { score: 2, label: 'Fair', color: 'bg-amber-500' };
    return { score: 3, label: 'Strong', color: 'bg-emerald-500' };
  }, [password]);

  const passwordsMatch = confirmPassword.length > 0 && password === confirmPassword;
  const passwordsMismatch = confirmPassword.length > 0 && password !== confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmedName = fullName.trim();
    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedName || trimmedName.length < 2) {
      setErrorMessage('Please enter your full name (minimum 2 characters).');
      return;
    }
    if (!trimmedEmail || !/\S+@\S+\.\S+/.test(trimmedEmail)) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }
    if (password.length < 8) {
      setErrorMessage('Password must be at least 8 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    if (!isConfigured) {
      setErrorMessage(
        'Supabase is not configured in this environment. Please configure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to register accounts.'
      );
      return;
    }

    setLoading(true);

    try {
      const result = await signUp(trimmedEmail, password, trimmedName);
      setLoading(false);

      if (!result.success) {
        setErrorMessage(result.error || 'Failed to create account.');
        return;
      }

      setAuthEmail(trimmedEmail);
      void updateProfile({
        name: trimmedName,
        email: trimmedEmail,
      });

      // If email confirmation is required by Supabase, show check-inbox screen
      // Do NOT redirect to dashboard before authentication is established
      if (result.requiresEmailConfirmation) {
        setAuthMode('signup');
        setCurrentScreen('check-inbox');
      } else {
        setCurrentScreen('dashboard');
      }
    } catch (err: unknown) {
      setLoading(false);
      setErrorMessage(
        err instanceof Error ? err.message : 'An unexpected error occurred during signup.'
      );
    }
  };

  return (
    <AuthLayout backTo="welcome">
      <div className="bg-white dark:bg-[#0E0E11] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-xs w-full">
        {/* Header */}
        <div className="mb-6 text-center">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white mb-1.5">
            Create your account
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Start tracking your personal finances with clarity and discipline.
          </p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-5 p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 flex items-start gap-2.5 text-xs text-red-700 dark:text-red-400">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600 dark:text-red-400" />
            <div className="leading-relaxed">{errorMessage}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Full Name
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Aarav Sharma"
              autoComplete="name"
              required
              className="w-full px-3.5 py-2.5 rounded-xl text-base sm:text-sm bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white transition-all text-slate-900 dark:text-white placeholder:text-slate-400 min-h-[44px]"
            />
          </div>

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
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Password
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
            {password.length > 0 && (
              <div className="mt-2 flex items-center justify-between">
                <div className="flex gap-1.5 w-24">
                  <div
                    className={`h-1 flex-1 rounded-full ${
                      passwordStrength.score >= 1 ? passwordStrength.color : 'bg-slate-200 dark:bg-slate-800'
                    }`}
                  />
                  <div
                    className={`h-1 flex-1 rounded-full ${
                      passwordStrength.score >= 2 ? passwordStrength.color : 'bg-slate-200 dark:bg-slate-800'
                    }`}
                  />
                  <div
                    className={`h-1 flex-1 rounded-full ${
                      passwordStrength.score >= 3 ? passwordStrength.color : 'bg-slate-200 dark:bg-slate-800'
                    }`}
                  />
                </div>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                  {passwordStrength.label}
                </span>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Confirm Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
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
                <span>Registering account...</span>
              </>
            ) : (
              <span>Create account</span>
            )}
          </button>
        </form>

        <div className="mt-5 pt-5 border-t border-slate-100 dark:border-slate-850/80 text-center">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Already have an account?{' '}
            <button
              type="button"
              onClick={() => setCurrentScreen('login')}
              className="font-medium text-slate-900 dark:text-white underline underline-offset-4 hover:opacity-80 transition-opacity"
            >
              Log in
            </button>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
}
