'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';
import { AuthLayout } from './AuthLayout';
import { Mail, RotateCw, ExternalLink } from 'lucide-react';

export function CheckInboxView() {
  const { setCurrentScreen } = useApp();
  const { authEmail, resetPasswordForEmail, signInWithMagicLink, isConfigured } = useAuth();

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
      await signInWithMagicLink(authEmail);
    }
    setResending(false);
    setCountdown(60);
    setResendStatus('A new confirmation link has been sent to your inbox.');
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
          We&apos;ve sent an authentication link to{' '}
          <span className="font-semibold text-slate-800 dark:text-slate-200 break-all">
            {authEmail || 'your email address'}
          </span>
          . Please click the link in your email to authenticate and access your account.
        </p>

        {resendStatus && (
          <div className="mb-5 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 text-xs border border-emerald-200 dark:border-emerald-900/40">
            {resendStatus}
          </div>
        )}

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
              {countdown > 0 ? `Resend email in ${countdown}s` : 'Resend confirmation link'}
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
