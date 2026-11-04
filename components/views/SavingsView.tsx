'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import {
  PiggyBank,
  Plus,
  ArrowDownLeft,
  ArrowUpRight,
  Calendar,
  X,
  Info,
} from 'lucide-react';
import { formatINR, rupeesToPaise } from '@/lib/calculations/financial';
import { EmptyState } from '@/components/ui/EmptyState';

export function SavingsView() {
  const { savingsGoals, submitSavingsGoal, submitSavingsAllocation } = useApp();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [allocationModal, setAllocationModal] = useState<{
    isOpen: boolean;
    goalId: string;
    goalTitle: string;
    type: 'deposit' | 'withdrawal';
  }>({
    isOpen: false,
    goalId: '',
    goalTitle: '',
    type: 'deposit',
  });

  // Create form state
  const [title, setTitle] = useState('');
  const [targetAmountStr, setTargetAmountStr] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Allocation amount state
  const [allocAmountStr, setAllocAmountStr] = useState('');
  const [allocNote, setAllocNote] = useState('');

  const totalSavedPaise = savingsGoals.reduce((sum, g) => sum + g.currentAmountPaise, 0);
  const totalTargetPaise = savingsGoals.reduce((sum, g) => sum + g.targetAmountPaise, 0);

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Goal title is required');
      return;
    }
    const parsedTarget = parseFloat(targetAmountStr);
    if (isNaN(parsedTarget) || parsedTarget <= 0) {
      setError('Please enter a valid positive target amount in ₹');
      return;
    }
    if (!targetDate) {
      setError('Target deadline date is required');
      return;
    }

    await submitSavingsGoal({
      title: title.trim(),
      targetAmountPaise: rupeesToPaise(parsedTarget),
      targetDate,
      notes: notes.trim() || undefined,
    });

    setIsCreateModalOpen(false);
    setTitle('');
    setTargetAmountStr('');
    setTargetDate('');
    setNotes('');
    setError(null);
  };

  const handleAllocationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseFloat(allocAmountStr);
    if (isNaN(parsed) || parsed <= 0) return;

    await submitSavingsAllocation(
      allocationModal.goalId,
      rupeesToPaise(parsed),
      allocationModal.type,
      allocNote.trim() || undefined
    );

    setAllocationModal({ isOpen: false, goalId: '', goalTitle: '', type: 'deposit' });
    setAllocAmountStr('');
    setAllocNote('');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            Savings Goals
          </h2>
          <p className="text-xs text-slate-500 dark:text-[#A3A3A3] mt-0.5">
            Dedicated savings funds (not counted as ordinary expenses)
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 min-h-[40px] text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors duration-150 self-start sm:self-auto active:scale-95"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          Add Goal
        </button>
      </div>

      {/* Semantic Rule Notice */}
      <div className="p-3.5 bg-blue-50/60 dark:bg-blue-950/30 rounded-xl border border-blue-200/60 dark:border-blue-900/40 flex items-start gap-3 text-xs text-blue-900 dark:text-blue-300">
        <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong>Financial Rule:</strong> Savings allocations are stored capital partitions. They reduce your{' '}
          <em>Available Balance</em>, but are <strong>never</strong> counted as everyday operating expenses in your Net Balance.
        </div>
      </div>

      {/* Overview Stat Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white dark:bg-[#0A0A0A] rounded-2xl border border-slate-200/80 dark:border-[#262626]">
          <span className="text-xs text-slate-500 dark:text-[#A3A3A3]">Total Saved</span>
          <div className="mt-1 text-2xl font-bold text-slate-900 dark:text-white tabular-nums">
            {formatINR(totalSavedPaise)}
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-[#0A0A0A] rounded-2xl border border-slate-200/80 dark:border-[#262626]">
          <span className="text-xs text-slate-500 dark:text-[#A3A3A3]">Combined Target</span>
          <div className="mt-1 text-2xl font-bold text-slate-900 dark:text-white tabular-nums">
            {formatINR(totalTargetPaise)}
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-[#0A0A0A] rounded-2xl border border-slate-200/80 dark:border-[#262626]">
          <span className="text-xs text-slate-500 dark:text-[#A3A3A3]">Active Goals</span>
          <div className="mt-1 text-2xl font-bold text-blue-600 dark:text-blue-400 tabular-nums">
            {savingsGoals.length}
          </div>
        </div>
      </div>

      {/* Goals Cards List */}
      {savingsGoals.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {savingsGoals.map((goal) => {
            const pct =
              goal.targetAmountPaise > 0
                ? Math.min(100, Math.round((goal.currentAmountPaise / goal.targetAmountPaise) * 100))
                : 0;
            const remainingPaise = Math.max(0, goal.targetAmountPaise - goal.currentAmountPaise);

            return (
              <div
                key={goal.id}
                className="p-5 bg-white dark:bg-[#0A0A0A] rounded-2xl border border-slate-200/80 dark:border-[#262626] flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                        {goal.title}
                      </h3>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-[#A3A3A3] mt-0.5">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Target: {goal.targetDate}</span>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-900/60">
                      {pct}%
                    </span>
                  </div>

                  {goal.notes && (
                    <p className="text-xs text-slate-500 dark:text-[#A3A3A3] mt-2 line-clamp-2">
                      {goal.notes}
                    </p>
                  )}

                  {/* Progress Bar */}
                  <div className="mt-4 space-y-1.5">
                    <div className="flex items-baseline justify-between text-xs">
                      <span className="text-slate-500 dark:text-[#A3A3A3]">Saved</span>
                      <span className="font-bold text-slate-900 dark:text-white tabular-nums">
                        {formatINR(goal.currentAmountPaise)} / {formatINR(goal.targetAmountPaise)}
                      </span>
                    </div>

                    <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-[#141414] overflow-hidden">
                      <div
                        className="h-full bg-blue-600 rounded-full transition-all duration-300"
                        style={{ width: `${pct}%` }}
                      />
                    </div>

                    <div className="text-xs text-slate-500 dark:text-[#A3A3A3] pt-0.5">
                      Remaining to reach target: {formatINR(remainingPaise)}
                    </div>
                  </div>
                </div>

                {/* Deposit / Withdraw Action Buttons */}
                <div className="pt-2 border-t border-slate-100 dark:border-[#262626] flex items-center gap-2">
                  <button
                    onClick={() =>
                      setAllocationModal({
                        isOpen: true,
                        goalId: goal.id,
                        goalTitle: goal.title,
                        type: 'deposit',
                      })
                    }
                    className="flex-1 min-h-[40px] py-2 px-3 rounded-xl bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-blue-600 dark:text-blue-400 text-xs font-semibold inline-flex items-center justify-center gap-1 transition-colors duration-150"
                  >
                    <ArrowDownLeft className="w-3.5 h-3.5" />
                    Deposit
                  </button>

                  <button
                    onClick={() =>
                      setAllocationModal({
                        isOpen: true,
                        goalId: goal.id,
                        goalTitle: goal.title,
                        type: 'withdrawal',
                      })
                    }
                    className="flex-1 min-h-[40px] py-2 px-3 rounded-xl bg-slate-100 dark:bg-[#141414] hover:bg-slate-200 dark:hover:bg-[#262626] text-slate-700 dark:text-[#A3A3A3] text-xs font-semibold inline-flex items-center justify-center gap-1 transition-colors duration-150"
                  >
                    <ArrowUpRight className="w-3.5 h-3.5" />
                    Withdraw
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={PiggyBank}
          title="No Savings Goals Configured"
          description="Create dedicated savings targets for upcoming academic expenses, tuition, books, or milestones."
          actionLabel="Add Goal"
          onAction={() => setIsCreateModalOpen(true)}
        />
      )}

      {/* Modal: Create Savings Goal */}
      {isCreateModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in"
          role="dialog"
          aria-modal="true"
        >
          <div className="relative w-full max-w-md max-h-[90dvh] overflow-y-auto bg-white dark:bg-[#0A0A0A] rounded-2xl border border-slate-200 dark:border-[#262626] shadow-2xl p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between pb-1">
              <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                Add Goal
              </h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
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

            <form onSubmit={handleCreateGoal} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-[#A3A3A3] mb-1">
                  Goal Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Semester Books, Laptop Fund"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-base sm:text-xs min-h-[42px] bg-slate-50 dark:bg-[#141414] border border-slate-200 dark:border-[#262626] rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-[#A3A3A3] mb-1">
                  Target Amount in INR (₹)
                </label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="e.g. 15000"
                  value={targetAmountStr}
                  onChange={(e) => setTargetAmountStr(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-base sm:text-xs min-h-[42px] bg-slate-50 dark:bg-[#141414] border border-slate-200 dark:border-[#262626] rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600 tabular-nums"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-[#A3A3A3] mb-1">
                  Target Date
                </label>
                <input
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-base sm:text-xs min-h-[42px] bg-slate-50 dark:bg-[#141414] border border-slate-200 dark:border-[#262626] rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600 cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-[#A3A3A3] mb-1">
                  Notes (Optional)
                </label>
                <input
                  type="text"
                  placeholder="Optional context"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-base sm:text-xs min-h-[42px] bg-slate-50 dark:bg-[#141414] border border-slate-200 dark:border-[#262626] rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2.5 min-h-[42px] text-xs font-medium text-slate-600 dark:text-[#A3A3A3] hover:bg-slate-100 dark:hover:bg-[#141414] rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 min-h-[42px] text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors duration-150"
                >
                  Create Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Allocation (Deposit / Withdrawal) */}
      {allocationModal.isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in"
          role="dialog"
          aria-modal="true"
        >
          <div className="relative w-full max-w-sm max-h-[90dvh] overflow-y-auto bg-white dark:bg-[#0A0A0A] rounded-2xl border border-slate-200 dark:border-[#262626] shadow-2xl p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between pb-1">
              <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                {allocationModal.type === 'deposit' ? 'Deposit to Goal' : 'Withdraw from Goal'}
              </h3>
              <button
                onClick={() =>
                  setAllocationModal({ isOpen: false, goalId: '', goalTitle: '', type: 'deposit' })
                }
                className="p-2 min-w-[36px] min-h-[36px] flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white"
                aria-label="Close dialog"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500 dark:text-[#A3A3A3]">
              Target: <strong className="text-slate-900 dark:text-white">{allocationModal.goalTitle}</strong>
            </p>

            <form onSubmit={handleAllocationSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-[#A3A3A3] mb-1">
                  Amount in INR (₹)
                </label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="e.g. 1000"
                  value={allocAmountStr}
                  onChange={(e) => setAllocAmountStr(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-base sm:text-xs min-h-[42px] bg-slate-50 dark:bg-[#141414] border border-slate-200 dark:border-[#262626] rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600 tabular-nums"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-[#A3A3A3] mb-1">
                  Note (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Saved from monthly allowance"
                  value={allocNote}
                  onChange={(e) => setAllocNote(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-base sm:text-xs min-h-[42px] bg-slate-50 dark:bg-[#141414] border border-slate-200 dark:border-[#262626] rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() =>
                    setAllocationModal({ isOpen: false, goalId: '', goalTitle: '', type: 'deposit' })
                  }
                  className="px-4 py-2.5 min-h-[42px] text-xs font-medium text-slate-600 dark:text-[#A3A3A3] hover:bg-slate-100 dark:hover:bg-[#141414] rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 min-h-[42px] text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors duration-150"
                >
                  Confirm Allocation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
