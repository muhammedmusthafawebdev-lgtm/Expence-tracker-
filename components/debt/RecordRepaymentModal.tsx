'use client';

import React, { useState } from 'react';
import { X, ArrowDownLeft, Calendar, FileText } from 'lucide-react';
import { Debt } from '@/types';
import { formatINR, paiseToRupees, rupeesToPaise } from '@/lib/calculations/financial';

interface RecordRepaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  debt: Debt;
  onSubmit: (debtId: string, amountPaise: number, repaymentDate: string, notes?: string) => Promise<void>;
}

export function RecordRepaymentModal({
  isOpen,
  onClose,
  debt,
  onSubmit,
}: RecordRepaymentModalProps) {
  const today = new Date().toISOString().split('T')[0];
  const maxRepaymentRupees = paiseToRupees(debt.outstandingPaise);

  const [amountStr, setAmountStr] = useState('');
  const [repaymentDate, setRepaymentDate] = useState(today);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleFillFullAmount = () => {
    setAmountStr(maxRepaymentRupees.toString());
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const parsedRupees = parseFloat(amountStr);
    if (isNaN(parsedRupees) || parsedRupees <= 0) {
      setError('Please enter a valid positive repayment amount in ₹');
      return;
    }

    const repaymentPaise = rupeesToPaise(parsedRupees);
    if (repaymentPaise > debt.outstandingPaise) {
      setError(
        `Repayment amount cannot exceed outstanding balance (${formatINR(debt.outstandingPaise)})`
      );
      return;
    }

    if (!repaymentDate) {
      setError('Please select a valid repayment date');
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit(debt.id, repaymentPaise, repaymentDate, notes.trim() || undefined);
      onClose();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to record repayment';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-sm max-h-[90dvh] overflow-y-auto bg-white dark:bg-[#0A0A0A] rounded-2xl border border-slate-200 dark:border-[#262626] shadow-2xl p-5 sm:p-6 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-1 border-b border-slate-100 dark:border-[#262626]">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <ArrowDownLeft className="w-4 h-4" />
            </div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">
              Record Repayment
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 min-w-[36px] min-h-[36px] flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#141414] transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Debt Context Banner */}
        <div className="p-3 bg-slate-50 dark:bg-[#141414] rounded-xl border border-slate-200/80 dark:border-[#262626] space-y-1">
          <div className="text-xs text-slate-500 dark:text-[#A3A3A3]">
            Borrower: <span className="font-semibold text-slate-900 dark:text-white">{debt.personName}</span>
          </div>
          <div className="flex items-baseline justify-between pt-1">
            <span className="text-xs text-slate-500 dark:text-[#A3A3A3]">Outstanding:</span>
            <span className="text-sm font-bold text-blue-600 dark:text-blue-400 tabular-nums">
              {formatINR(debt.outstandingPaise)}
            </span>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 rounded-xl text-xs text-red-600 dark:text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Amount input */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-medium text-slate-700 dark:text-[#A3A3A3]">
                Repayment Amount in INR (₹) <span className="text-red-500">*</span>
              </label>
              <button
                type="button"
                onClick={handleFillFullAmount}
                className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline"
              >
                Pay Full (₹{maxRepaymentRupees})
              </button>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 font-semibold text-xs">
                ₹
              </div>
              <input
                type="number"
                step="0.01"
                min="0.01"
                max={maxRepaymentRupees}
                placeholder="e.g. 1000"
                value={amountStr}
                onChange={(e) => setAmountStr(e.target.value)}
                required
                className="w-full pl-8 pr-3.5 py-2.5 text-base sm:text-xs min-h-[42px] bg-slate-50 dark:bg-[#141414] border border-slate-200 dark:border-[#262626] rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600 tabular-nums"
                autoFocus
              />
            </div>
          </div>

          {/* Repayment Date */}
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-[#A3A3A3] mb-1">
              Repayment Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={repaymentDate}
              onChange={(e) => setRepaymentDate(e.target.value)}
              required
              className="w-full px-3 py-2.5 text-base sm:text-xs min-h-[42px] bg-slate-50 dark:bg-[#141414] border border-slate-200 dark:border-[#262626] rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600 cursor-pointer"
            />
          </div>

          {/* Payment Note / Method */}
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-[#A3A3A3] mb-1">
              Payment Method / Note (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. UPI (Google Pay), Cash, Bank Transfer"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2.5 text-base sm:text-xs min-h-[42px] bg-slate-50 dark:bg-[#141414] border border-slate-200 dark:border-[#262626] rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-slate-100 dark:border-[#262626]">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 min-h-[42px] text-xs font-medium text-slate-600 dark:text-[#A3A3A3] hover:bg-slate-100 dark:hover:bg-[#141414] rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 min-h-[42px] text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors duration-150 disabled:opacity-60"
            >
              {isSubmitting ? 'Recording...' : 'Confirm Repayment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
