'use client';

import React, { useState, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import {
  FileText,
  Printer,
  Calendar,
} from 'lucide-react';
import { formatINR } from '@/lib/calculations/financial';
import { EmptyState } from '@/components/ui/EmptyState';

export function ReportsView() {
  const {
    transactions,
    budgets,
    userProfile,
    categories,
    savingsGoals,
    openAddTransaction,
  } = useApp();

  // Period selector: strictly This Month, This Year, All Time
  const [dateRange, setDateRange] = useState<'this_month' | 'this_year' | 'all_time'>('this_month');

  const currentMonthStr = useMemo(() => new Date().toISOString().substring(0, 7), []);
  const currentYearStr = useMemo(() => new Date().toISOString().substring(0, 4), []);

  const periodTransactions = useMemo(() => {
    return transactions.filter((t) => {
      if (t.deletedAt) return false;
      if (dateRange === 'this_month') return t.date.startsWith(currentMonthStr);
      if (dateRange === 'this_year') return t.date.startsWith(currentYearStr);
      return true;
    });
  }, [transactions, dateRange, currentMonthStr, currentYearStr]);

  const periodIncomePaise = useMemo(() => {
    return periodTransactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amountPaise, 0);
  }, [periodTransactions]);

  const periodExpensesPaise = useMemo(() => {
    return periodTransactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amountPaise, 0);
  }, [periodTransactions]);

  const totalSavedPaise = useMemo(() => {
    return savingsGoals.reduce((sum, g) => sum + g.currentAmountPaise, 0);
  }, [savingsGoals]);

  const netBalancePaise = periodIncomePaise - periodExpensesPaise;
  const availableBalancePaise = netBalancePaise - totalSavedPaise;

  const hasData = transactions.filter((t) => !t.deletedAt).length > 0;

  const handlePrint = () => {
    window.print();
  };

  const generatedDateStr = new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date());

  const periodLabelMap: Record<'this_month' | 'this_year' | 'all_time', string> = {
    this_month: 'This Month',
    this_year: 'This Year',
    all_time: 'All Time',
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header - Hidden on Print */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            Financial Reports
          </h2>
          <p className="text-xs text-slate-500 dark:text-[#A3A3A3] mt-0.5">
            Exportable statement breakdown across income, expenses, budgets, and savings
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={handlePrint}
            disabled={!hasData}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-900 dark:bg-white dark:text-black hover:bg-slate-800 dark:hover:bg-slate-200 rounded-xl transition-colors duration-150 disabled:opacity-40 active:scale-95"
          >
            <Printer className="w-4 h-4" />
            Print / Save as PDF
          </button>
        </div>
      </div>

      {/* Date Range Selector - Hidden on Print */}
      <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-[#0A0A0A] rounded-xl border border-slate-200/60 dark:border-[#262626] w-fit print:hidden">
        {(
          [
            { id: 'this_month', label: 'This Month' },
            { id: 'this_year', label: 'This Year' },
            { id: 'all_time', label: 'All Time' },
          ] as const
        ).map((r) => (
          <button
            key={r.id}
            onClick={() => setDateRange(r.id)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors duration-150 ${
              dateRange === r.id
                ? 'bg-white dark:bg-[#262626] text-slate-900 dark:text-white'
                : 'text-slate-600 dark:text-[#A3A3A3]'
            }`}
          >
            {r.label}
          </button>
        ))}
      </div>

      {hasData ? (
        /* Printable Report Statement Paper */
        <div className="p-8 md:p-10 bg-white dark:bg-[#0A0A0A] rounded-2xl border border-slate-200/80 dark:border-[#262626] space-y-8 print:border-none print:shadow-none print:p-0 print:bg-white print:text-black">
          {/* Statement Header */}
          <div className="flex items-start justify-between border-b border-slate-200 dark:border-[#262626] pb-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-black flex items-center justify-center font-bold text-xs">
                  ₹
                </div>
                <span className="text-xs uppercase font-bold tracking-wider text-blue-600 dark:text-blue-400">
                  Expence Tracker · Financial Statement
                </span>
              </div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                Financial Status Report
              </h1>
              <div className="text-xs text-slate-500 dark:text-[#A3A3A3] flex items-center gap-2 pt-0.5">
                <Calendar className="w-3.5 h-3.5" />
                <span suppressHydrationWarning>Generated: {generatedDateStr}</span>
                <span>·</span>
                <span className="font-medium">Period: {periodLabelMap[dateRange].toUpperCase()}</span>
              </div>
            </div>

            <div className="text-right text-xs space-y-0.5">
              <div className="font-bold text-slate-900 dark:text-white text-sm">
                {userProfile.name || 'Student Account'}
              </div>
              <div className="text-slate-500 dark:text-[#A3A3A3]">{userProfile.institution || 'Educational Institution'}</div>
              {userProfile.rollNumber && (
                <div className="text-slate-400">Roll/ID: {userProfile.rollNumber}</div>
              )}
              <div className="text-xs font-semibold text-slate-500 pt-1">Currency: INR (₹)</div>
            </div>
          </div>

          {/* Section 1: Income Report */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              01. Income Credits Summary
            </h3>
            <div className="bg-slate-50 dark:bg-[#141414] rounded-xl p-4 flex items-center justify-between text-xs border border-slate-100 dark:border-[#262626]">
              <div>
                <div className="font-medium text-slate-700 dark:text-slate-300">
                  Total Income Logged ({periodLabelMap[dateRange]})
                </div>
                <div className="text-xs text-slate-400 dark:text-[#A3A3A3] mt-0.5">
                  Allowances, scholarships, and freelance earnings
                </div>
              </div>
              <div className="text-base font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                {formatINR(periodIncomePaise)}
              </div>
            </div>
          </div>

          {/* Section 2: Expense Report */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              02. Expense Debits Summary
            </h3>
            <div className="bg-slate-50 dark:bg-[#141414] rounded-xl p-4 flex items-center justify-between text-xs border border-slate-100 dark:border-[#262626]">
              <div>
                <div className="font-medium text-slate-700 dark:text-slate-300">
                  Total Expenses Logged ({periodLabelMap[dateRange]})
                </div>
                <div className="text-xs text-slate-400 dark:text-[#A3A3A3] mt-0.5">
                  Mess, accommodation, transit, books, stationery, and supplies
                </div>
              </div>
              <div className="text-base font-bold text-rose-600 dark:text-rose-400 tabular-nums">
                {formatINR(periodExpensesPaise)}
              </div>
            </div>
          </div>

          {/* Section 3: Budget Performance */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              03. Budget Compliance Watchlist
            </h3>
            {budgets.length > 0 ? (
              <div className="divide-y divide-slate-100 dark:divide-[#262626] border border-slate-100 dark:border-[#262626] rounded-xl overflow-hidden text-xs">
                {budgets.map((b) => {
                  const cat = categories.find((c) => c.id === b.categoryId);
                  const spent = transactions
                    .filter((t) => t.categoryId === b.categoryId && t.type === 'expense' && !t.deletedAt)
                    .reduce((sum, t) => sum + t.amountPaise, 0);
                  const pct = b.limitPaise > 0 ? Math.round((spent / b.limitPaise) * 100) : 0;
                  return (
                    <div key={b.id} className="p-3 flex items-center justify-between bg-slate-50/50 dark:bg-[#141414]/60">
                      <span className="font-medium text-slate-800 dark:text-slate-200">
                        {cat?.name} ({b.period} cap)
                      </span>
                      <span className="tabular-nums font-semibold text-slate-900 dark:text-white">
                        {formatINR(spent)} / {formatINR(b.limitPaise)} ({pct}%)
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-slate-400 dark:text-[#A3A3A3] italic">No budget caps configured for this period.</p>
            )}
          </div>

          {/* Section 4: Savings Allocation */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              04. Dedicated Savings Allocation
            </h3>
            <div className="bg-slate-50 dark:bg-[#141414] rounded-xl p-4 flex items-center justify-between text-xs border border-slate-100 dark:border-[#262626]">
              <div>
                <div className="font-medium text-slate-700 dark:text-slate-300">
                  Total Allocated Savings
                </div>
                <div className="text-xs text-slate-400 dark:text-[#A3A3A3] mt-0.5">
                  Stored student allocations for milestone targets (not debited as expenses)
                </div>
              </div>
              <div className="text-base font-bold text-blue-600 dark:text-blue-400 tabular-nums">
                {formatINR(totalSavedPaise)}
              </div>
            </div>
          </div>

          {/* Balance Bottom Line */}
          <div className="pt-6 border-t-2 border-slate-900 dark:border-[#262626] flex items-center justify-between">
            <div>
              <div className="text-sm font-bold text-slate-900 dark:text-white">
                Net Available Balance
              </div>
              <div className="text-xs text-slate-400 dark:text-[#A3A3A3]">Total Income minus Expenses &amp; Dedicated Savings</div>
            </div>
            <div className="text-2xl font-bold tabular-nums text-slate-900 dark:text-white">
              {formatINR(availableBalancePaise)}
            </div>
          </div>

          {/* Academic Declaration Footer */}
          <div className="pt-6 border-t border-slate-200 dark:border-[#262626] space-y-3">
            <div className="p-3.5 bg-slate-50 dark:bg-[#141414] rounded-xl border border-slate-200/60 dark:border-[#262626] text-xs text-slate-600 dark:text-[#A3A3A3] leading-relaxed">
              <strong>Student Financial Declaration:</strong> I hereby declare that the financial entries, budget allocations, and expense debits presented above represent a verifiable record of my academic allowances and expenditures.
            </div>

            {/* Academic Signature Blocks */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4">
              <div className="space-y-8">
                <div className="border-b border-slate-300 dark:border-[#262626] h-10" />
                <div className="text-xs">
                  <div className="font-semibold text-slate-900 dark:text-white">
                    {userProfile.name || 'Student Signature'}
                  </div>
                  <div className="text-xs text-slate-400 dark:text-[#A3A3A3]">Account Holder</div>
                </div>
              </div>

              <div className="space-y-8">
                <div className="border-b border-slate-300 dark:border-[#262626] h-10" />
                <div className="text-xs">
                  <div className="font-semibold text-slate-900 dark:text-white">
                    Faculty Advisor / Mentor
                  </div>
                  <div className="text-xs text-slate-400 dark:text-[#A3A3A3]">Academic Institution</div>
                </div>
              </div>

              <div className="space-y-8">
                <div className="border-b border-slate-300 dark:border-[#262626] h-10" />
                <div className="text-xs">
                  <div className="font-semibold text-slate-900 dark:text-white">
                    Parent / Guardian Signature
                  </div>
                  <div className="text-xs text-slate-400 dark:text-[#A3A3A3]">Family Representative</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <EmptyState
          icon={FileText}
          title="No Data Available for Report Generation"
          description="In compliance with our zero fake data policy, statements cannot be generated with fabricated figures. Log genuine transactions first to produce verifiable reports."
          actionLabel="Log Transaction"
          onAction={openAddTransaction}
        />
      )}
    </div>
  );
}
