'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import {
  Plus,
  Trash2,
  PieChart as PieIcon,
  X,
} from 'lucide-react';
import { formatINR, rupeesToPaise, getBudgetStatus, calculateBudgetSpent } from '@/lib/calculations/financial';
import { CategoryIcon } from '@/components/ui/CategoryIcon';
import { EmptyState } from '@/components/ui/EmptyState';
import { BudgetPeriod } from '@/types';

export function BudgetView() {
  const { budgets, categories, transactions, submitBudget, deleteBudget } = useApp();

  // Strictly simplified to Monthly and Yearly caps only (No "All Budgets" tab)
  const [activeTab, setActiveTab] = useState<BudgetPeriod>('monthly');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [categoryId, setCategoryId] = useState('');
  const [limitStr, setLimitStr] = useState('');
  const [period, setPeriod] = useState<BudgetPeriod>('monthly');
  const [error, setError] = useState<string | null>(null);

  const filteredBudgets = budgets.filter((b) => b.period === activeTab);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryId) {
      setError('Please select a category');
      return;
    }
    const parsedLimit = parseFloat(limitStr);
    if (isNaN(parsedLimit) || parsedLimit <= 0) {
      setError('Please enter a valid positive budget limit in INR (₹)');
      return;
    }

    await submitBudget({
      categoryId,
      limitPaise: rupeesToPaise(parsedLimit),
      period,
    });

    setIsModalOpen(false);
    setCategoryId('');
    setLimitStr('');
    setError(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            Budgets
          </h2>
          <p className="text-xs text-slate-500 dark:text-[#A3A3A3] mt-0.5">
            Monitor Monthly and Yearly spending limits with threshold indicators
          </p>
        </div>

        <button
          onClick={() => {
            setPeriod(activeTab);
            setIsModalOpen(true);
          }}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 min-h-[40px] text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors duration-150 self-start sm:self-auto active:scale-95"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          Create Budget
        </button>
      </div>

      {/* Period Tabs: Strictly Monthly and Yearly */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-[#262626] pb-3">
        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-[#0A0A0A] rounded-xl border border-slate-200/60 dark:border-[#262626]">
          {(
            [
              { id: 'monthly', label: 'Monthly' },
              { id: 'yearly', label: 'Yearly' },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 min-h-[36px] text-xs font-semibold rounded-lg transition-colors duration-150 ${
                activeTab === tab.id
                  ? 'bg-white dark:bg-[#262626] text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-[#A3A3A3] hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Legend for Thresholds */}
        <div className="hidden lg:flex items-center gap-3 text-xs text-slate-500 dark:text-[#A3A3A3]">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500" /> &lt;50% Safe
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-blue-500" /> 50% Moderate
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-500" /> 75% Warning
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-red-600" /> 100%+ Exceeded
          </span>
        </div>
      </div>

      {/* Budget Cards Grid */}
      {filteredBudgets.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBudgets.map((bg) => {
            const cat = categories.find((c) => c.id === bg.categoryId);

            // Strictly compute real spend for current period (monthly: current month only; yearly: current year only)
            const spentPaise = calculateBudgetSpent(transactions, bg.categoryId, bg.period);

            const usagePct =
              bg.limitPaise > 0
                ? Math.round((spentPaise / bg.limitPaise) * 100)
                : 0;

            const remainingPaise = Math.max(0, bg.limitPaise - spentPaise);
            const status = getBudgetStatus(usagePct);

            return (
              <div
                key={bg.id}
                className="p-5 bg-white dark:bg-[#0A0A0A] rounded-2xl border border-slate-200/80 dark:border-[#262626] flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                        style={{ backgroundColor: `${cat?.color || '#2563EB'}20` }}
                      >
                        <CategoryIcon name={cat?.icon || 'Tag'} color={cat?.color} className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                          {cat?.name || 'Category'}
                        </h3>
                        <span className="text-xs text-slate-400 dark:text-[#A3A3A3] uppercase font-bold tracking-wider">
                          {bg.period}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => deleteBudget(bg.id)}
                      className="p-2 min-w-[36px] min-h-[36px] flex items-center justify-center text-slate-400 hover:text-red-500 rounded-lg hover:bg-slate-100 dark:hover:bg-[#141414] transition-colors"
                      title="Remove budget cap"
                      aria-label="Remove budget"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="mt-4 space-y-2">
                    <div className="flex items-baseline justify-between">
                      <span className="text-xs text-slate-500 dark:text-[#A3A3A3]">Spent</span>
                      <span className="text-xs font-bold text-slate-900 dark:text-white tabular-nums">
                        {formatINR(spentPaise)} / {formatINR(bg.limitPaise)}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-[#141414] overflow-hidden">
                      <div
                        className={`h-full ${status.progressClass} transition-all duration-300`}
                        style={{ width: `${Math.min(100, usagePct)}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1">
                      <span className={`px-2 py-0.5 rounded-md text-xs font-bold ${status.badgeClass}`}>
                        {status.label}
                      </span>
                      <span className="text-slate-500 dark:text-[#A3A3A3] tabular-nums">
                        Remaining: {formatINR(remainingPaise)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={PieIcon}
          title={`No ${activeTab === 'monthly' ? 'Monthly' : 'Yearly'} Budgets`}
          description={`Set category limits to track your ${activeTab} expenses.`}
          actionLabel="Create Budget"
          onAction={() => {
            setPeriod(activeTab);
            setIsModalOpen(true);
          }}
        />
      )}

      {/* Modal: Create Budget */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in"
          role="dialog"
          aria-modal="true"
        >
          <div className="relative w-full max-w-md max-h-[90dvh] overflow-y-auto bg-white dark:bg-[#0A0A0A] rounded-2xl border border-slate-200 dark:border-[#262626] shadow-2xl p-5 sm:p-6 space-y-5">
            <div className="flex items-center justify-between pb-1">
              <div>
                <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                  Create Budget
                </h3>
                <p className="text-xs text-slate-500 dark:text-[#A3A3A3] mt-0.5">
                  Set a Monthly or Yearly limit
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 min-w-[36px] min-h-[36px] flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#141414]"
                aria-label="Close dialog"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 rounded-xl text-xs text-red-600 dark:text-red-400">
                {error}
              </div>
            )}

            <form onSubmit={handleCreate} className="space-y-4">
              {/* Category */}
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-[#A3A3A3] mb-1">
                  Category
                </label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-base sm:text-xs min-h-[42px] bg-slate-50 dark:bg-[#141414] border border-slate-200 dark:border-[#262626] rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  <option value="">Select category...</option>
                  {categories
                    .filter((c) => c.type === 'expense' || c.type === 'both')
                    .map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                </select>
              </div>

              {/* Interval Period: Strictly Monthly or Yearly */}
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-[#A3A3A3] mb-1">
                  Budget Cycle
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(['monthly', 'yearly'] as const).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPeriod(p)}
                      className={`py-2.5 min-h-[40px] text-xs font-semibold rounded-xl capitalize border transition-colors duration-150 ${
                        period === p
                          ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 ring-1 ring-blue-600'
                          : 'border-slate-200 dark:border-[#262626] text-slate-600 dark:text-[#A3A3A3] hover:bg-slate-50 dark:hover:bg-[#141414]'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              {/* Amount */}
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-[#A3A3A3] mb-1">
                  Spending Limit in INR (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm sm:text-xs">
                    ₹
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="e.g. 5000"
                    value={limitStr}
                    onChange={(e) => setLimitStr(e.target.value)}
                    className="w-full pl-8 pr-3.5 py-2.5 text-base sm:text-xs min-h-[42px] bg-slate-50 dark:bg-[#141414] border border-slate-200 dark:border-[#262626] rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600 tabular-nums"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 min-h-[42px] text-xs font-medium text-slate-600 dark:text-[#A3A3A3] hover:bg-slate-100 dark:hover:bg-[#141414] rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 min-h-[42px] text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors duration-150"
                >
                  Save Budget
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
