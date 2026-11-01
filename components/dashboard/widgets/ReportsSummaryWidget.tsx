'use client';

import React from 'react';
import { AppScreen } from '@/types';
import { formatINR } from '@/lib/calculations/financial';
import { FileText, ArrowRight, TrendingUp, Calendar } from 'lucide-react';

interface ReportsSummaryWidgetProps {
  periodIncomePaise: number;
  periodExpensesPaise: number;
  transactionCount: number;
  periodLabel: string;
  onNavigate: (screen: AppScreen) => void;
}

export function ReportsSummaryWidget({
  periodIncomePaise,
  periodExpensesPaise,
  transactionCount,
  periodLabel,
  onNavigate,
}: ReportsSummaryWidgetProps) {
  const netPaise = periodIncomePaise - periodExpensesPaise;
  const isNetPositive = netPaise >= 0;
  const avgPerTxPaise =
    transactionCount > 0 ? Math.round(periodExpensesPaise / transactionCount) : 0;

  return (
    <div className="p-5 md:p-6 bg-white dark:bg-[#0A0A0A] rounded-2xl border border-slate-200/80 dark:border-[#262626]">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            Executive Financial Summary ({periodLabel})
          </h3>
          <p className="text-xs text-slate-500 dark:text-[#A3A3A3] mt-0.5">
            Key metrics snapshot from your financial records
          </p>
        </div>
        <button
          onClick={() => onNavigate('reports')}
          className="text-xs text-blue-600 dark:text-blue-400 font-medium hover:underline inline-flex items-center gap-1"
        >
          Full Reports <ArrowRight className="w-3 h-3" />
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
        <div className="p-3 bg-slate-50/70 dark:bg-[#141414] rounded-xl border border-slate-100 dark:border-[#1f1f1f]">
          <div className="text-[11px] text-slate-500 dark:text-[#A3A3A3]">Transactions</div>
          <div className="text-lg font-bold text-slate-900 dark:text-white mt-0.5 tabular-nums">
            {transactionCount}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1">
            <Calendar className="w-3 h-3" /> In {periodLabel.toLowerCase()}
          </div>
        </div>

        <div className="p-3 bg-slate-50/70 dark:bg-[#141414] rounded-xl border border-slate-100 dark:border-[#1f1f1f]">
          <div className="text-[11px] text-slate-500 dark:text-[#A3A3A3]">Avg Expense/Tx</div>
          <div className="text-lg font-bold text-slate-900 dark:text-white mt-0.5 tabular-nums">
            {formatINR(avgPerTxPaise)}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Mean per ticket</div>
        </div>

        <div className="p-3 bg-slate-50/70 dark:bg-[#141414] rounded-xl border border-slate-100 dark:border-[#1f1f1f]">
          <div className="text-[11px] text-slate-500 dark:text-[#A3A3A3]">Net Retention</div>
          <div className={`text-lg font-bold mt-0.5 tabular-nums ${isNetPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
            {isNetPositive ? '+' : ''}{formatINR(netPaise)}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Operating balance</div>
        </div>

        <div className="p-3 bg-slate-50/70 dark:bg-[#141414] rounded-xl border border-slate-100 dark:border-[#1f1f1f]">
          <div className="text-[11px] text-slate-500 dark:text-[#A3A3A3]">Cash Flow Status</div>
          <div className="text-lg font-bold text-slate-900 dark:text-white mt-0.5 flex items-center gap-1">
            <TrendingUp className={`w-4 h-4 ${isNetPositive ? 'text-emerald-500' : 'text-rose-500'}`} />
            <span className="text-xs">{isNetPositive ? 'Surplus' : 'Deficit'}</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Budget health</div>
        </div>
      </div>
    </div>
  );
}
