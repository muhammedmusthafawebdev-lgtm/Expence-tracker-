'use client';

import React from 'react';
import { formatINR } from '@/lib/calculations/financial';
import { Landmark, ArrowUpRight, Shield, AlertTriangle } from 'lucide-react';

interface NetWorthWidgetProps {
  availableBalancePaise: number;
  savingsAllocatedPaise: number;
}

export function NetWorthWidget({
  availableBalancePaise,
  savingsAllocatedPaise,
}: NetWorthWidgetProps) {
  // Total tracked liquid capital = immediate cash + dedicated savings reserves
  // Note: savingsAllocatedPaise is ring-fenced from net balance to obtain availableBalancePaise;
  // summing them reconstitutes cumulative liquid capital with zero double-counting.
  const totalCapitalPaise = availableBalancePaise + savingsAllocatedPaise;
  const isPositive = totalCapitalPaise >= 0;

  return (
    <div className="p-5 md:p-6 bg-white dark:bg-[#0A0A0A] rounded-2xl border border-slate-200/80 dark:border-[#262626]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <Landmark className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            Net Liquid Capital &amp; Reserves (Cash + Goals)
          </h3>
          <p className="text-xs text-slate-500 dark:text-[#A3A3A3] mt-0.5">
            Immediate cash liquidity and ring-fenced savings reserves
          </p>
        </div>
        <span
          className={`text-xs font-semibold px-2.5 py-1 rounded-lg ${
            isPositive
              ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400'
              : 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400'
          }`}
        >
          {isPositive ? 'Positive Balance' : 'Net Deficit'}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-1">
        <div className="p-4 rounded-xl bg-slate-50/70 dark:bg-[#141414] border border-slate-100 dark:border-[#1f1f1f]">
          <div className="text-[11px] font-medium text-slate-500 dark:text-[#A3A3A3]">
            Total Net Liquid Capital
          </div>
          <div className={`text-2xl font-extrabold mt-1 tabular-nums ${isPositive ? 'text-slate-900 dark:text-white' : 'text-rose-600 dark:text-rose-400'}`}>
            {formatINR(totalCapitalPaise)}
          </div>
          <div className="text-[10px] text-slate-500 dark:text-[#A3A3A3] mt-0.5 flex items-center gap-1">
            {isPositive ? <ArrowUpRight className="w-3 h-3 text-emerald-500" /> : <AlertTriangle className="w-3 h-3 text-rose-500" />}
            Cumulative cash + goal reserves
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
            Immediately deployable funds
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

      <p className="mt-3 text-[10px] text-slate-400 dark:text-[#737373] italic">
        * Reflects only verified ledger cash and dedicated goal savings. Outside debts, investments, and physical assets are not tracked.
      </p>
    </div>
  );
}
