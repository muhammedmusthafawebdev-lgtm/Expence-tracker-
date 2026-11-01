'use client';

import React, { useMemo } from 'react';
import { Transaction, Category } from '@/types';
import { formatINR } from '@/lib/calculations/financial';
import { CategoryIcon } from '@/components/ui/CategoryIcon';
import { CreditCard, CheckCircle2 } from 'lucide-react';

interface DebtEmiWidgetProps {
  transactions: Transaction[];
  categories: Category[];
}

export function DebtEmiWidget({ transactions, categories }: DebtEmiWidgetProps) {
  // Detect EMI and loan entries
  const emiTransactions = useMemo(() => {
    return transactions.filter((t) => {
      if (t.type !== 'expense' || t.deletedAt) return false;
      const cat = categories.find((c) => c.id === t.categoryId);
      const name = (cat?.name || '').toLowerCase();
      const desc = (t.description || '').toLowerCase();
      return (
        name.includes('emi') ||
        name.includes('loan') ||
        desc.includes('emi') ||
        desc.includes('loan') ||
        t.paymentMethod === 'Credit Card'
      );
    });
  }, [transactions, categories]);

  const totalEmiPaise = useMemo(
    () => emiTransactions.reduce((sum, t) => sum + t.amountPaise, 0),
    [emiTransactions]
  );

  return (
    <div className="p-5 md:p-6 bg-white dark:bg-[#0A0A0A] rounded-2xl border border-slate-200/80 dark:border-[#262626]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-rose-500" />
            Debt &amp; EMI Commitments
          </h3>
          <p className="text-xs text-slate-500 dark:text-[#A3A3A3] mt-0.5">
            Credit cards, loan EMIs, and debt obligations
          </p>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 tabular-nums">
          Total Tracked: {formatINR(totalEmiPaise)}
        </span>
      </div>

      {emiTransactions.length > 0 ? (
        <div className="divide-y divide-slate-100 dark:divide-[#1f1f1f]">
          {emiTransactions.slice(0, 4).map((item) => {
            const cat = categories.find((c) => c.id === item.categoryId);
            return (
              <div key={item.id} className="py-2.5 flex items-center justify-between text-xs first:pt-0 last:pb-0">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                    style={{ backgroundColor: `${cat?.color || '#DC2626'}20`, color: cat?.color || '#DC2626' }}
                  >
                    <CategoryIcon name={cat?.icon || 'CreditCard'} className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0">
                    <span className="font-semibold text-slate-800 dark:text-slate-200 truncate block">
                      {item.description || cat?.name || 'EMI Payment'}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {item.date} {item.paymentMethod ? `· ${item.paymentMethod}` : ''}
                    </span>
                  </div>
                </div>
                <span className="font-bold text-rose-600 dark:text-rose-400 tabular-nums shrink-0 ml-2">
                  {formatINR(item.amountPaise)}
                </span>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-6 text-center bg-slate-50 dark:bg-[#141414] rounded-xl border border-slate-200/60 dark:border-[#262626]">
          <CheckCircle2 className="w-5 h-5 text-emerald-500 mx-auto mb-1.5" />
          <p className="text-xs font-medium text-slate-700 dark:text-slate-300">
            No active debt or EMI obligations detected.
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            You are operating with zero recorded debt overhead.
          </p>
        </div>
      )}
    </div>
  );
}
