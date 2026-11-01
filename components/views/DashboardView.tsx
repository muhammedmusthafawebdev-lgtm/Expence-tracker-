'use client';

import React, { useState, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { Calendar, SlidersHorizontal, Plus } from 'lucide-react';
import { DashboardWidgetId } from '@/types';
import { OverviewWidget } from '@/components/dashboard/widgets/OverviewWidget';
import { MoneyAnalyticsWidget } from '@/components/dashboard/widgets/MoneyAnalyticsWidget';
import { CashFlowWidget } from '@/components/dashboard/widgets/CashFlowWidget';
import { BudgetWidget } from '@/components/dashboard/widgets/BudgetWidget';
import { SavingsWidget } from '@/components/dashboard/widgets/SavingsWidget';
import { RecentTransactionsWidget } from '@/components/dashboard/widgets/RecentTransactionsWidget';
import { BillsRecurringWidget } from '@/components/dashboard/widgets/BillsRecurringWidget';
import { FinancialHealthWidget } from '@/components/dashboard/widgets/FinancialHealthWidget';
import { NetWorthWidget } from '@/components/dashboard/widgets/NetWorthWidget';
import { DebtEmiWidget } from '@/components/dashboard/widgets/DebtEmiWidget';
import { ReportsSummaryWidget } from '@/components/dashboard/widgets/ReportsSummaryWidget';

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

  // Period selector: This Month, This Year, All Time
  const [dateFilter, setDateFilter] = useState<'this_month' | 'this_year' | 'all_time'>('this_month');

  // Format today's date cleanly
  const todayFormatted = useMemo(() => {
    return new Intl.DateTimeFormat('en-IN', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(new Date());
  }, []);

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

  const periodLabel = useMemo(() => {
    if (dateFilter === 'this_month') return 'This Month';
    if (dateFilter === 'this_year') return 'This Year';
    return 'All Time';
  }, [dateFilter]);

  // Sort visible widgets: pinned widgets first, then remaining visible in user order
  const orderedVisibleWidgets = useMemo(() => {
    const visibleOnly = widgets.filter((w) => w.visible);
    const pinned = visibleOnly.filter((w) => w.pinned);
    const unpinned = visibleOnly.filter((w) => !w.pinned);
    return [...pinned, ...unpinned];
  }, [widgets]);

  // Modular Widget Renderer
  const renderWidget = (id: DashboardWidgetId) => {
    switch (id) {
      case 'overview':
      case 'balanceSummary':
        return (
          <OverviewWidget
            key="overview"
            availableBalancePaise={financialSummary.availableBalancePaise}
            periodIncomePaise={periodIncomePaise}
            periodExpensesPaise={periodExpensesPaise}
            savingsAllocatedPaise={financialSummary.savingsAllocatedPaise}
            periodLabel={periodLabel}
          />
        );

      case 'moneyAnalytics':
      case 'moneyDashboard':
      case 'categorySpendingChart':
        return (
          <MoneyAnalyticsWidget
            key="moneyAnalytics"
            periodTransactions={periodTransactions}
            categories={categories}
            periodLabel={periodLabel}
            onAddTransaction={openAddTransaction}
          />
        );

      case 'cashFlow':
      case 'incomeExpenseChart':
        return (
          <CashFlowWidget
            key="cashFlow"
            periodIncomePaise={periodIncomePaise}
            periodExpensesPaise={periodExpensesPaise}
            periodLabel={periodLabel}
          />
        );

      case 'budget':
      case 'budgetOverview':
        return (
          <BudgetWidget
            key="budget"
            budgets={budgets}
            transactions={transactions}
            categories={categories}
            onNavigate={setCurrentScreen}
          />
        );

      case 'savings':
      case 'savingsProgress':
        return (
          <SavingsWidget
            key="savings"
            savingsGoals={savingsGoals}
            onNavigate={setCurrentScreen}
          />
        );

      case 'recentTransactions':
        return (
          <RecentTransactionsWidget
            key="recentTransactions"
            transactions={transactions}
            categories={categories}
            onAddTransaction={openAddTransaction}
            onNavigate={setCurrentScreen}
          />
        );

      case 'billsRecurring':
        return (
          <BillsRecurringWidget
            key="billsRecurring"
            transactions={transactions}
            categories={categories}
            onAddTransaction={openAddTransaction}
          />
        );

      case 'financialHealth':
        return (
          <FinancialHealthWidget
            key="financialHealth"
            periodIncomePaise={periodIncomePaise}
            periodExpensesPaise={periodExpensesPaise}
            savingsAllocatedPaise={financialSummary.savingsAllocatedPaise}
            availableBalancePaise={financialSummary.availableBalancePaise}
          />
        );

      case 'netWorth':
        return (
          <NetWorthWidget
            key="netWorth"
            availableBalancePaise={financialSummary.availableBalancePaise}
            savingsAllocatedPaise={financialSummary.savingsAllocatedPaise}
          />
        );

      case 'debtEmi':
        return (
          <DebtEmiWidget
            key="debtEmi"
            transactions={transactions}
            categories={categories}
          />
        );

      case 'reportsSummary':
        return (
          <ReportsSummaryWidget
            key="reportsSummary"
            periodIncomePaise={periodIncomePaise}
            periodExpensesPaise={periodExpensesPaise}
            transactionCount={periodTransactions.length}
            periodLabel={periodLabel}
            onNavigate={setCurrentScreen}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Top Bar: Date, Welcome & Period Selector */}
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

        {/* Period Selector: This Month, This Year, All Time */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-[#141414] rounded-xl border border-slate-200/60 dark:border-[#262626]">
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
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors duration-150 ${
                  dateFilter === item.key
                    ? 'bg-white dark:bg-[#262626] text-slate-900 dark:text-white'
                    : 'text-slate-600 dark:text-[#A3A3A3] hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <button
            onClick={() => setIsCustomizeModalOpen(true)}
            className="p-2 rounded-xl text-slate-600 dark:text-[#A3A3A3] hover:bg-slate-100 dark:hover:bg-[#141414] transition-colors duration-150 border border-slate-200/60 dark:border-[#262626]"
            title="Customize Dashboard"
            aria-label="Customize dashboard widgets"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Render Modular Widgets Dynamically */}
      <div className="space-y-5">
        {orderedVisibleWidgets.map((w) => renderWidget(w.id))}
      </div>

      {/* Empty State when all widgets are hidden */}
      {orderedVisibleWidgets.length === 0 && (
        <div className="py-16 text-center bg-white dark:bg-[#0A0A0A] rounded-2xl border border-slate-200 dark:border-[#262626]">
          <p className="text-sm font-semibold text-slate-900 dark:text-white">
            All dashboard widgets are currently hidden
          </p>
          <p className="text-xs text-slate-500 dark:text-[#A3A3A3] mt-1">
            Choose which cards you want to see on your financial dashboard.
          </p>
          <button
            onClick={() => setIsCustomizeModalOpen(true)}
            className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors shadow-xs"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            Customize Dashboard
          </button>
        </div>
      )}
    </div>
  );
}
