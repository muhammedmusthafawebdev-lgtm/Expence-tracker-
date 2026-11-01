'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import {
  X,
  Plus,
  AlertCircle,
  Calendar,
  CreditCard,
  AlignLeft,
  Search,
  Check,
  ChevronDown,
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

  // UI state for category search and group filtering
  const [categorySearch, setCategorySearch] = useState<string>('');
  const [selectedGroup, setSelectedGroup] = useState<string>('All');
  const [isWarningDismissed, setIsWarningDismissed] = useState<boolean>(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCustomCategoryOpen, setIsCustomCategoryOpen] = useState(false);

  // Focus trap / escape key listener
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

  // Extract unique group names for filter pills
  const availableGroups = useMemo(() => {
    const groups = new Set<string>();
    typeFilteredCategories.forEach((c) => {
      if (c.groupName) groups.add(c.groupName);
    });
    return ['All', ...Array.from(groups)];
  }, [typeFilteredCategories]);

  // Determine effective group without effect
  const effectiveGroup = availableGroups.includes(selectedGroup) ? selectedGroup : 'All';

  // Filtered categories based on search query and group chip
  const displayedCategories = useMemo(() => {
    const query = categorySearch.trim().toLowerCase();
    return typeFilteredCategories.filter((cat) => {
      const matchesSearch =
        query === '' ||
        cat.name.toLowerCase().includes(query) ||
        (cat.groupName && cat.groupName.toLowerCase().includes(query));

      const matchesGroup =
        effectiveGroup === 'All' || cat.groupName === effectiveGroup;

      return matchesSearch && matchesGroup;
    });
  }, [typeFilteredCategories, categorySearch, effectiveGroup]);

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
            className="w-screen max-w-full md:max-w-lg bg-white dark:bg-[#0A0A0A] shadow-2xl flex flex-col h-[100dvh] border-l border-slate-200 dark:border-[#262626] animate-in slide-in-from-right duration-250 z-10"
          >
            {/* Header: Fixed at top */}
            <div className="shrink-0 flex items-center justify-between px-5 py-3.5 border-b border-slate-100 dark:border-[#262626] bg-white dark:bg-[#0A0A0A] z-20">
              <div>
                <h2
                  id="drawer-title"
                  className="text-base font-semibold text-slate-900 dark:text-white tracking-tight"
                >
                  {mode === 'edit' ? 'Edit Transaction' : 'Record Transaction'}
                </h2>
                <p className="text-[11px] text-slate-500 dark:text-[#A3A3A3] mt-0.5">
                  {type === 'expense' ? 'Track your outgoing expense' : 'Add incoming funds / earnings'}
                </p>
              </div>

              <button
                onClick={closeTransactionDrawer}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#141414] transition-colors"
                aria-label="Close form"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Compact, Dismissible Scope Notice */}
            {!isWarningDismissed && (
              <div className="shrink-0 px-4 py-2 bg-amber-500/10 dark:bg-amber-950/30 border-b border-amber-500/20 text-[11px] text-amber-800 dark:text-amber-300 flex items-center justify-between gap-2 animate-in fade-in">
                <div className="flex items-center gap-1.5 min-w-0">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0 text-amber-600 dark:text-amber-400" />
                  <span className="truncate">
                    <strong>Local Session:</strong> Stored in frontend session memory. Backend sync is inactive.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsWarningDismissed(true)}
                  className="p-1 rounded text-amber-600 dark:text-amber-400 hover:text-amber-900 dark:hover:text-amber-200 shrink-0"
                  aria-label="Dismiss banner"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Scrollable Form Body */}
            <form
              id="transaction-drawer-form"
              onSubmit={handleSubmit}
              className="flex-1 overflow-y-auto px-5 py-4 space-y-4 overscroll-contain"
            >
              {/* Income / Expense Segmented Control */}
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-[#A3A3A3] mb-1.5">
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
                    className={`py-2 text-xs font-semibold rounded-lg transition-all ${
                      type === 'expense'
                        ? 'bg-rose-600 text-white shadow-xs'
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
                    className={`py-2 text-xs font-semibold rounded-lg transition-all ${
                      type === 'income'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'text-slate-600 dark:text-[#A3A3A3] hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    Income
                  </button>
                </div>
              </div>

              {/* Amount Field */}
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-[#A3A3A3] mb-1.5">
                  Amount in INR (₹) <span className="text-rose-500">*</span>
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-base pointer-events-none select-none">
                    ₹
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={amountStr}
                    onChange={(e) => setAmountStr(e.target.value)}
                    className={`w-full pl-10 pr-4 py-2.5 text-base font-bold bg-slate-50 dark:bg-[#111111] border rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 tabular-nums ${
                      errors.amount
                        ? 'border-red-500 dark:border-red-500 ring-1 ring-red-500'
                        : 'border-slate-200 dark:border-[#262626]'
                    }`}
                    autoFocus={mode === 'add'}
                  />
                </div>
                {errors.amount && (
                  <p className="text-[11px] font-medium text-red-500 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.amount}
                  </p>
                )}
              </div>

              {/* Mobile-First Category Selector (Never Truncates, Touch-Friendly, Grouped & Searchable) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-[#A3A3A3]">
                    Category <span className="text-rose-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsCustomCategoryOpen(true)}
                    className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Custom Category
                  </button>
                </div>

                {/* Category Search Input */}
                <div className="relative flex items-center">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    value={categorySearch}
                    onChange={(e) => setCategorySearch(e.target.value)}
                    placeholder={`Search ${type === 'expense' ? 'expense' : 'income'} categories...`}
                    className="w-full pl-9 pr-8 py-2 text-xs bg-slate-50 dark:bg-[#111111] border border-slate-200 dark:border-[#262626] rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
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

                {/* Category Group Chips (Horizontal scrolling on mobile) */}
                {availableGroups.length > 2 && (
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-0.5 no-scrollbar">
                    {availableGroups.map((grp) => (
                      <button
                        key={grp}
                        type="button"
                        onClick={() => setSelectedGroup(grp)}
                        className={`px-2.5 py-1 text-[11px] font-medium rounded-lg shrink-0 transition-colors ${
                          effectiveGroup === grp
                            ? 'bg-slate-900 text-white dark:bg-white dark:text-black font-semibold shadow-xs'
                            : 'bg-slate-100 dark:bg-[#141414] text-slate-600 dark:text-[#A3A3A3] hover:bg-slate-200 dark:hover:bg-[#1c1c1c]'
                        }`}
                      >
                        {grp}
                      </button>
                    ))}
                  </div>
                )}

                {/* Responsive Category Grid: Single-column on narrow screens or 2-column with wrap, never truncates! */}
                <div
                  className={`grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto p-1.5 border rounded-2xl bg-slate-50/50 dark:bg-[#0E0E0E] ${
                    errors.categoryId
                      ? 'border-red-500/80 ring-1 ring-red-500/50'
                      : 'border-slate-200 dark:border-[#262626]'
                  }`}
                >
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
                        className={`min-h-[44px] flex items-center justify-between gap-2.5 px-3 py-2.5 rounded-xl text-left transition-all ${
                          isSelected
                            ? type === 'income'
                              ? 'bg-emerald-600 text-white font-semibold ring-2 ring-emerald-500/50 shadow-xs'
                              : 'bg-blue-600 text-white font-semibold ring-2 ring-blue-500/50 shadow-xs'
                            : 'bg-white dark:bg-[#141414] text-slate-800 dark:text-slate-200 border border-slate-200/80 dark:border-[#262626] hover:bg-slate-100 dark:hover:bg-[#1a1a1a]'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                          <div
                            className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                              isSelected
                                ? 'bg-white/20 text-white'
                                : 'bg-slate-100 dark:bg-[#1c1c1c]'
                            }`}
                            style={{
                              backgroundColor: isSelected ? undefined : `${cat.color}20`,
                              color: isSelected ? '#ffffff' : cat.color,
                            }}
                          >
                            <CategoryIcon
                              name={cat.icon}
                              color={isSelected ? '#ffffff' : cat.color}
                              className="w-3.5 h-3.5"
                            />
                          </div>
                          {/* Full category name visible, break-words so never truncated! */}
                          <div className="min-w-0 flex-1">
                            <span className="text-xs leading-snug break-words">
                              {cat.name}
                            </span>
                            {cat.groupName && cat.groupName !== 'Income' && (
                              <div
                                className={`text-[10px] uppercase font-bold tracking-wider mt-0.5 ${
                                  isSelected
                                    ? 'text-white/80'
                                    : 'text-slate-400 dark:text-[#737373]'
                                }`}
                              >
                                {cat.groupName}
                              </div>
                            )}
                          </div>
                        </div>

                        {isSelected && (
                          <div className="w-5 h-5 rounded-full bg-white/25 flex items-center justify-center shrink-0">
                            <Check className="w-3.5 h-3.5 text-white" />
                          </div>
                        )}
                      </button>
                    );
                  })}

                  {displayedCategories.length === 0 && (
                    <div className="col-span-full py-6 text-center text-xs text-slate-400 dark:text-[#A3A3A3]">
                      No categories match &ldquo;{categorySearch}&rdquo;.
                      <button
                        type="button"
                        onClick={() => setIsCustomCategoryOpen(true)}
                        className="block mx-auto mt-2 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        + Create &ldquo;{categorySearch}&rdquo; Category
                      </button>
                    </div>
                  )}
                </div>

                {errors.categoryId && (
                  <p className="text-[11px] font-medium text-red-500 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.categoryId}
                  </p>
                )}
              </div>

              {/* Transaction Date (Fixed calendar icon overlap with pl-11) */}
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-[#A3A3A3] mb-1.5">
                  Transaction Date <span className="text-rose-500">*</span>
                </label>
                <div className="relative flex items-center">
                  <div className="absolute left-3.5 pointer-events-none text-slate-400 z-10">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full pl-11 pr-4 py-2.5 text-xs font-medium bg-slate-50 dark:bg-[#111111] border border-slate-200 dark:border-[#262626] rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600 [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-75 [&::-webkit-calendar-picker-indicator]:dark:invert"
                  />
                </div>
                {errors.date && (
                  <p className="text-[11px] font-medium text-red-500 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.date}
                  </p>
                )}
              </div>

              {/* Payment Method (Fixed icon overlap with pl-11 and pr-10) */}
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-[#A3A3A3] mb-1.5">
                  Payment Method (Optional)
                </label>
                <div className="relative flex items-center">
                  <div className="absolute left-3.5 pointer-events-none text-slate-400 z-10">
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                    className="w-full pl-11 pr-10 py-2.5 text-xs font-medium bg-slate-50 dark:bg-[#111111] border border-slate-200 dark:border-[#262626] rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600 appearance-none cursor-pointer"
                  >
                    <option value="">None / Unspecified</option>
                    {PAYMENT_METHODS.map((pm) => (
                      <option key={pm} value={pm}>
                        {pm}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-3.5 pointer-events-none text-slate-400">
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </div>
              </div>

              {/* Description / Note */}
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-[#A3A3A3] mb-1.5">
                  Description / Note (Optional)
                </label>
                <div className="relative">
                  <div className="absolute left-3.5 top-3 pointer-events-none text-slate-400">
                    <AlignLeft className="w-4 h-4" />
                  </div>
                  <textarea
                    rows={2}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="e.g. Clothes shopping, Mess monthly fee, Freelance project..."
                    className="w-full pl-11 pr-3 py-2.5 text-xs bg-slate-50 dark:bg-[#111111] border border-slate-200 dark:border-[#262626] rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 resize-none"
                  />
                </div>
                {errors.description && (
                  <p className="text-[11px] font-medium text-red-500 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.description}
                  </p>
                )}
              </div>
            </form>

            {/* Sticky Footer Action Buttons (Never overlaps fields, safe area inset applied) */}
            <div className="shrink-0 px-5 py-3.5 bg-white/95 dark:bg-[#0A0A0A]/95 backdrop-blur-md border-t border-slate-100 dark:border-[#262626] pb-[max(0.875rem,env(safe-area-inset-bottom))] flex items-center justify-between gap-3 z-20">
              <button
                type="button"
                onClick={closeTransactionDrawer}
                className="px-4 py-2.5 text-xs font-semibold text-slate-600 dark:text-[#A3A3A3] hover:bg-slate-100 dark:hover:bg-[#171717] rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="transaction-drawer-form"
                disabled={isSubmitting}
                className="px-6 py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 dark:bg-white dark:text-black dark:hover:bg-slate-200 rounded-xl transition-all shadow-xs active:scale-95 disabled:opacity-50"
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
