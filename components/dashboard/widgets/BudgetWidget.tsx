'use client';

import React from 'react';
import { Budget, Transaction, Category, AppScreen } from '@/types';
import { formatINR, getBudgetStatus, calculateBudgetSpent } from '@/lib/calculations/financial';
import { CategoryIcon } from '@/components/ui/CategoryIcon';
import { PieChart as PieIcon, ArrowRight, Plus } from 'lucide-react';

interface BudgetWidgetProps {
  budgets: Budget[];
  transactions: Transaction[];
  categories: Category[];
  onNavigate: (screen: AppScreen) => void;
}

export function BudgetWidget({
  budgets,
  transactions,
  categories,
  onNavigate,
}: BudgetWidgetProps) {
  return (
    <div className="p-5 md:p-6 bg-white dark:bg-[#0A0A0A] rounded-2xl border border-slate-200/80 dark:border-[#262626]">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <PieIcon className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            Budget Watchlist
          </h3>
          <p className="text-xs text-slate-500 dark:text-[#A3A3A3] mt-0.5">
            Spending progress against limits
          </p>
        </div>
        <button
          onClick={() => onNavigate('budget')}
          className="text-xs text-blue-600 dark:text-blue-400 font-medium hover:underline inline-flex items-center gap-1"
        >
          Manage <ArrowRight className="w-3 h-3" />
        </button>
      </div>

      {budgets.length > 0 ? (
        <div className="space-y-3.5">
          {budgets.slice(0, 4).map((bg) => {
            const cat = categories.find((c) => c.id === bg.categoryId);
            // Strictly compute real spend for current period (monthly: current month only; yearly: current year only)
            const spentPaise = calculateBudgetSpent(transactions, bg.categoryId, bg.period);

            const usagePct =
              bg.limitPaise > 0 ? Math.round((spentPaise / bg.limitPaise) * 100) : 0;
            const status = getBudgetStatus(usagePct);

            return (
              <div key={bg.id} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <div
                      className="w-5 h-5 rounded-md flex items-center justify-center shrink-0"
                      style={{ backgroundColor: `${cat?.color || '#3B82F6'}20`, color: cat?.color || '#3B82F6' }}
                    >
                      <CategoryIcon name={cat?.icon || 'Tag'} className="w-3 h-3" />
                    </div>
                    <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                      {cat?.name || 'Category'}
                    </span>
                    <span className="text-[10px] text-slate-400 uppercase">({bg.period})</span>
                  </div>
                  <span className="font-semibold text-slate-900 dark:text-white tabular-nums shrink-0 ml-2">
                    {formatINR(spentPaise)} / {formatINR(bg.limitPaise)} ({usagePct}%)
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-[#141414] overflow-hidden">
                  <div
                    className={`h-full ${status.progressClass}`}
                    style={{ width: `${Math.min(100, usagePct)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-6 text-center bg-slate-50 dark:bg-[#141414] rounded-xl border border-slate-200/60 dark:border-[#262626]">
          <p className="text-xs text-slate-500 dark:text-[#A3A3A3]">
            No budget limits set. Create spending caps to track limits.
          </p>
          <button
            onClick={() => onNavigate('budget')}
            className="mt-2.5 inline-flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
          >
            <Plus className="w-3.5 h-3.5" /> Create Budget
          </button>
        </div>
      )}
    </div>
  );
}
