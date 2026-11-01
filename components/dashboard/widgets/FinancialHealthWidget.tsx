'use client';

import React from 'react';
import { formatINR } from '@/lib/calculations/financial';
import { ShieldCheck, HeartPulse, Sparkles } from 'lucide-react';

interface FinancialHealthWidgetProps {
  periodIncomePaise: number;
  periodExpensesPaise: number;
  savingsAllocatedPaise: number;
  availableBalancePaise: number;
}

export function FinancialHealthWidget({
  periodIncomePaise,
  periodExpensesPaise,
  savingsAllocatedPaise,
  availableBalancePaise,
}: FinancialHealthWidgetProps) {
  const netPaise = periodIncomePaise - periodExpensesPaise;
  const savingsRate =
    periodIncomePaise > 0 ? Math.max(0, Math.round((netPaise / periodIncomePaise) * 100)) : 0;
  const spendingRatio =
    periodIncomePaise > 0 ? Math.round((periodExpensesPaise / periodIncomePaise) * 100) : 0;

  // Compute a 100-point Financial Health Score
  let healthScore = 50;
  if (periodIncomePaise > 0) {
    if (savingsRate >= 30) healthScore += 30;
    else if (savingsRate >= 15) healthScore += 15;
    else if (savingsRate < 0) healthScore -= 20;

    if (spendingRatio <= 70) healthScore += 15;
    else if (spendingRatio > 100) healthScore -= 20;
  }
  if (savingsAllocatedPaise > 0) healthScore += 5;
  healthScore = Math.min(100, Math.max(10, healthScore));

  const healthGrade =
    healthScore >= 80 ? 'Excellent' : healthScore >= 60 ? 'Healthy' : healthScore >= 40 ? 'Balanced' : 'Needs Attention';

  const healthColor =
    healthScore >= 80
      ? 'text-emerald-600 dark:text-emerald-400'
      : healthScore >= 60
      ? 'text-blue-600 dark:text-blue-400'
      : healthScore >= 40
      ? 'text-amber-500'
      : 'text-rose-600 dark:text-rose-400';

  return (
    <div className="p-5 md:p-6 bg-white dark:bg-[#0A0A0A] rounded-2xl border border-slate-200/80 dark:border-[#262626]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <HeartPulse className="w-4 h-4 text-emerald-500" />
            Financial Health Dashboard
          </h3>
          <p className="text-xs text-slate-500 dark:text-[#A3A3A3] mt-0.5">
            Holistic assessment of savings rate &amp; liquidity
          </p>
        </div>
        <span className={`text-xs font-bold px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-[#141414] ${healthColor}`}>
          Grade: {healthGrade} ({healthScore}/100)
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-1">
        {/* Metric 1 */}
        <div className="p-3.5 bg-slate-50/70 dark:bg-[#141414] rounded-xl border border-slate-100 dark:border-[#1f1f1f]">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-500 dark:text-[#A3A3A3]">Savings Rate</span>
            <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
          </div>
          <div className="text-xl font-bold text-slate-900 dark:text-white mt-1 tabular-nums">
            {savingsRate}%
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            {savingsRate >= 20 ? 'Target recommended met (>20%)' : 'Aim for 20% savings'}
          </div>
        </div>

        {/* Metric 2 */}
        <div className="p-3.5 bg-slate-50/70 dark:bg-[#141414] rounded-xl border border-slate-100 dark:border-[#1f1f1f]">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-500 dark:text-[#A3A3A3]">Spend-to-Income</span>
            <Sparkles className="w-3.5 h-3.5 text-purple-500" />
          </div>
          <div className="text-xl font-bold text-slate-900 dark:text-white mt-1 tabular-nums">
            {spendingRatio}%
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            {spendingRatio <= 80 ? 'Spending within safe threshold' : 'High consumption ratio'}
          </div>
        </div>

        {/* Metric 3 */}
        <div className="p-3.5 bg-slate-50/70 dark:bg-[#141414] rounded-xl border border-slate-100 dark:border-[#1f1f1f]">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-500 dark:text-[#A3A3A3]">Liquidity Cushion</span>
            <span className="text-[10px] font-bold text-emerald-600">Active</span>
          </div>
          <div className="text-xl font-bold text-slate-900 dark:text-white mt-1 tabular-nums">
            {formatINR(availableBalancePaise)}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            Immediate reserve availability
          </div>
        </div>
      </div>
    </div>
  );
}
