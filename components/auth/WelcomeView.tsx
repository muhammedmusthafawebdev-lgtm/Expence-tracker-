'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { useTheme } from '@/components/theme/ThemeProvider';
import {
  Wallet,
  ArrowRight,
  Sun,
  Moon,
  ShieldCheck,
  PieChart,
  Calendar,
  PiggyBank,
  Sparkles,
} from 'lucide-react';

export function WelcomeView() {
  const { setCurrentScreen } = useApp();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#FBFBFD] dark:bg-[#000000] text-slate-900 dark:text-white selection:bg-slate-900 selection:text-white dark:selection:bg-white dark:selection:text-black">
      {/* Top Navbar */}
      <header className="w-full max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-black flex items-center justify-center shadow-sm">
            <Wallet className="w-5 h-5" />
          </div>
          <div>
            <span className="font-semibold text-base tracking-tight block leading-none">
              Expense Tracker
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-normal">
              Personal Finance
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="p-2.5 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          <button
            onClick={() => setCurrentScreen('login')}
            className="text-xs sm:text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white px-3 py-2 rounded-xl transition-colors duration-150"
          >
            Log in
          </button>

          <button
            onClick={() => setCurrentScreen('signup')}
            className="text-xs sm:text-sm font-medium bg-slate-900 dark:bg-white text-white dark:text-black hover:bg-slate-800 dark:hover:bg-slate-100 px-4 py-2 rounded-xl transition-all duration-150 shadow-sm"
          >
            Get started
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-4xl mx-auto px-6 pt-12 pb-16 flex flex-col items-center text-center justify-center">
        {/* Subtle Tagline Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-300 text-xs font-medium mb-8 border border-slate-200/60 dark:border-slate-800">
          <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
          <span>Your expense data, all in one place.</span>
        </div>

        {/* Primary Headline */}
        <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-slate-900 dark:text-white mb-6 max-w-2xl leading-[1.1]">
          Your money. <br />
          <span className="text-slate-400 dark:text-slate-500">Your clarity.</span>
        </h1>

        {/* Supporting Text */}
        <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-xl mb-10 leading-relaxed font-normal">
          Track your income, manage expenses, and understand where your money goes — all in one place.
          A simple way to manage your monthly income, expenses, budgets, and savings.
        </p>

        {/* Action CTAs */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto mb-14">
          <button
            onClick={() => setCurrentScreen('signup')}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-black hover:bg-slate-800 dark:hover:bg-slate-100 font-medium text-sm transition-all duration-200 shadow-sm group"
          >
            <span>Get started</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 duration-150" />
          </button>

          <button
            onClick={() => setCurrentScreen('login')}
            className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-850 font-medium text-sm border border-slate-200 dark:border-slate-800 transition-colors duration-200"
          >
            Already have an account? Log in
          </button>
        </div>

        {/* Demo Link */}
        <button
          onClick={() => setCurrentScreen('dashboard')}
          className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 underline underline-offset-4 transition-colors mb-16"
        >
          Explore demo dashboard without signing in
        </button>

        {/* 3 Core Feature Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full text-left">
          {/* Feature 1 */}
          <div className="p-6 rounded-2xl bg-white dark:bg-[#0c0c0e] border border-slate-200/80 dark:border-slate-800/80 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-4">
              <PieChart className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-sm text-slate-900 dark:text-white mb-1.5">
              Cash Flow Clarity
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Track income and expenses categorized by student essentials, groceries, rent, and tuition with precision integer paise.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="p-6 rounded-2xl bg-white dark:bg-[#0c0c0e] border border-slate-200/80 dark:border-slate-800/80 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-4">
              <Calendar className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-sm text-slate-900 dark:text-white mb-1.5">
              Period Budgets
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Isolated monthly and yearly budget horizons. Excludes historical spillover to maintain mathematical budget integrity.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="p-6 rounded-2xl bg-white dark:bg-[#0c0c0e] border border-slate-200/80 dark:border-slate-800/80 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4">
              <PiggyBank className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-sm text-slate-900 dark:text-white mb-1.5">
              Savings Milestones
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Ring-fenced milestone funds. Dedicated allocations preserve accurate available balance calculations without double-counting.
            </p>
          </div>
        </div>

        {/* Privacy & Zero-Fake-Data Assurance */}
        <div className="mt-12 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>Zero third-party trackers. Integer paise precision. Direct user data ownership.</span>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-6xl mx-auto px-6 py-6 border-t border-slate-200/60 dark:border-slate-800/60 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 dark:text-slate-500 gap-4">
        <p>© 2026 Expense Tracker. Built for students & individuals managing personal finances.</p>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setCurrentScreen('dashboard')}
            className="hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            Dashboard
          </button>
          <button
            onClick={() => setCurrentScreen('login')}
            className="hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            Sign In
          </button>
          <button
            onClick={() => setCurrentScreen('signup')}
            className="hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            Create Account
          </button>
        </div>
      </footer>
    </div>
  );
}
