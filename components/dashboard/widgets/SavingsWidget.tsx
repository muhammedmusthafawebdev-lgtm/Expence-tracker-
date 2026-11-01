'use client';

import React from 'react';
import { SavingsGoal, AppScreen } from '@/types';
import { formatINR } from '@/lib/calculations/financial';
import { PiggyBank, ArrowRight, Plus } from 'lucide-react';

interface SavingsWidgetProps {
  savingsGoals: SavingsGoal[];
  onNavigate: (screen: AppScreen) => void;
}

export function SavingsWidget({ savingsGoals, onNavigate }: SavingsWidgetProps) {
  const totalSavedPaise = savingsGoals.reduce((sum, g) => sum + g.currentAmountPaise, 0);
  const totalTargetPaise = savingsGoals.reduce((sum, g) => sum + g.targetAmountPaise, 0);
  const overallPct =
    totalTargetPaise > 0 ? Math.min(100, Math.round((totalSavedPaise / totalTargetPaise) * 100)) : 0;

  return (
    <div className="p-5 md:p-6 bg-white dark:bg-[#0A0A0A] rounded-2xl border border-slate-200/80 dark:border-[#262626]">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <PiggyBank className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            Savings Goals
          </h3>
          <p className="text-xs text-slate-500 dark:text-[#A3A3A3] mt-0.5">
            Dedicated fund milestone progress
          </p>
        </div>
        <button
          onClick={() => onNavigate('savings')}
          className="text-xs text-blue-600 dark:text-blue-400 font-medium hover:underline inline-flex items-center gap-1"
        >
          View All <ArrowRight className="w-3 h-3" />
        </button>
      </div>

      {savingsGoals.length > 0 ? (
        <div className="space-y-4">
          {/* Header Summary */}
          <div className="p-3 bg-purple-50/50 dark:bg-purple-950/20 rounded-xl border border-purple-100/60 dark:border-purple-900/40 flex items-center justify-between">
            <div>
              <div className="text-[10px] uppercase font-bold text-purple-700 dark:text-purple-300">
                Total Saved
              </div>
              <div className="text-base font-bold text-slate-900 dark:text-white tabular-nums">
                {formatINR(totalSavedPaise)}{' '}
                <span className="text-xs font-normal text-slate-500 dark:text-[#A3A3A3]">
                  of {formatINR(totalTargetPaise)}
                </span>
              </div>
            </div>
            <span className="text-xs font-bold text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/60 px-2 py-0.5 rounded-full">
              {overallPct}%
            </span>
          </div>

          {/* Goal items */}
          <div className="space-y-3">
            {savingsGoals.slice(0, 3).map((goal) => {
              const pct =
                goal.targetAmountPaise > 0
                  ? Math.min(100, Math.round((goal.currentAmountPaise / goal.targetAmountPaise) * 100))
                  : 0;

              return (
                <div key={goal.id} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                      {goal.title}
                    </span>
                    <span className="font-semibold text-slate-900 dark:text-white tabular-nums ml-2">
                      {formatINR(goal.currentAmountPaise)} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-[#141414] overflow-hidden">
                    <div
                      className="h-full bg-purple-600 rounded-full transition-all duration-300"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="py-6 text-center bg-slate-50 dark:bg-[#141414] rounded-xl border border-slate-200/60 dark:border-[#262626]">
          <p className="text-xs text-slate-500 dark:text-[#A3A3A3]">
            No savings goals set yet. Create your first goal.
          </p>
          <button
            onClick={() => onNavigate('savings')}
            className="mt-2.5 inline-flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
          >
            <Plus className="w-3.5 h-3.5" /> Add Goal
          </button>
        </div>
      )}
    </div>
  );
}
