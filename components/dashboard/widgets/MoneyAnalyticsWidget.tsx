'use client';

import React, { useMemo } from 'react';
import { Transaction, Category } from '@/types';
import { formatINR } from '@/lib/calculations/financial';
import { CategoryIcon } from '@/components/ui/CategoryIcon';
import { PieChart, Plus } from 'lucide-react';

interface MoneyAnalyticsWidgetProps {
  periodTransactions: Transaction[];
  categories: Category[];
  periodLabel: string;
  onAddTransaction: () => void;
}

export function MoneyAnalyticsWidget({
  periodTransactions,
  categories,
  periodLabel,
  onAddTransaction,
}: MoneyAnalyticsWidgetProps) {
  const expenseTransactions = useMemo(
    () => periodTransactions.filter((t) => t.type === 'expense' && !t.deletedAt),
    [periodTransactions]
  );

  const totalExpensePaise = useMemo(
    () => expenseTransactions.reduce((sum, t) => sum + t.amountPaise, 0),
    [expenseTransactions]
  );

  // Group by category and compute percentages
  const categoryBreakdown = useMemo(() => {
    if (totalExpensePaise === 0) return [];

    const map: Record<string, { amountPaise: number; count: number }> = {};
    expenseTransactions.forEach((t) => {
      map[t.categoryId] = {
        amountPaise: (map[t.categoryId]?.amountPaise || 0) + t.amountPaise,
        count: (map[t.categoryId]?.count || 0) + 1,
      };
    });

    return Object.entries(map)
      .map(([catId, data]) => {
        const cat = categories.find((c) => c.id === catId);
        const percentage = Math.round((data.amountPaise / totalExpensePaise) * 100);
        return {
          id: catId,
          name: cat?.name || 'Uncategorized',
          color: cat?.color || '#3B82F6',
          icon: cat?.icon || 'Tag',
          amountPaise: data.amountPaise,
          count: data.count,
          percentage,
        };
      })
      .sort((a, b) => b.amountPaise - a.amountPaise);
  }, [expenseTransactions, totalExpensePaise, categories]);

  return (
    <div className="p-5 md:p-6 bg-white dark:bg-[#0A0A0A] rounded-2xl border border-slate-200/80 dark:border-[#262626]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5">
        <div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <PieChart className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            Money Analytics ({periodLabel})
          </h3>
          <p className="text-xs text-slate-500 dark:text-[#A3A3A3] mt-0.5">
            Spending distribution and category proportion
          </p>
        </div>
        {totalExpensePaise > 0 && (
          <span className="text-xs font-semibold text-slate-900 dark:text-white tabular-nums">
            Total Spent: {formatINR(totalExpensePaise)}
          </span>
        )}
      </div>

      {categoryBreakdown.length > 0 ? (
        <div className="space-y-4">
          {/* Visual multi-segment bar */}
          <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-[#141414] overflow-hidden flex">
            {categoryBreakdown.map((item) => (
              <div
                key={item.id}
                style={{
                  width: `${Math.max(2, item.percentage)}%`,
                  backgroundColor: item.color,
                }}
                className="h-full transition-all duration-300 first:rounded-l-full last:rounded-r-full"
                title={`${item.name}: ${item.percentage}%`}
              />
            ))}
          </div>

          {/* Category List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
            {categoryBreakdown.slice(0, 6).map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-[#141414] transition-colors"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                    style={{ backgroundColor: `${item.color}20`, color: item.color }}
                  >
                    <CategoryIcon name={item.icon} className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                      {item.name}
                    </div>
                    <div className="text-[10px] text-slate-400 dark:text-[#737373]">
                      {item.count} {item.count === 1 ? 'transaction' : 'transactions'}
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-xs font-bold text-slate-900 dark:text-white tabular-nums">
                    {formatINR(item.amountPaise)}
                  </div>
                  <div className="text-[10px] font-medium text-slate-500 dark:text-[#A3A3A3] tabular-nums">
                    {item.percentage}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="py-8 text-center bg-slate-50 dark:bg-[#141414] rounded-xl border border-slate-200/60 dark:border-[#262626]">
          <p className="text-xs text-slate-500 dark:text-[#A3A3A3]">
            No expenses recorded for {periodLabel.toLowerCase()}.
          </p>
          <button
            onClick={onAddTransaction}
            className="mt-2.5 inline-flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
          >
            <Plus className="w-3.5 h-3.5" /> Record Expense
          </button>
        </div>
      )}
    </div>
  );
}
