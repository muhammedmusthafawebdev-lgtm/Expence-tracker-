'use client';

import React from 'react';
import { Transaction, Category, AppScreen } from '@/types';
import { formatINR } from '@/lib/calculations/financial';
import { CategoryIcon } from '@/components/ui/CategoryIcon';
import { Clock, ArrowRight, Plus } from 'lucide-react';

interface RecentTransactionsWidgetProps {
  transactions: Transaction[];
  categories: Category[];
  onAddTransaction: () => void;
  onNavigate: (screen: AppScreen) => void;
}

export function RecentTransactionsWidget({
  transactions,
  categories,
  onAddTransaction,
  onNavigate,
}: RecentTransactionsWidgetProps) {
  const activeTransactions = transactions.filter((t) => !t.deletedAt).slice(0, 5);

  return (
    <div className="p-5 md:p-6 bg-white dark:bg-[#0A0A0A] rounded-2xl border border-slate-200/80 dark:border-[#262626]">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            Recent Transactions
          </h3>
          <p className="text-xs text-slate-500 dark:text-[#A3A3A3] mt-0.5">
            Latest entries from your ledger
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onAddTransaction}
            className="text-xs text-blue-600 dark:text-blue-400 font-medium hover:underline inline-flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" /> Add
          </button>
          <button
            onClick={() => onNavigate('transactions')}
            className="text-xs text-slate-500 dark:text-[#A3A3A3] hover:text-slate-900 dark:hover:text-white inline-flex items-center gap-1"
          >
            All <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {activeTransactions.length > 0 ? (
        <div className="divide-y divide-slate-100 dark:divide-[#1f1f1f]">
          {activeTransactions.map((tx) => {
            const cat = categories.find((c) => c.id === tx.categoryId);
            const isExpense = tx.type === 'expense';
            return (
              <div
                key={tx.id}
                className="py-2.5 flex items-center justify-between gap-3 first:pt-0 last:pb-0"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                    style={{
                      backgroundColor: `${cat?.color || '#3B82F6'}15`,
                      color: cat?.color || '#3B82F6',
                    }}
                  >
                    <CategoryIcon name={cat?.icon || 'Tag'} className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                      {cat?.name || 'General'}
                    </div>
                    <div className="text-[11px] text-slate-400 dark:text-[#737373] truncate">
                      {tx.date} {tx.description ? `· ${tx.description}` : ''}
                    </div>
                  </div>
                </div>

                <div
                  className={`text-xs font-bold tabular-nums shrink-0 ${
                    isExpense
                      ? 'text-rose-600 dark:text-rose-400'
                      : 'text-emerald-600 dark:text-emerald-400'
                  }`}
                >
                  {isExpense ? '-' : '+'}
                  {formatINR(tx.amountPaise)}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-6 text-center bg-slate-50 dark:bg-[#141414] rounded-xl border border-slate-200/60 dark:border-[#262626]">
          <p className="text-xs text-slate-500 dark:text-[#A3A3A3]">
            No transactions recorded yet.
          </p>
          <button
            onClick={onAddTransaction}
            className="mt-2.5 inline-flex items-center gap-1 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-xl transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> Record First Transaction
          </button>
        </div>
      )}
    </div>
  );
}
