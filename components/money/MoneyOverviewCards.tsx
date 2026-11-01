'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { formatINR } from '@/lib/calculations/financial';
import {
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  PiggyBank,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';

interface MoneyOverviewCardsProps {
  incomePaise?: number;
  expensesPaise?: number;
  netBalancePaise?: number;
  availableBalancePaise?: number;
  savingsAllocatedPaise?: number;
  periodLabel?: string;
}

export function MoneyOverviewCards({
  incomePaise: customIncome,
  expensesPaise: customExpenses,
  netBalancePaise: customNetBalance,
  availableBalancePaise: customAvailableBalance,
  savingsAllocatedPaise: customSavingsAllocated,
  periodLabel = 'All Time',
}: MoneyOverviewCardsProps) {
  const { financialSummary, savingsGoals } = useApp();

  const income = customIncome !== undefined ? customIncome : financialSummary.totalIncomePaise;
  const expenses = customExpenses !== undefined ? customExpenses : financialSummary.totalExpensesPaise;
  const netBalance = customNetBalance !== undefined ? customNetBalance : financialSummary.netBalancePaise;
  const savingsAllocated =
    customSavingsAllocated !== undefined
      ? customSavingsAllocated
      : financialSummary.savingsAllocatedPaise;
  const availableBalance =
    customAvailableBalance !== undefined
      ? customAvailableBalance
      : financialSummary.availableBalancePaise;

  const isNetPositive = netBalance >= 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Total Balance - Hero Metric with Primary Visual Priority */}
      <div className="p-5 bg-white dark:bg-[#0A0A0A] rounded-2xl border border-slate-200/80 dark:border-[#262626] hover:border-slate-300 dark:hover:border-[#383838] transition-colors duration-150">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 dark:text-[#A3A3A3] uppercase tracking-wider">
            Total Balance
          </span>
          <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
            <Wallet className="w-4 h-4" />
          </div>
        </div>

        <div className="mt-3">
          <div
            className={`text-3xl font-extrabold tracking-tight tabular-nums ${
              isNetPositive
                ? 'text-slate-900 dark:text-white'
                : 'text-rose-600 dark:text-rose-400'
            }`}
          >
            {formatINR(netBalance)}
          </div>
          <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-500 dark:text-[#A3A3A3]">
            {isNetPositive ? (
              <TrendingUp className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            ) : (
              <TrendingDown className="w-3.5 h-3.5 text-rose-500 shrink-0" />
            )}
            <span>Net cash position ({periodLabel})</span>
          </div>
        </div>
      </div>

      {/* 2. Total Income */}
      <div className="p-5 bg-white dark:bg-[#0A0A0A] rounded-2xl border border-slate-200/80 dark:border-[#262626] hover:border-slate-300 dark:hover:border-[#383838] transition-colors duration-150">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 dark:text-[#A3A3A3] uppercase tracking-wider">
            Total Income
          </span>
          <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
            <ArrowDownLeft className="w-4 h-4" />
          </div>
        </div>

        <div className="mt-3">
          <div className="text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400 tabular-nums">
            {formatINR(income)}
          </div>
          <div className="mt-1 text-xs text-slate-500 dark:text-[#A3A3A3]">
            Incoming funds &amp; earnings
          </div>
        </div>
      </div>

      {/* 3. Total Expenses */}
      <div className="p-5 bg-white dark:bg-[#0A0A0A] rounded-2xl border border-slate-200/80 dark:border-[#262626] hover:border-slate-300 dark:hover:border-[#383838] transition-colors duration-150">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 dark:text-[#A3A3A3] uppercase tracking-wider">
            Total Expenses
          </span>
          <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400">
            <ArrowUpRight className="w-4 h-4" />
          </div>
        </div>

        <div className="mt-3">
          <div className="text-2xl font-bold tracking-tight text-rose-600 dark:text-rose-400 tabular-nums">
            {formatINR(expenses)}
          </div>
          <div className="mt-1 text-xs text-slate-500 dark:text-[#A3A3A3]">
            Total recorded spending
          </div>
        </div>
      </div>

      {/* 4. Remaining Balance */}
      <div className="p-5 bg-white dark:bg-[#0A0A0A] rounded-2xl border border-slate-200/80 dark:border-[#262626] hover:border-slate-300 dark:hover:border-[#383838] transition-colors duration-150">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 dark:text-[#A3A3A3] uppercase tracking-wider">
            Remaining Balance
          </span>
          <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
            <PiggyBank className="w-4 h-4" />
          </div>
        </div>

        <div className="mt-3">
          <div className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white tabular-nums">
            {formatINR(availableBalance)}
          </div>
          <div className="mt-1 text-xs text-slate-500 dark:text-[#A3A3A3]">
            {savingsAllocated > 0
              ? `${formatINR(savingsAllocated)} in ${savingsGoals.length} savings goals`
              : 'Free unallocated student funds'}
          </div>
        </div>
      </div>
    </div>
  );
}
