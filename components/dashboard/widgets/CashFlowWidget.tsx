'use client';

import React from 'react';
import { formatINR } from '@/lib/calculations/financial';
import { ArrowLeftRight, TrendingUp, TrendingDown } from 'lucide-react';

interface CashFlowWidgetProps {
  periodIncomePaise: number;
  periodExpensesPaise: number;
  periodLabel: string;
}

export function CashFlowWidget({
  periodIncomePaise,
  periodExpensesPaise,
  periodLabel,
}: CashFlowWidgetProps) {
  const netPaise = periodIncomePaise - periodExpensesPaise;
  const isNetPositive = netPaise >= 0;
  const totalVolumePaise = periodIncomePaise + periodExpensesPaise;

  const incomePct =
    totalVolumePaise > 0 ? Math.round((periodIncomePaise / totalVolumePaise) * 100) : 50;
  const expensePct =
    totalVolumePaise > 0 ? Math.round((periodExpensesPaise / totalVolumePaise) * 100) : 50;

  const savingsRate =
    periodIncomePaise > 0
      ? Math.max(0, Math.round((netPaise / periodIncomePaise) * 100))
      : 0;

  return (
    <div className="p-5 md:p-6 bg-white dark:bg-[#0A0A0A] rounded-2xl border border-slate-200/80 dark:border-[#262626]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <ArrowLeftRight className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            Cash Flow Comparison ({periodLabel})
          </h3>
          <p className="text-xs text-slate-500 dark:text-[#A3A3A3] mt-0.5">
            Money coming in vs money going out
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg ${
              isNetPositive
                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
                : 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400'
            }`}
          >
            {isNetPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
            Net {isNetPositive ? '+' : ''}{formatINR(netPaise)}
          </span>
        </div>
      </div>

      {totalVolumePaise > 0 ? (
        <div className="space-y-4">
          {/* Comparison Progress Bar */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-medium">
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                Income: {formatINR(periodIncomePaise)} ({incomePct}%)
              </span>
              <span className="text-rose-600 dark:text-rose-400 font-semibold">
                Expenses: {formatINR(periodExpensesPaise)} ({expensePct}%)
              </span>
            </div>
            <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-[#141414] overflow-hidden flex">
              <div
                style={{ width: `${incomePct}%` }}
                className="h-full bg-emerald-500 transition-all duration-300 rounded-l-full"
              />
              <div
                style={{ width: `${expensePct}%` }}
                className="h-full bg-rose-500 transition-all duration-300 rounded-r-full"
              />
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
            <div className="p-3 rounded-xl bg-slate-50/70 dark:bg-[#141414] border border-slate-100 dark:border-[#1f1f1f]">
              <div className="text-[11px] text-slate-500 dark:text-[#A3A3A3]">Savings Rate</div>
              <div className="text-base font-bold text-slate-900 dark:text-white mt-0.5 tabular-nums">
                {savingsRate}%
              </div>
            </div>
            <div className="p-3 rounded-xl bg-slate-50/70 dark:bg-[#141414] border border-slate-100 dark:border-[#1f1f1f]">
              <div className="text-[11px] text-slate-500 dark:text-[#A3A3A3]">Expense-to-Income</div>
              <div className="text-base font-bold text-slate-900 dark:text-white mt-0.5 tabular-nums">
                {periodIncomePaise > 0 ? Math.round((periodExpensesPaise / periodIncomePaise) * 100) : 0}%
              </div>
            </div>
            <div className="p-3 rounded-xl bg-slate-50/70 dark:bg-[#141414] border border-slate-100 dark:border-[#1f1f1f] col-span-2 sm:col-span-1">
              <div className="text-[11px] text-slate-500 dark:text-[#A3A3A3]">Cash Flow Status</div>
              <div className={`text-base font-bold mt-0.5 ${isNetPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                {isNetPositive ? 'Positive Surplus' : 'Deficit'}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="py-6 text-center text-xs text-slate-400 dark:text-[#A3A3A3]">
          No cash flow recorded for {periodLabel.toLowerCase()}.
        </div>
      )}
    </div>
  );
}
