'use client';

import React, { useState } from 'react';
import { X, HandCoins, User, Phone } from 'lucide-react';
import { Debt } from '@/types';
import { paiseToRupees, rupeesToPaise, formatINR } from '@/lib/calculations/financial';

interface CreateDebtModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    personName: string;
    principalAmountPaise: number;
    phone?: string;
    lentDate: string;
    expectedRepaymentDate?: string;
    description?: string;
  }) => Promise<void>;
  initialDebt?: Debt | null;
}

interface CreateDebtFormProps {
  onClose: () => void;
  onSubmit: (data: {
    personName: string;
    principalAmountPaise: number;
    phone?: string;
    lentDate: string;
    expectedRepaymentDate?: string;
    description?: string;
  }) => Promise<void>;
  initialDebt?: Debt | null;
}

function CreateDebtForm({ onClose, onSubmit, initialDebt }: CreateDebtFormProps) {
  const isEditing = Boolean(initialDebt);
  const today = new Date().toISOString().split('T')[0];

  const [personName, setPersonName] = useState(() => initialDebt?.personName || '');
  const [amountStr, setAmountStr] = useState(() =>
    initialDebt ? paiseToRupees(initialDebt.principalAmountPaise).toString() : ''
  );
  const [phone, setPhone] = useState(() => initialDebt?.phone || initialDebt?.phoneNumber || '');
  const [lentDate, setLentDate] = useState(() => initialDebt?.lentDate || today);
  const [expectedDate, setExpectedDate] = useState(() => initialDebt?.expectedRepaymentDate || '');
  const [description, setDescription] = useState(() => initialDebt?.description || '');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedName = personName.trim();
    if (!trimmedName) {
      setError("Please enter the person's full name");
      return;
    }

    const parsedRupees = parseFloat(amountStr);
    if (isNaN(parsedRupees) || parsedRupees <= 0) {
      setError('Please enter a valid positive principal amount in ₹');
      return;
    }

    const principalPaise = rupeesToPaise(parsedRupees);

    if (isEditing && initialDebt && principalPaise < initialDebt.totalRepaidPaise) {
      setError(
        `Principal amount cannot be less than already repaid amount (${formatINR(
          initialDebt.totalRepaidPaise
        )})`
      );
      return;
    }

    if (!lentDate) {
      setError('Please select a valid lent date');
      return;
    }

    if (expectedDate && expectedDate < lentDate) {
      setError('Expected repayment date cannot be earlier than the lent date');
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit({
        personName: trimmedName,
        principalAmountPaise: principalPaise,
        phone: phone.trim() || undefined,
        lentDate,
        expectedRepaymentDate: expectedDate || undefined,
        description: description.trim() || undefined,
      });
      onClose();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to save debt record';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative w-full max-w-md max-h-[90dvh] overflow-y-auto bg-white dark:bg-[#0A0A0A] rounded-2xl border border-slate-200 dark:border-[#262626] shadow-2xl p-5 sm:p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-1 border-b border-slate-100 dark:border-[#262626]">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
            <HandCoins className="w-4 h-4" />
          </div>
          <h3 className="text-base font-semibold text-slate-900 dark:text-white">
            {isEditing ? 'Edit Debt Record' : 'Record Money Lent'}
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

      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 rounded-xl text-xs text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Person Name */}
        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-[#A3A3A3] mb-1">
            Person&apos;s Full Name <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <User className="w-4 h-4" />
            </div>
            <input
              type="text"
              placeholder="e.g. Rahul Sharma, Priya Nair"
              value={personName}
              onChange={(e) => setPersonName(e.target.value)}
              required
              className="w-full pl-9 pr-3.5 py-2.5 text-base sm:text-xs min-h-[42px] bg-slate-50 dark:bg-[#141414] border border-slate-200 dark:border-[#262626] rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
              autoFocus
            />
          </div>
        </div>

        {/* Principal Amount */}
        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-[#A3A3A3] mb-1">
            Principal Amount in INR (₹) <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 font-semibold text-xs">
              ₹
            </div>
            <input
              type="number"
              step="0.01"
              min="0.01"
              placeholder="e.g. 5000"
              value={amountStr}
              onChange={(e) => setAmountStr(e.target.value)}
              required
              className="w-full pl-8 pr-3.5 py-2.5 text-base sm:text-xs min-h-[42px] bg-slate-50 dark:bg-[#141414] border border-slate-200 dark:border-[#262626] rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600 tabular-nums"
            />
          </div>
        </div>

        {/* Phone Number */}
        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-[#A3A3A3] mb-1">
            Phone Number (Optional)
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Phone className="w-4 h-4" />
            </div>
            <input
              type="tel"
              placeholder="e.g. +91 98765 43210"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2.5 text-base sm:text-xs min-h-[42px] bg-slate-50 dark:bg-[#141414] border border-slate-200 dark:border-[#262626] rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>
        </div>

        {/* Lent Date & Expected Due Date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-[#A3A3A3] mb-1">
              Lent Date <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="date"
                value={lentDate}
                onChange={(e) => setLentDate(e.target.value)}
                required
                className="w-full px-3 py-2.5 text-base sm:text-xs min-h-[42px] bg-slate-50 dark:bg-[#141414] border border-slate-200 dark:border-[#262626] rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600 cursor-pointer"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-[#A3A3A3] mb-1">
              Due Date (Optional)
            </label>
            <div className="relative">
              <input
                type="date"
                value={expectedDate}
                min={lentDate}
                onChange={(e) => setExpectedDate(e.target.value)}
                className="w-full px-3 py-2.5 text-base sm:text-xs min-h-[42px] bg-slate-50 dark:bg-[#141414] border border-slate-200 dark:border-[#262626] rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Description / Notes */}
        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-[#A3A3A3] mb-1">
            Description / Notes (Optional)
          </label>
          <div className="relative">
            <textarea
              rows={2}
              placeholder="Reason or terms (e.g. hostel rent loan, college fee split)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 text-base sm:text-xs min-h-[60px] bg-slate-50 dark:bg-[#141414] border border-slate-200 dark:border-[#262626] rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600 resize-none"
            />
          </div>
        </div>

        {/* Action buttons */}
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
            className="px-5 py-2.5 min-h-[42px] text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors duration-150 disabled:opacity-60"
          >
            {isSubmitting ? 'Saving...' : isEditing ? 'Update Debt' : 'Add Debt Record'}
          </button>
        </div>
      </form>
    </div>
  );
}

export function CreateDebtModal({
  isOpen,
  onClose,
  onSubmit,
  initialDebt,
}: CreateDebtModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in"
      role="dialog"
      aria-modal="true"
    >
      <CreateDebtForm
        key={initialDebt ? initialDebt.id : 'create-new'}
        onClose={onClose}
        onSubmit={onSubmit}
        initialDebt={initialDebt}
      />
    </div>
  );
}
