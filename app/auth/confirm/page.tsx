'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { ShieldCheck, Loader2, AlertCircle, ArrowRight, Wallet } from 'lucide-react';

function AuthConfirmContent() {
  const searchParams = useSearchParams();
  const tokenHash = searchParams.get('token_hash') || searchParams.get('token') || '';
  const type = (searchParams.get('type') as any) || 'email';

  const { verifyOtpTokenHash, isConfigured } = useAuth();

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleContinue = async () => {
    setErrorMessage(null);

    if (!tokenHash) {
      setErrorMessage(
        'Invalid or incomplete authentication link. Please request a new Magic Link.'
      );
      return;
    }

    if (!isConfigured) {
      setErrorMessage(
        'Supabase is not configured in environment variables. Please check NEXT_PUBLIC_SUPABASE_URL.'
      );
      return;
    }

    setLoading(true);

    try {
      const result = await verifyOtpTokenHash(tokenHash, type);
      setLoading(false);

      if (!result.success) {
        setErrorMessage(
          result.error ||
            'This authentication link has expired or has already been used. Please request a new Magic Link.'
        );
        return;
      }

      // Route to password reset screen for recovery, or home dashboard for session logins
      if (type === 'recovery') {
        window.location.href = '/?view=reset-password';
      } else {
        window.location.href = '/';
      }
    } catch (err: unknown) {
      setLoading(false);
      setErrorMessage(
        err instanceof Error
          ? err.message
          : 'An unexpected error occurred while confirming your session.'
      );
    }
  };

  return (
    <div className="bg-white dark:bg-[#0E0E11] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-xs w-full text-center">
      {/* Brand Badge */}
      <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 mx-auto flex items-center justify-center mb-4">
        <ShieldCheck className="w-6 h-6" />
      </div>

      <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white mb-2">
        {type === 'recovery' ? 'Confirm Password Reset' : 'Confirm Your Session'}
      </h1>

      <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 leading-relaxed max-w-sm mx-auto">
        Click the button below to securely confirm your link and enter your Expense Tracker account.
      </p>

      {errorMessage && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-left text-xs text-red-700 dark:text-red-400 flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600 dark:text-red-400" />
          <div className="leading-relaxed">{errorMessage}</div>
        </div>
      )}

      {errorMessage ? (
        <Link
          href="/"
          className="w-full py-3 px-4 rounded-xl font-medium text-sm bg-slate-900 dark:bg-white text-white dark:text-black hover:bg-slate-800 dark:hover:bg-slate-100 transition-all flex items-center justify-center gap-2 shadow-xs min-h-[44px]"
        >
          <span>Return to Login & Request New Link</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      ) : (
        <button
          type="button"
          disabled={loading || !tokenHash}
          onClick={handleContinue}
          className="w-full py-3 px-4 rounded-xl font-medium text-sm bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-60 transition-all duration-150 flex items-center justify-center gap-2 shadow-xs min-h-[44px]"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Verifying Session...</span>
            </>
          ) : (
            <>
              <span>Continue to Expense Tracker</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      )}
    </div>
  );
}

export default function AuthConfirmPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#070709] text-slate-900 dark:text-slate-100 flex flex-col justify-between p-4 sm:p-6">
      {/* Header */}
      <header className="w-full max-w-md mx-auto flex items-center justify-between py-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-black flex items-center justify-center font-bold text-sm">
            <Wallet className="w-4 h-4" />
          </div>
          <span className="font-bold text-sm tracking-tight">Expense Tracker</span>
        </div>
      </header>

      {/* Main Container */}
      <main className="w-full max-w-md mx-auto my-auto py-6">
        <Suspense
          fallback={
            <div className="p-8 text-center bg-white dark:bg-[#0E0E11] rounded-3xl border border-slate-200 dark:border-slate-800">
              <Loader2 className="w-6 h-6 animate-spin mx-auto text-blue-600 mb-2" />
              <p className="text-xs text-slate-500">Loading confirmation interface...</p>
            </div>
          }
        >
          <AuthConfirmContent />
        </Suspense>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-md mx-auto text-center py-4">
        <p className="text-[11px] text-slate-400 dark:text-slate-600">
          Private & secure financial tracking. Integer-precision ledger.
        </p>
      </footer>
    </div>
  );
}
