import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Wallet } from 'lucide-react';

export const metadata = {
  title: '404 - Page Not Found | Expense Tracker',
  description: 'The requested page could not be found.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#FBFBFD] dark:bg-[#000000] text-slate-900 dark:text-white px-4 py-8">
      {/* Minimal Header */}
      <header className="max-w-4xl mx-auto w-full flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-2.5 text-slate-900 dark:text-white group"
          aria-label="Return to Expense Tracker Home"
        >
          <div className="w-8 h-8 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-black flex items-center justify-center">
            <Wallet className="w-4 h-4" />
          </div>
          <span className="font-semibold text-sm tracking-tight">Expense Tracker</span>
        </Link>
      </header>

      {/* Main Error Hero */}
      <main className="max-w-md mx-auto text-center py-12 flex flex-col items-center">
        <div className="text-xs uppercase font-bold tracking-widest text-slate-400 dark:text-slate-500 mb-2">
          Error 404
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3 text-slate-900 dark:text-white">
          Page Not Found
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">
          The link you followed may be broken or the page may have been moved.
        </p>

        <Link
          href="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-black hover:bg-slate-800 dark:hover:bg-slate-100 font-medium text-xs transition-colors shadow-xs min-h-[44px]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>
      </main>

      {/* Footer */}
      <footer className="max-w-4xl mx-auto w-full text-center text-xs text-slate-400 dark:text-slate-600">
        <p>© {new Date().getFullYear()} Expense Tracker. All rights reserved.</p>
      </footer>
    </div>
  );
}
