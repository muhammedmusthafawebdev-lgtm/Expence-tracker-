'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { X, Plus, AlertCircle, Calendar, CreditCard, AlignLeft } from 'lucide-react';
import { z } from 'zod';
import { TransactionType, PaymentMethod, Transaction } from '@/types';
import { rupeesToPaise, paiseToRupees } from '@/lib/calculations/financial';
import { PAYMENT_METHODS } from '@/constants/categories';
import { CategoryIcon } from '@/components/ui/CategoryIcon';
import { CustomCategoryModal } from '@/components/categories/CustomCategoryModal';

const transactionSchema = z.object({
  type: z.enum(['income', 'expense']),
  amount: z.number().positive('Amount must be greater than ₹0'),
  categoryId: z.string().min(1, 'Please select a category'),
  date: z.string().min(1, 'Date is required'),
  paymentMethod: z.string().optional(),
  description: z.string().max(200, 'Description cannot exceed 200 characters').optional(),
});

interface TransactionDrawerContentProps {
  mode: 'add' | 'edit';
  initialData?: Transaction;
}

function TransactionDrawerContent({ mode, initialData }: TransactionDrawerContentProps) {
  const { closeTransactionDrawer, categories, submitTransaction } = useApp();

  const [type, setType] = useState<TransactionType>(() => {
    return mode === 'edit' && initialData ? initialData.type : 'expense';
  });

  const [amountStr, setAmountStr] = useState<string>(() => {
    return mode === 'edit' && initialData ? paiseToRupees(initialData.amountPaise).toString() : '';
  });

  const [categoryId, setCategoryId] = useState<string>(() => {
    return mode === 'edit' && initialData ? initialData.categoryId : '';
  });

  const [date, setDate] = useState<string>(() => {
    return mode === 'edit' && initialData ? initialData.date : new Date().toISOString().split('T')[0];
  });

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | ''>(() => {
    return mode === 'edit' && initialData ? initialData.paymentMethod || '' : 'UPI';
  });

  const [description, setDescription] = useState<string>(() => {
    return mode === 'edit' && initialData ? initialData.description || '' : '';
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCustomCategoryOpen, setIsCustomCategoryOpen] = useState(false);

  // Filter categories by type
  const activeCategories = categories.filter(
    (c) => c.type === type || c.type === 'both'
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const parsedAmount = parseFloat(amountStr);

    const validationResult = transactionSchema.safeParse({
      type,
      amount: isNaN(parsedAmount) ? undefined : parsedAmount,
      categoryId,
      date,
      paymentMethod: paymentMethod || undefined,
      description: description.trim() || undefined,
    });

    if (!validationResult.success) {
      const fieldErrors: Record<string, string> = {};
      validationResult.error.issues.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0].toString()] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      await submitTransaction({
        type,
        amountPaise: rupeesToPaise(parsedAmount),
        categoryId,
        date,
        paymentMethod: (paymentMethod as PaymentMethod) || undefined,
        description: description.trim() || undefined,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div
        className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in"
        role="dialog"
        aria-modal="true"
        aria-labelledby="drawer-title"
      >
        <div className="absolute inset-0" onClick={closeTransactionDrawer} />

        <div className="fixed inset-y-0 right-0 max-w-full flex">
          {/* Slide-over panel: Full screen on mobile, 440px on desktop */}
          <div className="w-screen max-w-full md:max-w-md bg-white dark:bg-[#111111] shadow-2xl flex flex-col h-full border-l border-slate-200 dark:border-[#262626] animate-in slide-in-from-right duration-250">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-[#262626]">
              <div>
                <h2
                  id="drawer-title"
                  className="text-lg font-semibold text-slate-900 dark:text-white tracking-tight"
                >
                  {mode === 'edit' ? 'Edit Transaction' : 'Add Transaction'}
                </h2>
                <p className="text-xs text-slate-500 dark:text-[#A3A3A3] mt-0.5">
                  Enter income or expense entry
                </p>
              </div>

              <button
                onClick={closeTransactionDrawer}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#0A0A0A] transition-colors"
                aria-label="Close drawer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Honest Warning Notice */}
            <div className="px-6 py-2.5 bg-amber-50/70 dark:bg-amber-950/30 border-b border-amber-200/50 dark:border-amber-900/40 text-[11px] text-amber-800 dark:text-amber-300 flex items-start gap-2">
              <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0 text-amber-600 dark:text-amber-400" />
              <span>
                <strong>Frontend Scope:</strong> Validates in client session. Form submission will not write to a persistent database until a backend is connected.
              </span>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
              {/* Income / Expense Segmented Switcher */}
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-[#A3A3A3] mb-1.5">
                  Transaction Type
                </label>
                <div className="grid grid-cols-2 p-1 bg-slate-100 dark:bg-[#0A0A0A] rounded-xl border border-slate-200/60 dark:border-[#262626]">
                  <button
                    type="button"
                    onClick={() => {
                      setType('expense');
                      setCategoryId('');
                    }}
                    className={`py-2 text-xs font-semibold rounded-lg transition-all ${
                      type === 'expense'
                        ? 'bg-white dark:bg-[#262626] text-rose-600 dark:text-rose-400 shadow-xs'
                        : 'text-slate-600 dark:text-[#A3A3A3]'
                    }`}
                  >
                    Expense
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setType('income');
                      setCategoryId('');
                    }}
                    className={`py-2 text-xs font-semibold rounded-lg transition-all ${
                      type === 'income'
                        ? 'bg-white dark:bg-[#262626] text-emerald-600 dark:text-emerald-400 shadow-xs'
                        : 'text-slate-600 dark:text-[#A3A3A3]'
                    }`}
                  >
                    Income
                  </button>
                </div>
              </div>

              {/* Amount Field */}
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-[#A3A3A3] mb-1.5">
                  Amount in INR (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">
                    ₹
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={amountStr}
                    onChange={(e) => setAmountStr(e.target.value)}
                    className={`w-full pl-8 pr-4 py-2.5 text-base font-bold bg-slate-50 dark:bg-[#0A0A0A] border rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600 tabular-nums ${
                      errors.amount
                        ? 'border-red-500'
                        : 'border-slate-200 dark:border-[#262626]'
                    }`}
                    autoFocus={mode === 'add'}
                  />
                </div>
                {errors.amount && (
                  <p className="text-[11px] text-red-500 mt-1">{errors.amount}</p>
                )}
              </div>

              {/* Category Selector */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-medium text-slate-700 dark:text-[#A3A3A3]">
                    Category
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsCustomCategoryOpen(true)}
                    className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" /> Custom Category
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto p-1 border border-slate-200 dark:border-[#262626] rounded-xl bg-slate-50 dark:bg-[#0A0A0A]">
                  {activeCategories.map((cat) => {
                    const isSelected = categoryId === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setCategoryId(cat.id)}
                        className={`flex items-center gap-2 p-2 rounded-lg text-left text-xs transition-all ${
                          isSelected
                            ? 'bg-blue-600 text-white font-medium shadow-xs'
                            : 'text-slate-700 dark:text-[#A3A3A3] hover:bg-slate-200/60 dark:hover:bg-[#111111]'
                        }`}
                      >
                        <CategoryIcon
                          name={cat.icon}
                          color={isSelected ? '#ffffff' : cat.color}
                          className="w-3.5 h-3.5 shrink-0"
                        />
                        <span className="truncate">{cat.name}</span>
                      </button>
                    );
                  })}
                </div>
                {errors.categoryId && (
                  <p className="text-[11px] text-red-500 mt-1">{errors.categoryId}</p>
                )}
              </div>

              {/* Date */}
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-[#A3A3A3] mb-1.5">
                  Transaction Date
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-[#0A0A0A] border border-slate-200 dark:border-[#262626] rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
                {errors.date && <p className="text-[11px] text-red-500 mt-1">{errors.date}</p>}
              </div>

              {/* Payment Method (Optional) */}
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-[#A3A3A3] mb-1.5">
                  Payment Method (Optional)
                </label>
                <div className="relative">
                  <CreditCard className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                    className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-[#0A0A0A] border border-slate-200 dark:border-[#262626] rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                  >
                    <option value="">None / Unspecified</option>
                    {PAYMENT_METHODS.map((pm) => (
                      <option key={pm} value={pm}>
                        {pm}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Description (Optional) */}
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-[#A3A3A3] mb-1.5">
                  Description / Note (Optional)
                </label>
                <div className="relative">
                  <AlignLeft className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <textarea
                    rows={2}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="e.g. Semester book purchase, canteen lunch"
                    className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-[#0A0A0A] border border-slate-200 dark:border-[#262626] rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600 resize-none"
                  />
                </div>
                {errors.description && (
                  <p className="text-[11px] text-red-500 mt-1">{errors.description}</p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-[#262626]">
                <button
                  type="button"
                  onClick={closeTransactionDrawer}
                  className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-[#A3A3A3] hover:bg-slate-100 dark:hover:bg-[#0A0A0A] rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-xs active:scale-95 disabled:opacity-50"
                >
                  {mode === 'edit' ? 'Save Changes' : 'Add Transaction'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Custom Category Modal */}
      <CustomCategoryModal
        isOpen={isCustomCategoryOpen}
        onClose={() => setIsCustomCategoryOpen(false)}
        onCreated={(cat) => setCategoryId(cat.id)}
      />
    </>
  );
}

export function TransactionDrawer() {
  const { transactionDrawer } = useApp();

  if (!transactionDrawer.isOpen) return null;

  return (
    <TransactionDrawerContent
      key={transactionDrawer.initialData?.id || 'new'}
      mode={transactionDrawer.mode}
      initialData={transactionDrawer.initialData}
    />
  );
}
