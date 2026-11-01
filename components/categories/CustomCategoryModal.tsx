'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { X, Plus, Check } from 'lucide-react';
import { TransactionType, Category } from '@/types';
import { CategoryIcon } from '@/components/ui/CategoryIcon';

interface CustomCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultType?: TransactionType;
  onCreated?: (category: Category) => void;
}

export function CustomCategoryModal({
  isOpen,
  onClose,
  defaultType = 'expense',
  onCreated,
}: CustomCategoryModalProps) {
  const { addCustomCategory } = useApp();

  const [name, setName] = useState('');
  const [type, setType] = useState<TransactionType>(defaultType);
  const [selectedIcon, setSelectedIcon] = useState('Tag');
  const [selectedColor, setSelectedColor] = useState('#2563EB');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const availableIcons = [
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
  ];

  const availableColors = [
    '#2563EB', // Blue
    '#16A34A', // Green
    '#DC2626', // Red
    '#D97706', // Amber
    '#7C3AED', // Purple
    '#EC4899', // Pink
    '#0EA5E9', // Sky
    '#64748B', // Slate
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Category name is required');
      return;
    }

    const created = await addCustomCategory({
      name: name.trim(),
      type,
      icon: selectedIcon,
      color: selectedColor,
      studentGroup: 'custom',
    });

    onCreated?.(created);
    setName('');
    setError(null);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="custom-cat-title"
    >
      <div className="relative w-full max-w-md bg-white dark:bg-[#111111] rounded-2xl border border-slate-200 dark:border-[#262626] shadow-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-[#262626]">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
              <Plus className="w-4 h-4" />
            </div>
            <div>
              <h2
                id="custom-cat-title"
                className="text-base font-semibold text-slate-900 dark:text-white"
              >
                New Category
              </h2>
              <p className="text-xs text-slate-500 dark:text-[#A3A3A3]">
                Create a custom category for your records
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Notice on session scope */}
        <div className="px-6 py-2.5 bg-blue-50/60 dark:bg-blue-950/30 border-b border-blue-100/60 dark:border-blue-900/40 text-[11px] text-blue-700 dark:text-blue-300 leading-relaxed">
          Custom categories are active for this student session. Cloud synchronization is pending backend integration.
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Type Segmented Button */}
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-[#A3A3A3] mb-1.5">
              Category Type
            </label>
            <div className="grid grid-cols-2 p-1 bg-slate-100 dark:bg-[#0A0A0A] rounded-xl border border-slate-200/60 dark:border-[#262626]">
              <button
                type="button"
                onClick={() => setType('expense')}
                className={`py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  type === 'expense'
                    ? 'bg-white dark:bg-[#262626] text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-[#A3A3A3]'
                }`}
              >
                Expense
              </button>
              <button
                type="button"
                onClick={() => setType('income')}
                className={`py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  type === 'income'
                    ? 'bg-white dark:bg-[#262626] text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-[#A3A3A3]'
                }`}
              >
                Income
              </button>
            </div>
          </div>

          {/* Name Input */}
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-[#A3A3A3] mb-1.5">
              Category Title
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError(null);
              }}
              placeholder="e.g., Coding Bootcamp, Hostel Laundry, Thesis..."
              className="w-full px-3.5 py-2 text-sm bg-white dark:bg-[#0A0A0A] border border-slate-200 dark:border-[#262626] rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
            {error && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{error}</p>}
          </div>

          {/* Icon Selector */}
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-[#A3A3A3] mb-2">
              Select Icon
            </label>
            <div className="grid grid-cols-6 gap-2 max-h-32 overflow-y-auto p-1 bg-slate-50 dark:bg-[#0A0A0A] rounded-xl border border-slate-200 dark:border-[#262626]">
              {availableIcons.map((iconName) => (
                <button
                  key={iconName}
                  type="button"
                  onClick={() => setSelectedIcon(iconName)}
                  className={`p-2 rounded-xl flex items-center justify-center transition-all ${
                    selectedIcon === iconName
                      ? 'bg-blue-50 dark:bg-blue-950/80 ring-2 ring-blue-600 text-blue-600'
                      : 'text-slate-600 dark:text-[#A3A3A3] hover:bg-slate-200/60 dark:hover:bg-[#111111]'
                  }`}
                >
                  <CategoryIcon name={iconName} className="w-4 h-4" />
                </button>
              ))}
            </div>
          </div>

          {/* Color Selector */}
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-[#A3A3A3] mb-2">
              Badge Color
            </label>
            <div className="flex items-center gap-2">
              {availableColors.map((colorHex) => (
                <button
                  key={colorHex}
                  type="button"
                  onClick={() => setSelectedColor(colorHex)}
                  className="w-7 h-7 rounded-full flex items-center justify-center transition-transform hover:scale-110"
                  style={{ backgroundColor: colorHex }}
                >
                  {selectedColor === colorHex && <Check className="w-3.5 h-3.5 text-white" />}
                </button>
              ))}
            </div>
          </div>

          {/* Buttons */}
          <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-[#262626]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-[#A3A3A3] hover:text-slate-900 dark:hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors shadow-xs"
            >
              Add Category
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
