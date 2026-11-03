'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import {
  X,
  Plus,
  AlertCircle,
  Search,
  Check,
  Tag,
} from 'lucide-react';
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
    return mode === 'edit' && initialData
      ? initialData.date
      : new Date().toISOString().split('T')[0];
  });

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | ''>(() => {
    return mode === 'edit' && initialData ? initialData.paymentMethod || '' : 'UPI';
  });

  const [description, setDescription] = useState<string>(() => {
    return mode === 'edit' && initialData ? initialData.description || '' : '';
  });

  const [isRecurring, setIsRecurring] = useState<boolean>(() => {
    return mode === 'edit' && initialData ? Boolean(initialData.isRecurring) : false;
  });

  const [categorySearch, setCategorySearch] = useState<string>('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCustomCategoryOpen, setIsCustomCategoryOpen] = useState(false);

  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeTransactionDrawer();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [closeTransactionDrawer]);

  // Strict isolation: Expense categories ONLY for expense, Income categories ONLY for income
  const typeFilteredCategories = useMemo(() => {
    return categories.filter((c) => c.type === type || c.type === 'both');
  }, [categories, type]);

  // Filtered categories based only on search query (No group filter chips)
  const displayedCategories = useMemo(() => {
    const query = categorySearch.trim().toLowerCase();
    if (!query) return typeFilteredCategories;
    return typeFilteredCategories.filter((cat) => cat.name.toLowerCase().includes(query));
  }, [typeFilteredCategories, categorySearch]);

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
        isRecurring: type === 'expense' ? isRecurring : false,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div
        className="fixed inset-0 z-50 overflow-hidden bg-black/75 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="drawer-title"
      >
        {/* Backdrop dismiss */}
        <div className="absolute inset-0" onClick={closeTransactionDrawer} />

        <div className="fixed inset-y-0 right-0 max-w-full flex">
          {/* Slide-over panel: 100dvh for mobile Safari support, max-w-lg on desktop */}
          <div
            ref={drawerRef}
            className="w-screen max-w-full md:max-w-md bg-white dark:bg-[#0A0A0A] shadow-2xl flex flex-col h-[100dvh] border-l border-slate-200 dark:border-[#262626] animate-in slide-in-from-right duration-250 z-10"
          >
            {/* Header: Fixed at top with subtle, non-obstructive local session indicator */}
            <div className="shrink-0 flex items-center justify-between px-5 py-3.5 border-b border-slate-100 dark:border-[#262626] bg-white dark:bg-[#0A0A0A] z-20">
              <div className="flex items-center gap-2.5">
                <div>
                  <div className="flex items-center gap-2">
                    <h2
                      id="drawer-title"
                      className="text-base font-semibold text-slate-900 dark:text-white tracking-tight"
                    >
                      {mode === 'edit' ? 'Edit Transaction' : 'Record Transaction'}
                    </h2>
                    <span className="inline-flex items-center px-1.5 py-0.5 text-[10px] font-medium rounded-md bg-slate-100 dark:bg-[#141414] text-slate-500 dark:text-[#A3A3A3]">
                      Local
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-[#A3A3A3] mt-0.5">
                    {type === 'expense' ? 'Record outgoing expense' : 'Add incoming funds'}
                  </p>
                </div>
              </div>

              <button
                onClick={closeTransactionDrawer}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#141414] transition-colors duration-150"
                aria-label="Close form"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Form Body: Single scroll context with generous bottom padding so footer never obstructs */}
            <form
              id="transaction-drawer-form"
              onSubmit={handleSubmit}
              className="flex-1 min-h-0 overflow-y-auto px-5 py-4 pb-28 space-y-4 overscroll-contain"
            >
              {/* Income / Expense Segmented Control */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-[#A3A3A3] mb-1.5">
                  Transaction Type
                </label>
                <div className="grid grid-cols-2 p-1 bg-slate-100 dark:bg-[#141414] rounded-xl border border-slate-200/60 dark:border-[#262626]">
                  <button
                    type="button"
                    onClick={() => {
                      if (type !== 'expense') {
                        setType('expense');
                        setCategoryId('');
                      }
                    }}
                    className={`py-2 text-xs font-semibold rounded-lg transition-colors duration-150 ${
                      type === 'expense'
                        ? 'bg-rose-600 text-white'
                        : 'text-slate-600 dark:text-[#A3A3A3] hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    Expense
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (type !== 'income') {
                        setType('income');
                        setCategoryId('');
                      }
                    }}
                    className={`py-2 text-xs font-semibold rounded-lg transition-colors duration-150 ${
                      type === 'income'
                        ? 'bg-emerald-600 text-white'
                        : 'text-slate-600 dark:text-[#A3A3A3] hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    Income
                  </button>
                </div>
              </div>

              {/* Amount Field */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-[#A3A3A3] mb-1.5">
                  Amount in INR (₹) <span className="text-rose-500">*</span>
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm pointer-events-none select-none">
                    ₹
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={amountStr}
                    onChange={(e) => setAmountStr(e.target.value)}
                    className={`w-full pl-9 pr-3.5 py-2 text-sm font-bold bg-slate-50 dark:bg-[#141414] border rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 tabular-nums ${
                      errors.amount
                        ? 'border-red-500 ring-1 ring-red-500'
                        : 'border-slate-200 dark:border-[#262626]'
                    }`}
                    autoFocus={mode === 'add'}
                  />
                </div>
                {errors.amount && (
                  <p className="text-xs font-medium text-red-500 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    {errors.amount}
                  </p>
                )}
              </div>

              {/* Clean, Non-Nested Category Selector */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-[#A3A3A3]">
                    Category <span className="text-rose-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsCustomCategoryOpen(true)}
                    className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Create Category
                  </button>
                </div>

                {/* If categories exist, show optional quick search */}
                {typeFilteredCategories.length > 5 && (
                  <div className="relative flex items-center mb-2">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    <input
                      type="text"
                      value={categorySearch}
                      onChange={(e) => setCategorySearch(e.target.value)}
                      placeholder={`Search ${type} categories...`}
                      className="w-full pl-8 pr-8 py-1.5 text-xs bg-slate-50 dark:bg-[#141414] border border-slate-200 dark:border-[#262626] rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                    {categorySearch && (
                      <button
                        type="button"
                        onClick={() => setCategorySearch('')}
                        className="absolute right-2.5 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white"
                        aria-label="Clear search"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                )}

                {/* First-time minimal empty state: No categories yet */}
                {typeFilteredCategories.length === 0 ? (
                  <div className="py-6 px-4 text-center rounded-xl border border-dashed border-slate-200 dark:border-[#262626]">
                    <div className="w-10 h-10 mx-auto rounded-full bg-slate-100 dark:bg-[#141414] text-slate-400 flex items-center justify-center mb-2.5">
                      <Tag className="w-5 h-5" />
                    </div>
                    <h3 className="text-xs font-semibold text-slate-900 dark:text-white">
                      No categories yet
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-[#A3A3A3] mt-1 max-w-xs mx-auto">
                      Create categories that match how you manage your money.
                    </p>
                    <button
                      type="button"
                      onClick={() => setIsCustomCategoryOpen(true)}
                      className="mt-3.5 inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors duration-150"
                    >
                      <Plus className="w-3.5 h-3.5" /> Create Category
                    </button>
                  </div>
                ) : (
                  /* Clean list with subtle separators, minimal selected state, and NO nested scroll trap */
                  <div className="space-y-1">
                    {displayedCategories.map((cat) => {
                      const isSelected = categoryId === cat.id;
                      return (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => {
                            setCategoryId(cat.id);
                            if (errors.categoryId) {
                              setErrors((prev) => ({ ...prev, categoryId: '' }));
                            }
                          }}
                          className={`w-full min-h-[40px] flex items-center justify-between gap-3 px-3 py-2 rounded-xl text-left transition-colors duration-150 ${
                            isSelected
                              ? type === 'income'
                                ? 'bg-emerald-600 text-white font-medium shadow-xs'
                                : 'bg-blue-600 text-white font-medium shadow-xs'
                              : 'bg-transparent text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#141414]'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0 flex-1">
                            <div
                              className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                              style={{
                                backgroundColor: isSelected ? 'rgba(255,255,255,0.2)' : `${cat.color}20`,
                                color: isSelected ? '#ffffff' : cat.color,
                              }}
                            >
                              <CategoryIcon
                                name={cat.icon}
                                color={isSelected ? '#ffffff' : cat.color}
                                className="w-3.5 h-3.5"
                              />
                            </div>
                            {/* Full user-defined category name only (No group labels) */}
                            <span className="text-xs leading-snug break-words flex-1">
                              {cat.name}
                            </span>
                          </div>

                          {isSelected && (
                            <Check className="w-4 h-4 text-white shrink-0" />
                          )}
                        </button>
                      );
                    })}

                    {displayedCategories.length === 0 && (
                      <div className="py-4 text-center text-xs text-slate-400 dark:text-[#A3A3A3]">
                        No categories match &ldquo;{categorySearch}&rdquo;.
                        <button
                          type="button"
                          onClick={() => setIsCustomCategoryOpen(true)}
                          className="block mx-auto mt-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          + Create &ldquo;{categorySearch}&rdquo;
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {errors.categoryId && (
                  <p className="text-xs font-medium text-red-500 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    {errors.categoryId}
                  </p>
                )}
              </div>

              {/* Transaction Date: Standard clean padding with NO overlapping decorative icon */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-[#A3A3A3] mb-1.5">
                  Transaction Date <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs font-medium bg-slate-50 dark:bg-[#141414] border border-slate-200 dark:border-[#262626] rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600 cursor-pointer [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:dark:invert"
                />
                {errors.date && (
                  <p className="text-xs font-medium text-red-500 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    {errors.date}
                  </p>
                )}
              </div>

              {/* Payment Method */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-[#A3A3A3] mb-1.5">
                  Payment Method (Optional)
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                  className="w-full px-3.5 py-2 text-xs font-medium bg-slate-50 dark:bg-[#141414] border border-slate-200 dark:border-[#262626] rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600 cursor-pointer"
                >
                  <option value="">None / Unspecified</option>
                  {PAYMENT_METHODS.map((pm) => (
                    <option key={pm} value={pm}>
                      {pm}
                    </option>
                  ))}
                </select>
              </div>

              {/* Description / Note */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-[#A3A3A3] mb-1.5">
                  Description / Note (Optional)
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Groceries, Semester books, Cafeteria lunch..."
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-[#141414] border border-slate-200 dark:border-[#262626] rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 resize-none"
                />
                {errors.description && (
                  <p className="text-xs font-medium text-red-500 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    {errors.description}
                  </p>
                )}
              </div>

              {/* Explicit Recurring Commitment Designation */}
              {type === 'expense' && (
                <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-[#141414] rounded-xl border border-slate-200/80 dark:border-[#262626]">
                  <div>
                    <div className="text-xs font-semibold text-slate-900 dark:text-white">
                      Mark as Recurring Commitment
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-[#A3A3A3]">
                      Designates this as a monthly recurring bill, subscription, or rent
                    </div>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={isRecurring}
                    onClick={() => setIsRecurring(!isRecurring)}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-150 ease-out focus:outline-none focus:ring-2 focus:ring-blue-600 ${
                      isRecurring ? 'bg-blue-600' : 'bg-slate-200 dark:bg-[#262626]'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-150 ${
                        isRecurring ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              )}
            </form>

            {/* Sticky Footer Action Buttons: Safe-area inset, never overlaps content */}
            <div className="shrink-0 px-5 py-3.5 bg-white/95 dark:bg-[#0A0A0A]/95 backdrop-blur-md border-t border-slate-100 dark:border-[#262626] pb-[max(1rem,env(safe-area-inset-bottom))] flex items-center justify-between gap-3 z-20">
              <button
                type="button"
                onClick={closeTransactionDrawer}
                className="px-4 py-2.5 text-xs font-semibold text-slate-600 dark:text-[#A3A3A3] hover:bg-slate-100 dark:hover:bg-[#141414] rounded-xl transition-colors duration-150"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="transaction-drawer-form"
                disabled={isSubmitting}
                className="px-6 py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 dark:bg-white dark:text-black dark:hover:bg-slate-200 rounded-xl transition-colors duration-150 active:scale-95 disabled:opacity-50"
              >
                {isSubmitting
                  ? 'Saving...'
                  : mode === 'edit'
                  ? 'Save Changes'
                  : 'Add Transaction'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Custom Category Modal */}
      <CustomCategoryModal
        isOpen={isCustomCategoryOpen}
        defaultType={type}
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
