'use client';

import React from 'react';
import { formatINR, calculateFinancialHealth } from '@/lib/calculations/financial';
import { ShieldCheck, HeartPulse, Sparkles, AlertCircle, Activity } from 'lucide-react';

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
  // Evaluates transparent 3-pillar health scoring with zero division risk and no fabricated default score
  const health = calculateFinancialHealth(
    periodIncomePaise,
    periodExpensesPaise,
    savingsAllocatedPaise,
    availableBalancePaise
  );

  return (
    <div className="p-5 md:p-6 bg-white dark:bg-[#0A0A0A] rounded-2xl border border-slate-200/80 dark:border-[#262626]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <HeartPulse className="w-4 h-4 text-emerald-500" />
            Financial Health Indicator
          </h3>
          <p className="text-xs text-slate-500 dark:text-[#A3A3A3] mt-0.5">
            Objective assessment of operating surplus, consumption discipline &amp; reserves
          </p>
        </div>
        {health.status !== 'empty' && (
          <span className={`text-xs font-bold px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-[#141414] ${health.gradeColor}`}>
            Grade: {health.grade} ({health.score}/100)
          </span>
        )}
      </div>

      {health.status === 'empty' ? (
        <div className="py-6 text-center bg-slate-50 dark:bg-[#141414] rounded-xl border border-slate-200/60 dark:border-[#262626]">
          <Activity className="w-5 h-5 text-slate-400 mx-auto mb-1.5" />
          <p className="text-xs font-medium text-slate-700 dark:text-slate-300">
            No financial activity recorded for this period.
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5 max-w-sm mx-auto">
            Record income and expense transactions to generate an evidence-based financial health assessment.
          </p>
        </div>
      ) : health.status === 'deficit' ? (
        <div className="space-y-3">
          <div className="p-4 rounded-xl bg-rose-50/60 dark:bg-rose-950/20 border border-rose-200/60 dark:border-rose-900/40 flex items-start gap-3">
            <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
            <div>
              <div className="text-xs font-semibold text-rose-700 dark:text-rose-300">
                Operating in Pure Deficit
              </div>
              <p className="text-[11px] text-rose-600 dark:text-rose-400 mt-0.5">
                Expenses recorded ({formatINR(periodExpensesPaise)}) with ₹0 incoming funds. Record your monthly allowance or income to balance cash flow.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="p-3.5 bg-slate-50/70 dark:bg-[#141414] rounded-xl border border-slate-100 dark:border-[#1f1f1f]">
              <div className="text-[11px] text-slate-500 dark:text-[#A3A3A3]">Outgoing Expenses</div>
              <div className="text-xl font-bold text-rose-600 dark:text-rose-400 mt-1 tabular-nums">
                {formatINR(periodExpensesPaise)}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">Zero incoming cash flow</div>
            </div>
            <div className="p-3.5 bg-slate-50/70 dark:bg-[#141414] rounded-xl border border-slate-100 dark:border-[#1f1f1f]">
              <div className="text-[11px] text-slate-500 dark:text-[#A3A3A3]">Immediate Liquid Cushion</div>
              <div className="text-xl font-bold text-slate-900 dark:text-white mt-1 tabular-nums">
                {formatINR(availableBalancePaise)}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">Ledger available funds</div>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-1">
          {/* Pillar 1: Savings Rate */}
          <div className="p-3.5 bg-slate-50/70 dark:bg-[#141414] rounded-xl border border-slate-100 dark:border-[#1f1f1f]">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-slate-500 dark:text-[#A3A3A3]">Savings Rate</span>
              <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
            </div>
            <div className="text-xl font-bold text-slate-900 dark:text-white mt-1 tabular-nums">
              {health.savingsRate}%
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              {health.savingsRate >= 20 ? 'Target met (≥20% rule)' : 'Target recommended: 20%'}
            </div>
          </div>

          {/* Pillar 2: Spend-to-Income Discipline */}
          <div className="p-3.5 bg-slate-50/70 dark:bg-[#141414] rounded-xl border border-slate-100 dark:border-[#1f1f1f]">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-slate-500 dark:text-[#A3A3A3]">Spend-to-Income</span>
              <Sparkles className="w-3.5 h-3.5 text-purple-500" />
            </div>
            <div className="text-xl font-bold text-slate-900 dark:text-white mt-1 tabular-nums">
              {health.spendingRatio}%
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              {health.spendingRatio <= 80 ? 'Within sustainable threshold' : 'High consumption ratio'}
            </div>
          </div>

          {/* Pillar 3: Immediate Liquidity Cushion */}
          <div className="p-3.5 bg-slate-50/70 dark:bg-[#141414] rounded-xl border border-slate-100 dark:border-[#1f1f1f]">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-slate-500 dark:text-[#A3A3A3]">Liquidity Cushion</span>
              <span className={`text-[10px] font-bold ${availableBalancePaise >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                {availableBalancePaise >= 0 ? 'Surplus' : 'Deficit'}
              </span>
            </div>
            <div className={`text-xl font-bold mt-1 tabular-nums ${availableBalancePaise >= 0 ? 'text-slate-900 dark:text-white' : 'text-rose-600 dark:text-rose-400'}`}>
              {formatINR(availableBalancePaise)}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              Immediate deployable balance
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
