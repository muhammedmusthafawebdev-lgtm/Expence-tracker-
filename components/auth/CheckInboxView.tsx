'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';
import { AuthLayout } from './AuthLayout';
import { Mail, ArrowRight, RotateCw } from 'lucide-react';

export function CheckInboxView() {
  const { setCurrentScreen } = useApp();
  const { authEmail, resetPasswordForEmail, isConfigured } = useAuth();

  const [countdown, setCountdown] = useState<number>(60);
  const [resending, setResending] = useState(false);
  const [resendStatus, setResendStatus] = useState<string | null>(null);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleResend = async () => {
    if (countdown > 0 || resending) return;
    setResending(true);
    setResendStatus(null);

    if (isConfigured && authEmail) {
      await resetPasswordForEmail(authEmail);
    }
    setResending(false);
    setCountdown(60);
    setResendStatus('A new link has been sent to your inbox.');
  };

  return (
    <AuthLayout backTo="login" backLabel="Back to login">
      <div className="bg-white dark:bg-[#0E0E11] border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-7 sm:p-9 shadow-sm text-center">
        {/* Mail Icon */}
        <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 mx-auto flex items-center justify-center mb-5">
          <Mail className="w-7 h-7" />
        </div>

        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white mb-2">
          Check your inbox
        </h1>

        <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 leading-relaxed max-w-sm mx-auto">
          We&apos;ve sent an authentication link to{' '}
          <span className="font-semibold text-slate-800 dark:text-slate-200">
            {authEmail || 'your email address'}
          </span>
          . Click the link to complete verification or reset your password.
        </p>

        {resendStatus && (
          <div className="mb-5 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 text-xs border border-emerald-200 dark:border-emerald-900/40">
            {resendStatus}
          </div>
        )}

        {/* Simulating reset password step */}
        <div className="space-y-3 mb-6">
          <button
            type="button"
            onClick={() => setCurrentScreen('reset-password')}
            className="w-full py-3 px-4 rounded-xl font-medium text-sm bg-slate-900 dark:bg-white text-white dark:text-black hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors flex items-center justify-center gap-2 shadow-xs"
          >
            <span>Proceed to set new password</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            type="button"
            disabled={countdown > 0 || resending}
            onClick={handleResend}
            className="w-full py-2.5 px-4 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white disabled:opacity-40 transition-colors flex items-center justify-center gap-1.5"
          >
            <RotateCw className={`w-3.5 h-3.5 ${resending ? 'animate-spin' : ''}`} />
            <span>
              {countdown > 0 ? `Resend email in ${countdown}s` : 'Resend email link'}
            </span>
          </button>
        </div>

        <div className="pt-4 border-t border-slate-100 dark:border-slate-850/80">
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
