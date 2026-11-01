'use client';

import React, { useState, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import {
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  PiggyBank,
  Plus,
  ArrowRight,
  Calendar,
  FolderOpen,
  PieChart as PieIcon,
  SlidersHorizontal,
} from 'lucide-react';
import { formatINR, paiseToRupees, getBudgetStatus } from '@/lib/calculations/financial';
import { CategoryIcon } from '@/components/ui/CategoryIcon';
import { EmptyState } from '@/components/ui/EmptyState';
import { DashboardWidgetId } from '@/types';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  PieChart,
  Pie,
} from 'recharts';

export function DashboardView() {
  const {
    userProfile,
    financialSummary,
    transactions,
    categories,
    budgets,
    savingsGoals,
    widgets,
    setIsCustomizeModalOpen,
    openAddTransaction,
    setCurrentScreen,
  } = useApp();

  // Period selector: Strictly This Month, This Year, All Time
  const [dateFilter, setDateFilter] = useState<'this_month' | 'this_year' | 'all_time'>('this_month');

  // Format today's date
  const todayFormatted = new Intl.DateTimeFormat('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date());

  const currentMonthStr = useMemo(() => new Date().toISOString().substring(0, 7), []);
  const currentYearStr = useMemo(() => new Date().toISOString().substring(0, 4), []);

  // Filter transactions strictly by selected period
  const periodTransactions = useMemo(() => {
    return transactions.filter((t) => {
      if (t.deletedAt) return false;
      if (dateFilter === 'this_month') return t.date.startsWith(currentMonthStr);
      if (dateFilter === 'this_year') return t.date.startsWith(currentYearStr);
      return true; // all_time
    });
  }, [transactions, dateFilter, currentMonthStr, currentYearStr]);

  // Compute period totals using integer paise
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

  // Recent transactions list
  const recentTransactions = transactions.filter((t) => !t.deletedAt).slice(0, 5);

  // Category spending aggregation for chart
  const categoryChartData = useMemo(() => {
    const categorySpendingMap: Record<string, number> = {};
    periodTransactions
      .filter((t) => t.type === 'expense')
      .forEach((t) => {
        categorySpendingMap[t.categoryId] =
          (categorySpendingMap[t.categoryId] || 0) + t.amountPaise;
      });

    return Object.entries(categorySpendingMap)
      .map(([catId, amountPaise]) => {
        const cat = categories.find((c) => c.id === catId);
        return {
          name: cat?.name || 'Other',
          value: paiseToRupees(amountPaise),
          color: cat?.color || '#94A3B8',
        };
      })
      .sort((a, b) => b.value - a.value);
  }, [periodTransactions, categories]);

  // Income vs Expense chart data
  const flowChartData = [
    {
      name: 'Income',
      amount: paiseToRupees(periodIncomePaise),
      fill: '#16A34A',
    },
    {
      name: 'Expenses',
      amount: paiseToRupees(periodExpensesPaise),
      fill: '#DC2626',
    },
  ];

  const hasTransactions = transactions.length > 0;

  // Sort visible widgets: pinned widgets first, then remaining visible in user order
  const orderedVisibleWidgets = useMemo(() => {
    const visibleOnly = widgets.filter((w) => w.visible);
    const pinned = visibleOnly.filter((w) => w.pinned);
    const unpinned = visibleOnly.filter((w) => !w.pinned);
    return [...pinned, ...unpinned];
  }, [widgets]);

  // Render individual widget block
  const renderWidget = (id: DashboardWidgetId) => {
    switch (id) {
      case 'balanceSummary':
        return (
          <div key={id} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Net Available Balance */}
            <div className="p-5 bg-white dark:bg-[#0A0A0A] rounded-2xl border border-slate-200/80 dark:border-[#262626] shadow-xs">
              <div className="flex items-center justify-between text-slate-500 dark:text-[#A3A3A3]">
                <span className="text-xs font-medium">Available Balance</span>
                <Wallet className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="mt-3">
                <div className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white tabular-nums">
                  {formatINR(financialSummary.availableBalancePaise)}
                </div>
                <div className="mt-1 text-[11px] text-slate-500 dark:text-[#A3A3A3]">
                  Net balance minus dedicated savings
                </div>
              </div>
            </div>

            {/* Period Income */}
            <div className="p-5 bg-white dark:bg-[#0A0A0A] rounded-2xl border border-slate-200/80 dark:border-[#262626] shadow-xs">
              <div className="flex items-center justify-between text-slate-500 dark:text-[#A3A3A3]">
                <span className="text-xs font-medium">Period Income</span>
                <ArrowDownLeft className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="mt-3">
                <div className="text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400 tabular-nums">
                  {formatINR(periodIncomePaise)}
                </div>
                <div className="mt-1 text-[11px] text-slate-500 dark:text-[#A3A3A3]">
                  Income in selected period
                </div>
              </div>
            </div>

            {/* Period Expenses */}
            <div className="p-5 bg-white dark:bg-[#0A0A0A] rounded-2xl border border-slate-200/80 dark:border-[#262626] shadow-xs">
              <div className="flex items-center justify-between text-slate-500 dark:text-[#A3A3A3]">
                <span className="text-xs font-medium">Period Expenses</span>
                <ArrowUpRight className="w-4 h-4 text-rose-600 dark:text-rose-400" />
              </div>
              <div className="mt-3">
                <div className="text-2xl font-bold tracking-tight text-rose-600 dark:text-rose-400 tabular-nums">
                  {formatINR(periodExpensesPaise)}
                </div>
                <div className="mt-1 text-[11px] text-slate-500 dark:text-[#A3A3A3]">
                  Expenses in selected period
                </div>
              </div>
            </div>

            {/* Allocated Savings */}
            <div className="p-5 bg-white dark:bg-[#0A0A0A] rounded-2xl border border-slate-200/80 dark:border-[#262626] shadow-xs">
              <div className="flex items-center justify-between text-slate-500 dark:text-[#A3A3A3]">
                <span className="text-xs font-medium">Allocated Savings</span>
                <PiggyBank className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="mt-3">
                <div className="text-2xl font-bold tracking-tight text-blue-600 dark:text-blue-400 tabular-nums">
                  {formatINR(financialSummary.savingsAllocatedPaise)}
                </div>
                <div className="mt-1 text-[11px] text-slate-500 dark:text-[#A3A3A3]">
                  Dedicated funds across {savingsGoals.length} {savingsGoals.length === 1 ? 'goal' : 'goals'}
                </div>
              </div>
            </div>
          </div>
        );

      case 'incomeExpenseChart':
        return (
          <div
            key={id}
            className="p-5 md:p-6 bg-white dark:bg-[#0A0A0A] rounded-2xl border border-slate-200/80 dark:border-[#262626] shadow-xs"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                  Cash Flow Comparison
                </h3>
                <p className="text-xs text-slate-500 dark:text-[#A3A3A3] mt-0.5">
                  Income versus expenditure for {dateFilter.replace('_', ' ')}
                </p>
              </div>
            </div>

            {hasTransactions && (periodIncomePaise > 0 || periodExpensesPaise > 0) ? (
              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={flowChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <XAxis
                      dataKey="name"
                      stroke="#888888"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      stroke="#888888"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(val) => `₹${val}`}
                    />
                    <Tooltip
                      formatter={(val: any) => [
                        `₹${typeof val === 'number' ? val.toLocaleString('en-IN') : val}`,
                        'Amount',
                      ]}
                      contentStyle={{
                        backgroundColor: '#111111',
                        border: '1px solid #262626',
                        borderRadius: '0.75rem',
                        fontSize: '12px',
                        color: '#ffffff',
                      }}
                    />
                    <Bar dataKey="amount" radius={[8, 8, 0, 0]}>
                      {flowChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-44 flex flex-col items-center justify-center text-center p-4 bg-slate-50/50 dark:bg-[#111111]/30 rounded-xl border border-slate-100 dark:border-[#262626]">
                <p className="text-xs text-slate-500 dark:text-[#A3A3A3]">
                  No financial activity recorded in this period.
                </p>
                <button
                  onClick={openAddTransaction}
                  className="mt-2.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Record Transaction
                </button>
              </div>
            )}
          </div>
        );

      case 'categorySpendingChart':
        return (
          <div
            key={id}
            className="p-5 md:p-6 bg-white dark:bg-[#0A0A0A] rounded-2xl border border-slate-200/80 dark:border-[#262626] shadow-xs"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                  Category Spending Breakdown
                </h3>
                <p className="text-xs text-slate-500 dark:text-[#A3A3A3] mt-0.5">
                  Where money is spent across categories
                </p>
              </div>
            </div>

            {categoryChartData.length > 0 ? (
              <div className="h-56 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {categoryChartData.map((entry, index) => (
                        <Cell key={`pie-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val: any) => [
                        `₹${typeof val === 'number' ? val.toLocaleString('en-IN') : val}`,
                        'Spent',
                      ]}
                      contentStyle={{
                        backgroundColor: '#111111',
                        border: '1px solid #262626',
                        borderRadius: '0.75rem',
                        fontSize: '12px',
                        color: '#ffffff',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-44 flex flex-col items-center justify-center text-center p-4 bg-slate-50/50 dark:bg-[#111111]/30 rounded-xl border border-slate-100 dark:border-[#262626]">
                <p className="text-xs text-slate-500 dark:text-[#A3A3A3]">
                  No expense records available for category breakdown.
                </p>
              </div>
            )}
          </div>
        );

      case 'budgetOverview':
        return (
          <div
            key={id}
            className="p-5 md:p-6 bg-white dark:bg-[#0A0A0A] rounded-2xl border border-slate-200/80 dark:border-[#262626] shadow-xs"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                  Budget Limits Watchlist
                </h3>
                <p className="text-xs text-slate-500 dark:text-[#A3A3A3] mt-0.5">
                  Monitoring Monthly &amp; Yearly limits
                </p>
              </div>
              <button
                onClick={() => setCurrentScreen('budget')}
                className="text-xs text-blue-600 dark:text-blue-400 font-medium hover:underline inline-flex items-center gap-1"
              >
                Manage <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {budgets.length > 0 ? (
              <div className="space-y-3.5">
                {budgets.slice(0, 4).map((bg) => {
                  const cat = categories.find((c) => c.id === bg.categoryId);
                  const spentPaise = transactions
                    .filter((t) => t.categoryId === bg.categoryId && t.type === 'expense' && !t.deletedAt)
                    .reduce((sum, t) => sum + t.amountPaise, 0);

                  const usagePct =
                    bg.limitPaise > 0 ? Math.round((spentPaise / bg.limitPaise) * 100) : 0;
                  const status = getBudgetStatus(usagePct);

                  return (
                    <div key={bg.id} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <CategoryIcon name={cat?.icon || 'Tag'} color={cat?.color} className="w-3.5 h-3.5" />
                          <span className="font-medium text-slate-800 dark:text-slate-200">
                            {cat?.name || 'Category'}
                          </span>
                          <span className="text-[10px] text-slate-400 uppercase">({bg.period})</span>
                        </div>
                        <span className="font-semibold text-slate-900 dark:text-white tabular-nums">
                          {formatINR(spentPaise)} / {formatINR(bg.limitPaise)} ({usagePct}%)
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-[#111111] overflow-hidden">
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
              <div className="p-4 text-center bg-slate-50/50 dark:bg-[#111111]/30 rounded-xl border border-slate-100 dark:border-[#262626] text-xs text-slate-500 dark:text-[#A3A3A3]">
                No budget limits set. Create a Monthly or Yearly cap in Budgets.
              </div>
            )}
          </div>
        );

      case 'savingsProgress':
        return (
          <div
            key={id}
            className="p-5 md:p-6 bg-white dark:bg-[#0A0A0A] rounded-2xl border border-slate-200/80 dark:border-[#262626] shadow-xs"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                  Savings Goals
                </h3>
                <p className="text-xs text-slate-500 dark:text-[#A3A3A3] mt-0.5">
                  Dedicated fund milestone progress
                </p>
              </div>
              <button
                onClick={() => setCurrentScreen('savings')}
                className="text-xs text-blue-600 dark:text-blue-400 font-medium hover:underline inline-flex items-center gap-1"
              >
                View Goals <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {savingsGoals.length > 0 ? (
              <div className="space-y-3.5">
                {savingsGoals.slice(0, 4).map((goal) => {
                  const pct =
                    goal.targetAmountPaise > 0
                      ? Math.min(100, Math.round((goal.currentAmountPaise / goal.targetAmountPaise) * 100))
                      : 0;

                  return (
                    <div key={goal.id} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-slate-800 dark:text-slate-200">{goal.title}</span>
                        <span className="font-semibold text-blue-600 dark:text-blue-400 tabular-nums">
                          {formatINR(goal.currentAmountPaise)} / {formatINR(goal.targetAmountPaise)} ({pct}%)
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-[#111111] overflow-hidden">
                        <div
                          className="h-full bg-blue-600 rounded-full transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-4 text-center bg-slate-50/50 dark:bg-[#111111]/30 rounded-xl border border-slate-100 dark:border-[#262626] text-xs text-slate-500 dark:text-[#A3A3A3]">
                No savings goals created yet. Set a goal in Savings.
              </div>
            )}
          </div>
        );

      case 'recentTransactions':
        return (
          <div
            key={id}
            className="p-5 md:p-6 bg-white dark:bg-[#0A0A0A] rounded-2xl border border-slate-200/80 dark:border-[#262626] shadow-xs"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                  Recent Transactions
                </h3>
                <p className="text-xs text-slate-500 dark:text-[#A3A3A3] mt-0.5">
                  Latest ledger activity
                </p>
              </div>
              <button
                onClick={() => setCurrentScreen('transactions')}
                className="text-xs text-blue-600 dark:text-blue-400 font-medium hover:underline inline-flex items-center gap-1"
              >
                All Transactions <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {recentTransactions.length > 0 ? (
              <div className="divide-y divide-slate-100 dark:divide-[#262626]">
                {recentTransactions.map((tx) => {
                  const cat = categories.find((c) => c.id === tx.categoryId);
                  const isExpense = tx.type === 'expense';
                  return (
                    <div key={tx.id} className="py-2.5 flex items-center justify-between gap-4 first:pt-0 last:pb-0">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                          style={{ backgroundColor: `${cat?.color || '#2563EB'}15` }}
                        >
                          <CategoryIcon name={cat?.icon || 'Tag'} color={cat?.color} className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-slate-900 dark:text-white">
                            {cat?.name || 'General'}
                          </div>
                          <div className="text-[11px] text-slate-400 dark:text-[#A3A3A3]">
                            {tx.date} {tx.description ? `· ${tx.description}` : ''}
                          </div>
                        </div>
                      </div>
                      <div
                        className={`text-xs font-bold tabular-nums ${
                          isExpense ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'
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
              <EmptyState
                icon={FolderOpen}
                title="No transactions yet"
                description="Start recording income or expenses to track your financial flow."
                actionLabel="Add Transaction"
                onAction={openAddTransaction}
              />
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Welcome Banner & Simplified Period Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-[#262626]">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-[#A3A3A3]">
            <Calendar className="w-3.5 h-3.5" />
            <span suppressHydrationWarning>{todayFormatted}</span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 dark:text-white mt-1">
            {userProfile.name ? `Welcome back, ${userProfile.name}` : 'Finance Dashboard'}
          </h2>
        </div>

        {/* Period Selector: Strictly This Month, This Year, All Time */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-[#0A0A0A] rounded-xl border border-slate-200/60 dark:border-[#262626]">
            {(
              [
                { key: 'this_month', label: 'This Month' },
                { key: 'this_year', label: 'This Year' },
                { key: 'all_time', label: 'All Time' },
              ] as const
            ).map((item) => (
              <button
                key={item.key}
                onClick={() => setDateFilter(item.key)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  dateFilter === item.key
                    ? 'bg-white dark:bg-[#262626] text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-[#A3A3A3] hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <button
            onClick={() => setIsCustomizeModalOpen(true)}
            className="p-2 rounded-xl text-slate-600 dark:text-[#A3A3A3] hover:bg-slate-100 dark:hover:bg-[#111111] transition-colors border border-slate-200/60 dark:border-[#262626]"
            title="Customize Widgets"
            aria-label="Customize dashboard widgets"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Render widgets dynamically based on user reordering & pinning */}
      {orderedVisibleWidgets.map((w) => renderWidget(w.id))}

      {orderedVisibleWidgets.length === 0 && (
        <div className="p-8 text-center bg-white dark:bg-[#0A0A0A] rounded-2xl border border-slate-200 dark:border-[#262626]">
          <p className="text-sm text-slate-500 dark:text-[#A3A3A3]">
            All dashboard widgets are currently hidden.
          </p>
          <button
            onClick={() => setIsCustomizeModalOpen(true)}
            className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            Customize Widgets
          </button>
        </div>
      )}
    </div>
  );
}
