'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';
import { AuthLayout } from './AuthLayout';
import { Mail, RotateCw, ExternalLink, Loader2, AlertCircle, KeyRound } from 'lucide-react';

export function CheckInboxView() {
  const { setCurrentScreen } = useApp();
  const {
    authEmail,
    authMode,
    resendConfirmationEmail,
    resetPasswordForEmail,
    signInWithMagicLink,
    verifyOtpCode,
    isConfigured,
  } = useAuth();

  const [otpCode, setOtpCode] = useState<string>('');
  const [verifying, setVerifying] = useState<boolean>(false);
  const [countdown, setCountdown] = useState<number>(60);
  const [resending, setResending] = useState(false);
  const [resendStatus, setResendStatus] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanCode = otpCode.trim();
    if (!cleanCode || cleanCode.length < 6) {
      setErrorMessage('Please enter the 6-digit verification code from your email.');
      return;
    }

    if (!authEmail) {
      setErrorMessage('Email address missing. Please return to login and try again.');
      return;
    }

    setVerifying(true);
    try {
      const targetType = authMode === 'signup' ? 'signup' : authMode === 'recovery' ? 'recovery' : 'magiclink';
      const result = await verifyOtpCode(authEmail, cleanCode, targetType);
      setVerifying(false);

      if (!result.success) {
        setErrorMessage(result.error || 'Verification code is invalid or has expired.');
        return;
      }

      if (authMode === 'recovery') {
        setCurrentScreen('reset-password');
      } else {
        setCurrentScreen('dashboard');
      }
    } catch (err: unknown) {
      setVerifying(false);
      setErrorMessage(
        err instanceof Error ? err.message : 'An error occurred while verifying the code.'
      );
    }
  };

  const handleResend = async () => {
    if (countdown > 0 || resending) return;
    setResending(true);
    setResendStatus(null);
    setErrorMessage(null);

    if (isConfigured && authEmail) {
      if (authMode === 'signup') {
        const res = await resendConfirmationEmail(authEmail);
        if (!res.success) {
          setErrorMessage(res.error || 'Failed to resend confirmation email.');
          setResending(false);
          return;
        }
      } else if (authMode === 'recovery') {
        const res = await resetPasswordForEmail(authEmail);
        if (!res.success) {
          setErrorMessage(res.error || 'Failed to resend password recovery email.');
          setResending(false);
          return;
        }
      } else {
        const res = await signInWithMagicLink(authEmail);
        if (!res.success) {
          setErrorMessage(res.error || 'Failed to resend magic link.');
          setResending(false);
          return;
        }
      }
    }

    setResending(false);
    setCountdown(60);
    setResendStatus('A new confirmation email has been dispatched to your inbox.');
  };

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
      <div className="bg-white dark:bg-[#0E0E11] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-xs w-full text-center">
        {/* Mail Icon */}
        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 mx-auto flex items-center justify-center mb-4 sm:mb-5">
          <Mail className="w-6 h-6 sm:w-7 sm:h-7" />
        </div>

        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white mb-2">
          Check your inbox
        </h1>

        <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 leading-relaxed max-w-sm mx-auto">
          We&apos;ve sent an authentication link and code to{' '}
          <span className="font-semibold text-slate-800 dark:text-slate-200 break-all">
            {authEmail || 'your email address'}
          </span>
          . You can click the link in your email or enter your 6-digit code below.
        </p>

        {errorMessage && (
          <div className="mb-5 p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 flex items-start gap-2.5 text-xs text-red-700 dark:text-red-400 text-left">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600 dark:text-red-400" />
            <div className="leading-relaxed">{errorMessage}</div>
          </div>
        )}

        {resendStatus && (
          <div className="mb-5 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 text-xs border border-emerald-200 dark:border-emerald-900/40">
            {resendStatus}
          </div>
        )}

        {/* 6-Digit Code Entry Fallback */}
        <form onSubmit={handleVerifyOtp} className="mb-6 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 text-left">
          <div className="flex items-center gap-2 mb-2">
            <KeyRound className="w-4 h-4 text-slate-500 dark:text-slate-400" />
            <label className="text-xs font-semibold text-slate-800 dark:text-slate-200">
              Enter 6-digit verification code
            </label>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-3">
            If your email link expired or was pre-scanned by your mail app, enter the numeric code here.
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, '').slice(0, 8))}
              placeholder="123456"
              maxLength={8}
              inputMode="numeric"
              autoComplete="one-time-code"
              className="flex-1 px-3.5 py-2 rounded-xl text-center font-mono tracking-widest text-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white text-slate-900 dark:text-white"
            />
            <button
              type="submit"
              disabled={verifying || otpCode.length < 6}
              className="py-2 px-4 rounded-xl font-medium text-xs bg-slate-900 dark:bg-white text-white dark:text-black hover:bg-slate-800 dark:hover:bg-slate-100 disabled:opacity-40 transition-all flex items-center justify-center gap-1.5 min-h-[44px]"
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

        <div className="space-y-3 mb-6">
          <a
            href={getEmailProviderLink(authEmail)}
            target="_blank"
            rel="noreferrer noopener"
            className="w-full py-3 px-4 rounded-xl font-medium text-sm bg-blue-600 hover:bg-blue-700 text-white transition-colors flex items-center justify-center gap-2 shadow-xs min-h-[44px]"
          >
            <span>Open Email Inbox</span>
            <ExternalLink className="w-4 h-4" />
          </a>

          <button
            type="button"
            disabled={countdown > 0 || resending}
            onClick={handleResend}
            className="w-full py-2.5 px-4 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white disabled:opacity-40 transition-colors flex items-center justify-center gap-1.5 min-h-[44px]"
          >
            <RotateCw className={`w-3.5 h-3.5 ${resending ? 'animate-spin' : ''}`} />
            <span>
              {countdown > 0 ? `Resend email in ${countdown}s` : 'Resend confirmation email'}
            </span>
          </button>
        </div>

        <div className="pt-4 border-t border-slate-100 dark:border-slate-850/80">
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
