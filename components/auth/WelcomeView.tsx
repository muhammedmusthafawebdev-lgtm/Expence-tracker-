'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { useTheme } from '@/components/theme/ThemeProvider';
import {
  Wallet,
  ArrowRight,
  Sun,
  Moon,
  TrendingUp,
  Sliders,
  PiggyBank,
  HandCoins,
} from 'lucide-react';

export function WelcomeView() {
  const { setCurrentScreen } = useApp();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-[100dvh] flex flex-col justify-between bg-[#FBFBFD] dark:bg-[#000000] text-slate-900 dark:text-white selection:bg-slate-900 selection:text-white dark:selection:bg-white dark:selection:text-black">
      {/* Top Navbar */}
      <header className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-3.5 sm:py-5 flex items-center justify-between pt-[max(0.875rem,env(safe-area-inset-top))]">
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl sm:rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-black flex items-center justify-center shadow-xs">
            <Wallet className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div>
            <span className="font-semibold text-sm sm:text-base tracking-tight block leading-none">
              Expense Tracker
            </span>
            <span className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 font-normal hidden xs:inline block">
              Personal Finance
            </span>
          </div>
        </div>

        <nav aria-label="Account Navigation" className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          <button
            onClick={toggleTheme}
            aria-label="Toggle visual theme"
            className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          <button
            onClick={() => setCurrentScreen('login')}
            className="text-xs sm:text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl transition-colors duration-150 min-h-[40px] flex items-center"
          >
            Log in
          </button>

          <button
            onClick={() => setCurrentScreen('signup')}
            className="text-xs sm:text-sm font-medium bg-slate-900 dark:bg-white text-white dark:text-black hover:bg-slate-800 dark:hover:bg-slate-100 px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-xl transition-all duration-150 shadow-xs min-h-[40px] flex items-center"
          >
            Get started
          </button>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 pt-6 sm:pt-14 pb-8 sm:pb-12 flex flex-col items-center text-center">
        {/* Primary Headline */}
        <h1 className="text-3xl xs:text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 dark:text-white mb-3 sm:mb-5 max-w-2xl leading-[1.12] text-balance">
          Your money. <br />
          <span className="text-slate-400 dark:text-slate-500">Your clarity.</span>
        </h1>

        {/* Supporting Text */}
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-lg mb-7 sm:mb-9 leading-relaxed font-normal px-2">
          Track income, manage categorized expenses, set period budgets, and monitor savings goals with precision financial clarity.
        </p>

        {/* Action CTAs */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-2.5 sm:gap-3 w-full max-w-xs sm:max-w-none mb-10 sm:mb-14">
          <button
            onClick={() => setCurrentScreen('signup')}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl sm:rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-black hover:bg-slate-800 dark:hover:bg-slate-100 font-medium text-sm transition-all duration-150 shadow-xs group min-h-[44px]"
          >
            <span>Get started</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 duration-150" />
          </button>

          <button
            onClick={() => setCurrentScreen('login')}
            className="w-full sm:w-auto inline-flex items-center justify-center px-5 py-3 rounded-xl sm:rounded-2xl bg-white dark:bg-[#0E0E11] text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-900 font-medium text-sm border border-slate-200 dark:border-slate-800 transition-colors duration-150 min-h-[44px]"
          >
            Already have an account? Log in
          </button>
        </div>

        {/* 4 Core Feature Pillars with Semantic H2 Section */}
        <section aria-labelledby="features-heading" className="w-full max-w-5xl">
          <h2 id="features-heading" className="sr-only">
            Personal Finance &amp; Budget Management Features
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4 w-full text-left">
            {/* Feature 1 */}
            <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#0c0c0e] border border-slate-200/80 dark:border-slate-800/80 shadow-xs">
              <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-3">
                <TrendingUp className="w-4 h-4" />
              </div>
              <h3 className="font-semibold text-sm text-slate-900 dark:text-white mb-1">
                Cash Flow Tracking
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Record daily expenses and income with clean categorization and instant balance insights.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#0c0c0e] border border-slate-200/80 dark:border-slate-800/80 shadow-xs">
              <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-3">
                <Sliders className="w-4 h-4" />
              </div>
              <h3 className="font-semibold text-sm text-slate-900 dark:text-white mb-1">
                Smart Budgets
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Set monthly and yearly category caps to keep spending disciplined with proactive threshold alerts.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#0c0c0e] border border-slate-200/80 dark:border-slate-800/80 shadow-xs">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3">
                <PiggyBank className="w-4 h-4" />
              </div>
              <h3 className="font-semibold text-sm text-slate-900 dark:text-white mb-1">
                Savings Goals
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Set targets for milestones and future expenses, tracking allocations toward your targets.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#0c0c0e] border border-slate-200/80 dark:border-slate-800/80 shadow-xs">
              <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-3">
                <HandCoins className="w-4 h-4" />
              </div>
              <h3 className="font-semibold text-sm text-slate-900 dark:text-white mb-1">
                Debt &amp; Money Lent
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Track money lent to others with repayment schedules without distorting operating cash flow.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Clean Minimalist Footer */}
      <footer className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-5 border-t border-slate-200/60 dark:border-slate-800/60 flex items-center justify-center text-xs text-slate-400 dark:text-slate-600 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
        <p>© {new Date().getFullYear()} Expense Tracker. All rights reserved.</p>
      </footer>
    </div>
  );
}
