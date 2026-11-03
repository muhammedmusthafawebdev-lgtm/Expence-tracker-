'use client';

import React, { useMemo } from 'react';
import { Transaction, Category } from '@/types';
import { formatINR } from '@/lib/calculations/financial';
import { CategoryIcon } from '@/components/ui/CategoryIcon';
import { CalendarCheck, AlertCircle, Plus } from 'lucide-react';

interface BillsRecurringWidgetProps {
  transactions: Transaction[];
  categories: Category[];
  onAddTransaction: () => void;
}

export function BillsRecurringWidget({
  transactions,
  categories,
  onAddTransaction,
}: BillsRecurringWidgetProps) {
  // Scoped to current calendar month (YYYY-MM)
  const currentMonthStr = useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  }, []);

  // Filter ONLY explicitly user-designated recurring expenses for current calendar month
  // Excludes lifetime data, deleted transactions, and non-expense records
  // No hardcoded service keywords and no automatic payment method inference
  const currentMonthRecurring = useMemo(() => {
    return transactions.filter((t) => {
      if (t.type !== 'expense' || t.deletedAt) return false;
      if (!t.isRecurring) return false; // Strictly requires user designation
      return t.date.startsWith(currentMonthStr);
    });
  }, [transactions, currentMonthStr]);

  const totalMonthlyRecurringPaise = useMemo(
    () => currentMonthRecurring.reduce((sum, t) => sum + t.amountPaise, 0),
    [currentMonthRecurring]
  );

  return (
    <div className="p-5 md:p-6 bg-white dark:bg-[#0A0A0A] rounded-2xl border border-slate-200/80 dark:border-[#262626]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <CalendarCheck className="w-4 h-4 text-amber-500" />
            Recurring Bills &amp; Subscriptions (This Month)
          </h3>
          <p className="text-xs text-slate-500 dark:text-[#A3A3A3] mt-0.5">
            Explicitly designated monthly commitments (rent, utilities, subscriptions)
          </p>
        </div>
        {totalMonthlyRecurringPaise > 0 && (
          <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 tabular-nums">
            This Month: {formatINR(totalMonthlyRecurringPaise)}
          </span>
        )}
      </div>

      {currentMonthRecurring.length > 0 ? (
        <div className="space-y-3">
          <div className="divide-y divide-slate-100 dark:divide-[#1f1f1f]">
            {currentMonthRecurring.slice(0, 5).map((item) => {
              const cat = categories.find((c) => c.id === item.categoryId);
              return (
                <div key={item.id} className="py-2 flex items-center justify-between text-xs first:pt-0 last:pb-0">
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <div
                      className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0"
                      style={{ backgroundColor: `${cat?.color || '#F59E0B'}20`, color: cat?.color || '#F59E0B' }}
                    >
                      <CategoryIcon name={cat?.icon || 'CalendarCheck'} className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="font-semibold text-slate-800 dark:text-slate-200 truncate block">
                        {item.description || cat?.name || 'Recurring Commitment'}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {item.date} {item.paymentMethod ? `· ${item.paymentMethod}` : ''}
                      </span>
                    </div>
                  </div>
                  <span className="font-bold text-slate-900 dark:text-white tabular-nums shrink-0 ml-3">
                    {formatINR(item.amountPaise)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="py-6 text-center bg-slate-50 dark:bg-[#141414] rounded-xl border border-slate-200/60 dark:border-[#262626]">
          <AlertCircle className="w-5 h-5 text-slate-400 mx-auto mb-1.5" />
          <p className="text-xs font-medium text-slate-700 dark:text-slate-300">
            No recurring bills or subscriptions designated for this month.
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5 max-w-sm mx-auto">
            Mark regular expenses (like rent or subscriptions) as recurring when recording transactions.
          </p>
          <button
            onClick={onAddTransaction}
            className="mt-2.5 inline-flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
          >
            <Plus className="w-3.5 h-3.5" /> Add Recurring Expense
          </button>
        </div>
      )}
    </div>
  );
}
