'use client';

import React from 'react';
import { formatINR } from '@/lib/calculations/financial';
import { Wallet, ArrowDownLeft, ArrowUpRight, PiggyBank } from 'lucide-react';

interface OverviewWidgetProps {
  availableBalancePaise: number;
  periodIncomePaise: number;
  periodExpensesPaise: number;
  savingsAllocatedPaise: number;
  periodLabel: string;
}

export function OverviewWidget({
  availableBalancePaise,
  periodIncomePaise,
  periodExpensesPaise,
  savingsAllocatedPaise,
  periodLabel,
}: OverviewWidgetProps) {
  const netPeriodPaise = periodIncomePaise - periodExpensesPaise;
  const isNetPositive = netPeriodPaise >= 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
      {/* 1. Available Balance */}
      <div className="p-4 sm:p-5 bg-white dark:bg-[#0A0A0A] rounded-2xl border border-slate-200/80 dark:border-[#262626] transition-colors duration-150">
        <div className="flex items-center justify-between text-slate-500 dark:text-[#A3A3A3]">
          <span className="text-[11px] font-semibold uppercase tracking-wider">
            Available Balance
          </span>
          <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
            <Wallet className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white tabular-nums">
            {formatINR(availableBalancePaise)}
          </div>
          <div className="mt-1 text-xs text-slate-500 dark:text-[#A3A3A3] flex items-center gap-1.5">
            <span>Net funds available to spend</span>
          </div>
        </div>
      </div>

      {/* 2. Period Income */}
      <div className="p-4 sm:p-5 bg-white dark:bg-[#0A0A0A] rounded-2xl border border-slate-200/80 dark:border-[#262626] transition-colors duration-150">
        <div className="flex items-center justify-between text-slate-500 dark:text-[#A3A3A3]">
          <span className="text-[11px] font-semibold uppercase tracking-wider">
            Income ({periodLabel})
          </span>
          <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
            <ArrowDownLeft className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl sm:text-3xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400 tabular-nums">
            {formatINR(periodIncomePaise)}
          </div>
          <div className="mt-1 text-xs text-slate-500 dark:text-[#A3A3A3]">
            Total incoming funds
          </div>
        </div>
      </div>

      {/* 3. Period Expenses */}
      <div className="p-4 sm:p-5 bg-white dark:bg-[#0A0A0A] rounded-2xl border border-slate-200/80 dark:border-[#262626] transition-colors duration-150">
        <div className="flex items-center justify-between text-slate-500 dark:text-[#A3A3A3]">
          <span className="text-[11px] font-semibold uppercase tracking-wider">
            Expenses ({periodLabel})
          </span>
          <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400">
            <ArrowUpRight className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl sm:text-3xl font-bold tracking-tight text-rose-600 dark:text-rose-400 tabular-nums">
            {formatINR(periodExpensesPaise)}
          </div>
          <div className="mt-1 text-xs text-slate-500 dark:text-[#A3A3A3] flex items-center gap-1.5">
            <span>
              Net:{' '}
              <strong className={isNetPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}>
                {isNetPositive ? '+' : ''}{formatINR(netPeriodPaise)}
              </strong>
            </span>
          </div>
        </div>
      </div>

      {/* 4. Allocated Savings */}
      <div className="p-4 sm:p-5 bg-white dark:bg-[#0A0A0A] rounded-2xl border border-slate-200/80 dark:border-[#262626] transition-colors duration-150">
        <div className="flex items-center justify-between text-slate-500 dark:text-[#A3A3A3]">
          <span className="text-[11px] font-semibold uppercase tracking-wider">
            Dedicated Savings
          </span>
          <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
            <PiggyBank className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl sm:text-3xl font-bold tracking-tight text-purple-600 dark:text-purple-400 tabular-nums">
            {formatINR(savingsAllocatedPaise)}
          </div>
          <div className="mt-1 text-xs text-slate-500 dark:text-[#A3A3A3]">
            Dedicated milestone funds
          </div>
        </div>
      </div>
    </div>
  );
}
