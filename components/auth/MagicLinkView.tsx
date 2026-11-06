'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';
import { AuthLayout } from './AuthLayout';
import { Mail, Loader2, AlertCircle, CheckCircle2, ArrowRight, ExternalLink } from 'lucide-react';

export function MagicLinkView() {
  const { setCurrentScreen, userProfile, updateProfile } = useApp();
  const {
    signInWithMagicLink,
    verifyOtpCode,
    setAuthEmail,
    setAuthMode,
    isConfigured,
    authNotice,
    clearAuthNotice,
  } = useAuth();

  const [email, setEmail] = useState(() => userProfile.email || '');
  const [otpCode, setOtpCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [sentSuccess, setSentSuccess] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const displayError = errorMessage || authNotice;

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    clearAuthNotice();

    const trimmed = email.trim().toLowerCase();
    if (!trimmed || !/\S+@\S+\.\S+/.test(trimmed)) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    if (!isConfigured) {
      setErrorMessage(
        'Supabase credentials are not configured in environment variables. Please configure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to enable live email delivery.'
      );
      return;
    }

    setLoading(true);

    try {
      const result = await signInWithMagicLink(trimmed);
      setLoading(false);

      if (!result.success) {
        setErrorMessage(result.error || 'Failed to dispatch magic link. Please try again.');
        return;
      }

      // Update local profile email tracking
      void updateProfile({
        email: trimmed,
        name: userProfile.name || trimmed.split('@')[0],
      });

      setSentSuccess(true);
      setCountdown(60);
      setAuthEmail(trimmed);
      setAuthMode('magiclink');
    } catch (err: unknown) {
      setLoading(false);
      setErrorMessage(
        err instanceof Error ? err.message : 'An unexpected error occurred while sending the magic link.'
      );
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanCode = otpCode.trim();
    if (!cleanCode || cleanCode.length < 6) {
      setErrorMessage('Please enter the 6-digit verification code from your email.');
      return;
    }

    setVerifying(true);
    try {
      const result = await verifyOtpCode(email.trim().toLowerCase(), cleanCode, 'magiclink');
      setVerifying(false);

      if (!result.success) {
        setErrorMessage(result.error || 'Verification code is invalid or has expired.');
        return;
      }

      setCurrentScreen('dashboard');
    } catch (err: unknown) {
      setVerifying(false);
      setErrorMessage(
        err instanceof Error ? err.message : 'An error occurred while verifying the code.'
      );
    }
  };

  // Determine email provider link
  const getEmailProviderLink = (emailAddress: string) => {
    const domain = emailAddress.split('@')[1]?.toLowerCase();
    if (domain === 'gmail.com') return 'https://mail.google.com';
    if (domain === 'outlook.com' || domain === 'hotmail.com') return 'https://outlook.live.com';
    if (domain === 'yahoo.com') return 'https://mail.yahoo.com';
    if (domain === 'icloud.com') return 'https://www.icloud.com/mail';
    return `mailto:${emailAddress}`;
  };

  return (
    <AuthLayout backTo="login" backLabel="Back to login">
      <div className="bg-white dark:bg-[#0E0E11] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-xs w-full">
        {/* Header Icon */}
        <div className="mb-6 text-center">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 mx-auto flex items-center justify-center mb-3">
            <Mail className="w-5 h-5" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white mb-1.5">
            Sign in with Magic Link
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            We&apos;ll send a passwordless login link directly to your inbox.
          </p>
        </div>

        {displayError && (
          <div className="mb-5 p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 flex items-start gap-2.5 text-xs text-red-700 dark:text-red-400">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600 dark:text-red-400" />
            <div className="leading-relaxed">{displayError}</div>
          </div>
        )}

        {sentSuccess ? (
          <div className="space-y-5 text-center">
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-900/40 text-left flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div className="space-y-1 text-xs">
                <p className="font-semibold text-slate-900 dark:text-white">Magic link dispatched</p>
                <p className="text-[12px] text-slate-600 dark:text-slate-300 leading-relaxed">
                  We sent a login link and code to <span className="font-semibold text-slate-900 dark:text-white break-all">{email}</span>. You can tap the link or enter the 6-digit code below.
                </p>
              </div>
            </div>

            {/* 6-Digit Code Fallback Form */}
            <form onSubmit={handleVerifyOtp} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 text-left">
              <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Or enter the 6-digit code from your email:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, '').slice(0, 8))}
                  placeholder="123456"
                  maxLength={8}
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  className="flex-1 px-3 py-2 rounded-xl text-center font-mono tracking-widest text-base bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white text-slate-900 dark:text-white"
                />
                <button
                  type="submit"
                  disabled={verifying || otpCode.length < 6}
                  className="py-2 px-3.5 rounded-xl font-medium text-xs bg-slate-900 dark:bg-white text-white dark:text-black hover:bg-slate-800 dark:hover:bg-slate-100 disabled:opacity-40 transition-all flex items-center justify-center gap-1.5 min-h-[40px]"
                >
                  {verifying ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Verifying...</span>
                    </>
                  ) : (
                    <span>Verify Code</span>
                  )}
                </button>
              </div>
            </form>

            <div className="space-y-2">
              <a
                href={getEmailProviderLink(email)}
                target="_blank"
                rel="noreferrer noopener"
                className="w-full py-3 px-4 rounded-xl font-medium text-sm bg-blue-600 hover:bg-blue-700 text-white transition-colors flex items-center justify-center gap-2 shadow-xs min-h-[44px]"
              >
                <span>Open Email Inbox</span>
                <ExternalLink className="w-4 h-4" />
              </a>

              <button
                type="button"
                disabled={countdown > 0}
                onClick={handleSubmit}
                className="text-xs font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white disabled:opacity-40 transition-colors py-2 min-h-[44px] flex items-center justify-center w-full"
              >
                {countdown > 0 ? `Resend magic link in ${countdown}s` : 'Resend magic link email'}
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
                  <span>Dispatching link...</span>
                </>
              ) : (
                <span>Send Magic Link</span>
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
