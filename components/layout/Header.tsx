'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { useTheme } from '@/components/theme/ThemeProvider';
import {
  SlidersHorizontal,
  Plus,
  Sun,
  Moon,
  Laptop,
} from 'lucide-react';
import { AppScreen } from '@/types';

export function Header() {
  const { currentScreen, openAddTransaction, setIsCustomizeModalOpen } = useApp();
  const { theme, setTheme, mounted } = useTheme();

  const screenTitles: Partial<Record<AppScreen, { title: string; subtitle: string }>> = {
    dashboard: {
      title: 'Finance Dashboard',
      subtitle: 'Overview of income, expenses, and budget limits',
    },
    money: {
      title: 'Money Dashboard',
      subtitle: 'Balance overview and animated circular spending breakdown',
    },
    transactions: {
      title: 'Transactions',
      subtitle: 'Record, search, and review financial entries',
    },
    categories: {
      title: 'Categories',
      subtitle: 'Create, edit, and organize expense and income categories',
    },
    budget: {
      title: 'Budgets',
      subtitle: 'Set and monitor Monthly and Yearly spending limits',
    },
    savings: {
      title: 'Savings Goals',
      subtitle: 'Dedicated savings funds (not counted as ordinary expenses)',
    },
    reports: {
      title: 'Financial Reports',
      subtitle: 'Exportable statements and printable financial records',
    },
    profile: {
      title: 'Student Profile',
      subtitle: 'Academic affiliation, pocket money allowance, and student details',
    },
    settings: {
      title: 'Preferences & Settings',
      subtitle: 'Appearance, currency display, and dashboard customization',
    },
    'recently-deleted': {
      title: 'Recently Deleted',
      subtitle: 'Trash bin with 30-day retention and restore capabilities',
    },
  };

  const currentInfo = screenTitles[currentScreen] || {
    title: 'Finance Dashboard',
    subtitle: 'Financial Management',
  };

  const cycleTheme = () => {
    if (theme === 'system') setTheme('light');
    else if (theme === 'light') setTheme('dark');
    else setTheme('system');
  };

  return (
    <header className="min-h-16 h-auto py-2.5 px-3.5 sm:px-6 md:px-8 border-b border-slate-200/80 dark:border-[#262626] bg-white/80 dark:bg-[#000000]/80 backdrop-blur-md flex items-center justify-between gap-2.5 sm:gap-4 sticky top-0 z-20 pt-[max(0.625rem,env(safe-area-inset-top))]">
      {/* Title zone */}
      <div className="flex flex-col min-w-0 flex-1">
        <h1 className="text-sm sm:text-base md:text-lg font-semibold tracking-tight text-slate-900 dark:text-white truncate">
          {currentInfo.title}
        </h1>
        <p className="hidden sm:block text-xs text-slate-500 dark:text-[#A3A3A3] truncate">
          {currentInfo.subtitle}
        </p>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
        {/* Quick Customize Button (Visible when on Dashboard) */}
        {currentScreen === 'dashboard' && (
          <button
            onClick={() => setIsCustomizeModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-[#A3A3A3] bg-slate-100 dark:bg-[#141414] hover:bg-slate-200 dark:hover:bg-[#262626] rounded-xl transition-colors duration-150 border border-slate-200/60 dark:border-[#262626] min-h-[36px]"
            title="Customize Dashboard Layout"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Customize View</span>
          </button>
        )}

        {/* Theme Toggle Button */}
        <button
          onClick={cycleTheme}
          className="w-9 h-9 min-w-[36px] min-h-[36px] flex items-center justify-center rounded-xl text-slate-600 dark:text-[#A3A3A3] hover:bg-slate-100 dark:hover:bg-[#141414] transition-colors duration-150 border border-slate-200/60 dark:border-[#262626]"
          title={`Current Theme: ${(mounted ? theme : 'system').toUpperCase()} (Click to toggle)`}
          aria-label="Toggle theme mode"
          suppressHydrationWarning
        >
          {!mounted || theme === 'system' ? (
            <Laptop className="w-4 h-4 text-slate-400" />
          ) : theme === 'dark' ? (
            <Moon className="w-4 h-4 text-blue-400" />
          ) : (
            <Sun className="w-4 h-4 text-amber-500" />
          )}
        </button>

        {/* Add Transaction Primary CTA */}
        <button
          onClick={openAddTransaction}
          className="inline-flex items-center gap-1.5 px-3 sm:px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors duration-150 active:scale-95 shrink-0 min-h-[36px]"
          aria-label="Add Transaction"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span className="hidden xs:inline sm:hidden">Add</span>
          <span className="hidden sm:inline">Add Transaction</span>
        </button>
      </div>
    </header>
  );
}
