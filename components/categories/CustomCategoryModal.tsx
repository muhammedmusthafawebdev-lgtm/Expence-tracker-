'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { X, Check } from 'lucide-react';
import { TransactionType, Category } from '@/types';
import { CategoryIcon } from '@/components/ui/CategoryIcon';

interface CustomCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultType?: TransactionType;
  categoryToEdit?: Category | null;
  onCreated?: (category: Category) => void;
  onUpdated?: (category: Category) => void;
}

const AVAILABLE_ICONS = [
  'Tag',
  'Utensils',
  'ShoppingBag',
  'Shirt',
  'Home',
  'BookOpen',
  'GraduationCap',
  'Bus',
  'Car',
  'Plane',
  'Laptop',
  'Smartphone',
  'Coffee',
  'Heart',
  'Zap',
  'Pill',
  'Film',
  'Gamepad2',
  'Landmark',
  'CreditCard',
  'Banknote',
  'Wallet',
  'Gift',
  'Award',
  'Sparkles',
  'Dumbbell',
  'Music',
  'Tv',
  'Briefcase',
  'TrendingUp',
];

const AVAILABLE_COLORS = [
  '#2563EB', // Blue
  '#16A34A', // Green
  '#DC2626', // Red
  '#D97706', // Amber
  '#7C3AED', // Purple
  '#EC4899', // Pink
  '#0EA5E9', // Sky
  '#F97316', // Orange
  '#14B8A6', // Teal
  '#64748B', // Slate
];

interface ModalContentProps {
  onClose: () => void;
  defaultType: TransactionType;
  categoryToEdit?: Category | null;
  onCreated?: (category: Category) => void;
  onUpdated?: (category: Category) => void;
}

function CustomCategoryModalContent({
  onClose,
  defaultType,
  categoryToEdit,
  onCreated,
  onUpdated,
}: ModalContentProps) {
  const { categories, addCustomCategory, updateCategory } = useApp();

  const isEditMode = Boolean(categoryToEdit);

  const [name, setName] = useState(categoryToEdit ? categoryToEdit.name : '');
  const [type, setType] = useState<TransactionType>(
    categoryToEdit
      ? categoryToEdit.type === 'both'
        ? 'expense'
        : categoryToEdit.type
      : defaultType
  );
  const [selectedIcon, setSelectedIcon] = useState(categoryToEdit?.icon || 'Tag');
  const [selectedColor, setSelectedColor] = useState(
    categoryToEdit?.color || (defaultType === 'income' ? '#16A34A' : '#2563EB')
  );
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError('Category name is required.');
      return;
    }

    // Check duplicate name within the same type (case-insensitive)
    const duplicate = categories.some((c) => {
      if (isEditMode && categoryToEdit && c.id === categoryToEdit.id) {
        return false;
      }
      const sameName = c.name.trim().toLowerCase() === trimmed.toLowerCase();
      const sameType = c.type === type || c.type === 'both';
      return sameName && sameType;
    });

    if (duplicate) {
      setError(`A ${type} category named "${trimmed}" already exists.`);
      return;
    }

    setIsSubmitting(true);
    try {
      if (isEditMode && categoryToEdit) {
        const updated = await updateCategory(categoryToEdit.id, {
          name: trimmed,
          type,
          icon: selectedIcon,
          color: selectedColor,
        });
        onUpdated?.(updated);
      } else {
        const created = await addCustomCategory({
          name: trimmed,
          type,
          icon: selectedIcon,
          color: selectedColor,
        });
        onCreated?.(created);
      }
      setName('');
      setError(null);
      onClose();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to save category';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="custom-cat-title"
    >
      <div className="relative w-full max-w-md max-h-[90dvh] overflow-y-auto bg-white dark:bg-[#0A0A0A] rounded-2xl border border-slate-200 dark:border-[#262626] shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 pt-5 pb-2">
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
              style={{ backgroundColor: `${selectedColor}20`, color: selectedColor }}
            >
              <CategoryIcon name={selectedIcon} className="w-4 h-4" />
            </div>
            <div>
              <h2
                id="custom-cat-title"
                className="text-sm font-semibold text-slate-900 dark:text-white"
              >
                {isEditMode ? 'Edit Category' : 'Create Category'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-[#A3A3A3]">
                {isEditMode ? 'Modify category properties' : 'Define how you manage your money'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 min-w-[36px] min-h-[36px] flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#141414] transition-colors duration-150"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">
          {/* Type Selector (Segmented buttons) */}
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-[#A3A3A3] mb-1.5">
              Category Type
            </label>
            <div className="grid grid-cols-2 p-1 bg-slate-100 dark:bg-[#141414] rounded-xl border border-slate-200/60 dark:border-[#262626]">
              <button
                type="button"
                onClick={() => {
                  setType('expense');
                  if (!isEditMode && selectedColor === '#16A34A') {
                    setSelectedColor('#2563EB');
                  }
                }}
                className={`py-2 min-h-[38px] text-xs font-semibold rounded-lg transition-colors duration-150 ${
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
                  setType('income');
                  if (!isEditMode && selectedColor === '#2563EB') {
                    setSelectedColor('#16A34A');
                  }
                }}
                className={`py-2 min-h-[38px] text-xs font-semibold rounded-lg transition-colors duration-150 ${
                  type === 'income'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-[#A3A3A3] hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Income
              </button>
            </div>
          </div>

          {/* Name Input */}
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-[#A3A3A3] mb-1.5">
              Category Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError(null);
              }}
              placeholder={type === 'expense' ? 'e.g., Groceries, Rent, Coffee' : 'e.g., Salary, Allowance, Freelance'}
              className="w-full px-3.5 py-2.5 text-base sm:text-xs min-h-[42px] bg-slate-50 dark:bg-[#141414] border border-slate-200 dark:border-[#262626] rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
              autoFocus
            />
            {error && (
              <p className="mt-1.5 text-xs text-rose-500 font-medium">
                {error}
              </p>
            )}
          </div>

          {/* Icon Selector */}
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-[#A3A3A3] mb-1.5">
              Icon
            </label>
            <div className="grid grid-cols-6 gap-1.5 max-h-32 overflow-y-auto p-1.5 bg-slate-50 dark:bg-[#141414] rounded-xl border border-slate-200 dark:border-[#262626]">
              {AVAILABLE_ICONS.map((iconName) => {
                const isSelected = selectedIcon === iconName;
                return (
                  <button
                    key={iconName}
                    type="button"
                    onClick={() => setSelectedIcon(iconName)}
                    className={`p-2 rounded-lg flex items-center justify-center transition-colors duration-150 ${
                      isSelected
                        ? 'bg-blue-600 text-white ring-2 ring-blue-500/50'
                        : 'text-slate-600 dark:text-[#A3A3A3] hover:bg-slate-200/60 dark:hover:bg-[#262626]'
                    }`}
                    title={iconName}
                  >
                    <CategoryIcon name={iconName} className="w-4 h-4" />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Color Selector */}
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-[#A3A3A3] mb-1.5">
              Color
            </label>
            <div className="flex items-center gap-2.5 flex-wrap">
              {AVAILABLE_COLORS.map((colorHex) => {
                const isSelected = selectedColor === colorHex;
                return (
                  <button
                    key={colorHex}
                    type="button"
                    onClick={() => setSelectedColor(colorHex)}
                    className="w-7 h-7 rounded-full flex items-center justify-center transition-transform duration-150 hover:scale-110 active:scale-95 shrink-0"
                    style={{ backgroundColor: colorHex }}
                    aria-label={`Select color ${colorHex}`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 min-h-[42px] text-xs font-medium text-slate-600 dark:text-[#A3A3A3] hover:text-slate-900 dark:hover:text-white rounded-xl transition-colors duration-150"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 min-h-[42px] text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 dark:bg-white dark:text-black dark:hover:bg-slate-200 rounded-xl transition-colors duration-150 disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : isEditMode ? 'Update Category' : 'Create Category'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function CustomCategoryModal({
  isOpen,
  onClose,
  defaultType = 'expense',
  categoryToEdit,
  onCreated,
  onUpdated,
}: CustomCategoryModalProps) {
  if (!isOpen) return null;

  return (
    <CustomCategoryModalContent
      key={categoryToEdit?.id || defaultType || 'new'}
      onClose={onClose}
      defaultType={defaultType}
      categoryToEdit={categoryToEdit}
      onCreated={onCreated}
      onUpdated={onUpdated}
    />
  );
}
