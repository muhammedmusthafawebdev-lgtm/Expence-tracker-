'use client';

import React, { useState, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { MoneyOverviewCards } from './MoneyOverviewCards';
import { CircularExpenseChart } from './CircularExpenseChart';
import {
  CircleDollarSign,
  Plus,
  Calendar,
  Layers,
  ArrowRight,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import { calculateNetBalance, calculateAvailableBalance, paiseToRupees } from '@/lib/calculations/financial';

interface MoneyDashboardProps {
  widgetMode?: boolean;
}

export function MoneyDashboard({ widgetMode = false }: MoneyDashboardProps) {
  const {
    transactions,
    financialSummary,
    openAddTransaction,
    setCurrentScreen,
  } = useApp();

  // Period Selector: Strictly This Month, This Year, All Time
  const [period, setPeriod] = useState<'this_month' | 'this_year' | 'all_time'>('this_month');

  const currentMonthStr = useMemo(() => new Date().toISOString().substring(0, 7), []);
  const currentYearStr = useMemo(() => new Date().toISOString().substring(0, 4), []);

  // Filter transactions by period
  const periodTransactions = useMemo(() => {
    return transactions.filter((t) => {
      if (t.deletedAt) return false;
      if (period === 'this_month') return t.date.startsWith(currentMonthStr);
      if (period === 'this_year') return t.date.startsWith(currentYearStr);
      return true; // all_time
    });
  }, [transactions, period, currentMonthStr, currentYearStr]);

  // Compute period totals
  const periodIncomePaise = useMemo(() => {
    return periodTransactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amountPaise, 0);
  }, [periodTransactions]);

  const periodExpensesPaise = useMemo(() => {
    return periodTransactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amountPaise, 0);
  }, [periodTransactions]);

  const periodNetBalancePaise = useMemo(() => {
    return calculateNetBalance(periodIncomePaise, periodExpensesPaise);
  }, [periodIncomePaise, periodExpensesPaise]);

  const periodAvailableBalancePaise = useMemo(() => {
    return calculateAvailableBalance(
      periodNetBalancePaise,
      financialSummary.savingsAllocatedPaise
    );
  }, [periodNetBalancePaise, financialSummary.savingsAllocatedPaise]);

  const periodLabelMap = {
    this_month: 'This Month',
    this_year: 'This Year',
    all_time: 'All Time',
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header & Period Selector (Only in full view or refined in widget) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-[#262626]">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
              <CircleDollarSign className="w-5 h-5" />
            </div>
            <h2 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              {widgetMode ? 'Money Overview' : 'Money Dashboard'}
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-[#A3A3A3] mt-1">
            Real-time balance, cash flow, and animated spending breakdown
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          {/* Period Selector */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-[#141414] rounded-xl border border-slate-200/60 dark:border-[#262626]">
            {(
              [
                { key: 'this_month', label: 'This Month' },
                { key: 'this_year', label: 'This Year' },
                { key: 'all_time', label: 'All Time' },
              ] as const
            ).map((item) => (
              <button
                key={item.key}
                onClick={() => setPeriod(item.key)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors duration-150 ${
                  period === item.key
                    ? 'bg-white dark:bg-[#262626] text-slate-900 dark:text-white'
                    : 'text-slate-600 dark:text-[#A3A3A3] hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <button
            onClick={openAddTransaction}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 dark:bg-white dark:text-black dark:hover:bg-slate-200 rounded-xl transition-colors duration-150"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">Add Transaction</span>
          </button>
        </div>
      </div>

      {/* 1. Money Overview Metric Cards */}
      <MoneyOverviewCards
        incomePaise={periodIncomePaise}
        expensesPaise={periodExpensesPaise}
        netBalancePaise={periodNetBalancePaise}
        availableBalancePaise={periodAvailableBalancePaise}
        savingsAllocatedPaise={financialSummary.savingsAllocatedPaise}
        periodLabel={periodLabelMap[period]}
      />

      {/* 2. Scroll-Triggered Animated Circular Expense Breakdown */}
      <div className="pt-2">
        <CircularExpenseChart
          transactions={periodTransactions}
          title={`Spending by Category (${periodLabelMap[period]})`}
          subtitle="Proportional circular distribution of your outgoing expenses"
        />
      </div>
    </div>
  );
}
