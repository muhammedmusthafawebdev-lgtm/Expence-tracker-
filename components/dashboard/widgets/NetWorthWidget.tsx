'use client';

import React from 'react';
import { formatINR } from '@/lib/calculations/financial';
import { Landmark, ArrowUpRight, Shield } from 'lucide-react';

interface NetWorthWidgetProps {
  availableBalancePaise: number;
  savingsAllocatedPaise: number;
}

export function NetWorthWidget({
  availableBalancePaise,
  savingsAllocatedPaise,
}: NetWorthWidgetProps) {
  // Estimated Net Worth = Liquid funds + Dedicated savings
  const totalAssetsPaise = availableBalancePaise + savingsAllocatedPaise;

  return (
    <div className="p-5 md:p-6 bg-white dark:bg-[#0A0A0A] rounded-2xl border border-slate-200/80 dark:border-[#262626]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <Landmark className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            Net Worth Snapshot
          </h3>
          <p className="text-xs text-slate-500 dark:text-[#A3A3A3] mt-0.5">
            Liquid cash, dedicated savings reserves &amp; capital
          </p>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400">
          Positive Equity
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-1">
        <div className="p-4 rounded-xl bg-slate-50/70 dark:bg-[#141414] border border-slate-100 dark:border-[#1f1f1f]">
          <div className="text-[11px] font-medium text-slate-500 dark:text-[#A3A3A3]">
            Total Estimated Net Worth
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1 tabular-nums">
            {formatINR(totalAssetsPaise)}
          </div>
          <div className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-0.5 flex items-center gap-1">
            <ArrowUpRight className="w-3 h-3" /> Cumulative ledger assets
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-50/70 dark:bg-[#141414] border border-slate-100 dark:border-[#1f1f1f]">
          <div className="text-[11px] font-medium text-slate-500 dark:text-[#A3A3A3]">
            Liquid Funds (Cash &amp; Bank)
          </div>
          <div className="text-xl font-bold text-slate-900 dark:text-white mt-1 tabular-nums">
            {formatINR(availableBalancePaise)}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            Immediately deployable liquidity
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-50/70 dark:bg-[#141414] border border-slate-100 dark:border-[#1f1f1f]">
          <div className="text-[11px] font-medium text-slate-500 dark:text-[#A3A3A3]">
            Dedicated Reserves (Savings)
          </div>
          <div className="text-xl font-bold text-purple-600 dark:text-purple-400 mt-1 tabular-nums">
            {formatINR(savingsAllocatedPaise)}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1">
            <Shield className="w-3 h-3 text-purple-500" /> Ring-fenced goal capital
          </div>
        </div>
      </div>
    </div>
  );
}
