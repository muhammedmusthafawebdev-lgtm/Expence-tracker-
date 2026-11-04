'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { useTheme } from '@/components/theme/ThemeProvider';
import { Wallet, Sun, Moon, ArrowLeft } from 'lucide-react';

interface AuthLayoutProps {
  children: React.ReactNode;
  backTo?: 'welcome' | 'login';
  backLabel?: string;
}

export function AuthLayout({
  children,
  backTo = 'welcome',
  backLabel,
}: AuthLayoutProps) {
  const { setCurrentScreen } = useApp();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-[100dvh] flex flex-col justify-between bg-[#FBFBFD] dark:bg-[#000000] text-slate-900 dark:text-white px-3 sm:px-6 lg:px-8 selection:bg-slate-900 selection:text-white dark:selection:bg-white dark:selection:text-black pt-[max(0.75rem,env(safe-area-inset-top))] pb-[max(0.75rem,env(safe-area-inset-bottom))]">
      {/* Top Navigation Bar */}
      <header className="w-full max-w-5xl mx-auto flex items-center justify-between py-2">
        <button
          onClick={() => setCurrentScreen(backTo)}
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors duration-150 py-2.5 px-2 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 min-h-[44px]"
          aria-label={backLabel || `Back to ${backTo}`}
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{backLabel || (backTo === 'welcome' ? 'Home' : 'Back to login')}</span>
        </button>

        {/* Brand Monogram */}
        <button
          onClick={() => setCurrentScreen('welcome')}
          className="flex items-center gap-2 group cursor-pointer focus-visible:outline-none min-h-[44px] px-2"
        >
          <div className="w-8 h-8 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-black flex items-center justify-center transition-transform group-hover:scale-105 duration-200">
            <Wallet className="w-4 h-4" />
          </div>
          <span className="font-semibold text-sm tracking-tight hidden sm:inline-block">
            Expense Tracker
          </span>
        </button>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          aria-label="Toggle theme"
          className="w-10 h-10 min-w-[40px] min-h-[40px] flex items-center justify-center rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
      </header>

      {/* Main Form Center Area */}
      <main className="flex-1 flex items-center justify-center py-4 sm:py-8 px-1">
        <div className="w-full max-w-[420px]">
          {children}
        </div>
      </main>

      {/* Subtle Footer */}
      <footer className="w-full max-w-5xl mx-auto py-3 text-center text-xs text-slate-400 dark:text-slate-600">
        <p>Private &amp; secure financial tracking. Integer-precision ledger.</p>
      </footer>
    </div>
  );
}
