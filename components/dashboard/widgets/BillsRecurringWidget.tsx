'use client';

import React, { useMemo } from 'react';
import { Transaction, Category } from '@/types';
import { formatINR } from '@/lib/calculations/financial';
import { CategoryIcon } from '@/components/ui/CategoryIcon';
import { CalendarCheck, AlertCircle } from 'lucide-react';

interface BillsRecurringWidgetProps {
  transactions: Transaction[];
  categories: Category[];
  onAddTransaction: () => void;
}

const RECURRING_KEYWORDS = [
  'rent',
  'hostel',
  'electricity',
  'wifi',
  'internet',
  'subscription',
  'netflix',
  'spotify',
  'prime',
  'emi',
  'bill',
  'recharge',
  'insurance',
  'gym',
  'tuition',
  'fee',
];

export function BillsRecurringWidget({
  transactions,
  categories,
  onAddTransaction,
}: BillsRecurringWidgetProps) {
  // Filter transactions that represent recurring bills
  const recurringItems = useMemo(() => {
    return transactions.filter((t) => {
      if (t.type !== 'expense' || t.deletedAt) return false;
      const cat = categories.find((c) => c.id === t.categoryId);
      const name = (cat?.name || '').toLowerCase();
      const desc = (t.description || '').toLowerCase();
      return (
        RECURRING_KEYWORDS.some((kw) => name.includes(kw) || desc.includes(kw)) ||
        t.paymentMethod === 'Net Banking' ||
        t.paymentMethod === 'Credit Card'
      );
    });
  }, [transactions, categories]);

  const totalRecurringPaise = useMemo(
    () => recurringItems.reduce((sum, t) => sum + t.amountPaise, 0),
    [recurringItems]
  );

  return (
    <div className="p-5 md:p-6 bg-white dark:bg-[#0A0A0A] rounded-2xl border border-slate-200/80 dark:border-[#262626]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <CalendarCheck className="w-4 h-4 text-amber-500" />
            Bills &amp; Recurring Payments
          </h3>
          <p className="text-xs text-slate-500 dark:text-[#A3A3A3] mt-0.5">
            Subscriptions, utilities, rents &amp; fixed commitments
          </p>
        </div>
        {totalRecurringPaise > 0 && (
          <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 tabular-nums">
            Total Tracked: {formatINR(totalRecurringPaise)}
          </span>
        )}
      </div>

      {recurringItems.length > 0 ? (
        <div className="space-y-3">
          <div className="divide-y divide-slate-100 dark:divide-[#1f1f1f]">
            {recurringItems.slice(0, 4).map((item) => {
              const cat = categories.find((c) => c.id === item.categoryId);
              return (
                <div key={item.id} className="py-2 flex items-center justify-between text-xs first:pt-0 last:pb-0">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0"
                      style={{ backgroundColor: `${cat?.color || '#F59E0B'}20`, color: cat?.color || '#F59E0B' }}
                    >
                      <CategoryIcon name={cat?.icon || 'CalendarCheck'} className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                      <span className="font-semibold text-slate-800 dark:text-slate-200 truncate block">
                        {item.description || cat?.name || 'Recurring Payment'}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {item.date} {item.paymentMethod ? `via ${item.paymentMethod}` : ''}
                      </span>
                    </div>
                  </div>
                  <span className="font-bold text-slate-900 dark:text-white tabular-nums shrink-0 ml-2">
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
          <p className="text-xs text-slate-500 dark:text-[#A3A3A3]">
            No recurring bills or subscriptions detected in active records.
          </p>
          <button
            onClick={onAddTransaction}
            className="mt-2 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
          >
            + Record Bill / Subscription
          </button>
        </div>
      )}
    </div>
  );
}
