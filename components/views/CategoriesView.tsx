'use client';

import React, { useState, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { Plus, Tag, Edit2, Trash2, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { Category, TransactionType } from '@/types';
import { CategoryIcon } from '@/components/ui/CategoryIcon';
import { CustomCategoryModal } from '@/components/categories/CustomCategoryModal';

export function CategoriesView() {
  const { categories, transactions, deleteCategory } = useApp();

  const [activeTab, setActiveTab] = useState<'all' | 'expense' | 'income'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [categoryToEdit, setCategoryToEdit] = useState<Category | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [modalDefaultType, setModalDefaultType] = useState<TransactionType>('expense');

  // Filtered categories by active tab
  const filteredCategories = useMemo(() => {
    if (activeTab === 'all') return categories;
    return categories.filter((c) => c.type === activeTab || c.type === 'both');
  }, [categories, activeTab]);

  const expenseCount = useMemo(
    () => categories.filter((c) => c.type === 'expense' || c.type === 'both').length,
    [categories]
  );
  const incomeCount = useMemo(
    () => categories.filter((c) => c.type === 'income' || c.type === 'both').length,
    [categories]
  );

  // Compute transaction counts for each category
  const categoryUsageCount = useMemo(() => {
    const map: Record<string, number> = {};
    transactions.forEach((tx) => {
      if (!tx.deletedAt) {
        map[tx.categoryId] = (map[tx.categoryId] || 0) + 1;
      }
    });
    return map;
  }, [transactions]);

  const handleOpenCreate = (prefType: TransactionType = 'expense') => {
    setCategoryToEdit(null);
    setModalDefaultType(prefType);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (category: Category) => {
    setCategoryToEdit(category);
    setIsModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!categoryToDelete) return;
    await deleteCategory(categoryToDelete.id);
    setCategoryToDelete(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            Categories
          </h2>
          <p className="text-xs text-slate-500 dark:text-[#A3A3A3] mt-0.5">
            Manage your personal expense and income categories
          </p>
        </div>

        <button
          onClick={() => handleOpenCreate(activeTab === 'income' ? 'income' : 'expense')}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 dark:bg-white dark:text-black dark:hover:bg-slate-200 rounded-xl transition-colors duration-150 shadow-xs self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Create Category
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-[#262626] pb-3">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors duration-150 ${
            activeTab === 'all'
              ? 'bg-slate-900 text-white dark:bg-white dark:text-black font-semibold'
              : 'text-slate-600 dark:text-[#A3A3A3] hover:bg-slate-100 dark:hover:bg-[#141414]'
          }`}
        >
          All ({categories.length})
        </button>
        <button
          onClick={() => setActiveTab('expense')}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors duration-150 ${
            activeTab === 'expense'
              ? 'bg-rose-600 text-white font-semibold'
              : 'text-slate-600 dark:text-[#A3A3A3] hover:bg-slate-100 dark:hover:bg-[#141414]'
          }`}
        >
          Expenses ({expenseCount})
        </button>
        <button
          onClick={() => setActiveTab('income')}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors duration-150 ${
            activeTab === 'income'
              ? 'bg-emerald-600 text-white font-semibold'
              : 'text-slate-600 dark:text-[#A3A3A3] hover:bg-slate-100 dark:hover:bg-[#141414]'
          }`}
        >
          Income ({incomeCount})
        </button>
      </div>

      {/* Categories Content */}
      {filteredCategories.length === 0 ? (
        <div className="py-16 px-4 text-center rounded-2xl border border-dashed border-slate-200 dark:border-[#262626] bg-slate-50/50 dark:bg-[#0A0A0A]/50">
          <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 dark:bg-[#141414] text-slate-400 flex items-center justify-center mb-3">
            <Tag className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
            No categories yet
          </h3>
          <p className="text-xs text-slate-500 dark:text-[#A3A3A3] mt-1 max-w-sm mx-auto">
            Create categories that match how you manage your money.
          </p>
          <button
            type="button"
            onClick={() => handleOpenCreate(activeTab === 'income' ? 'income' : 'expense')}
            className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors duration-150"
          >
            <Plus className="w-4 h-4" /> Create Category
          </button>
        </div>
      ) : (
        <div className="bg-white dark:bg-[#0A0A0A] rounded-2xl border border-slate-200 dark:border-[#262626] overflow-hidden">
          <div className="divide-y divide-slate-100 dark:divide-[#1f1f1f]">
            {filteredCategories.map((cat) => {
              const usage = categoryUsageCount[cat.id] || 0;
              const isExpense = cat.type === 'expense';
              return (
                <div
                  key={cat.id}
                  className="flex items-center justify-between p-4 hover:bg-slate-50/60 dark:hover:bg-[#141414]/60 transition-colors duration-150"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                      style={{ backgroundColor: `${cat.color}20`, color: cat.color }}
                    >
                      <CategoryIcon name={cat.icon} className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                          {cat.name}
                        </span>
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold rounded-md ${
                            isExpense
                              ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400'
                              : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
                          }`}
                        >
                          {isExpense ? (
                            <ArrowDownLeft className="w-3 h-3" />
                          ) : (
                            <ArrowUpRight className="w-3 h-3" />
                          )}
                          {cat.type}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 dark:text-[#737373] mt-0.5">
                        {usage} {usage === 1 ? 'transaction' : 'transactions'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => handleOpenEdit(cat)}
                      className="p-2 text-slate-500 hover:text-slate-900 dark:text-[#A3A3A3] dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#1a1a1a] rounded-lg transition-colors duration-150"
                      title="Edit Category"
                      aria-label={`Edit ${cat.name}`}
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setCategoryToDelete(cat)}
                      className="p-2 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors duration-150"
                      title="Delete Category"
                      aria-label={`Delete ${cat.name}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Create / Edit Modal */}
      <CustomCategoryModal
        isOpen={isModalOpen}
        defaultType={modalDefaultType}
        categoryToEdit={categoryToEdit}
        onClose={() => {
          setIsModalOpen(false);
          setCategoryToEdit(null);
        }}
      />

      {/* Delete Confirmation Modal */}
      {categoryToDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-sm bg-white dark:bg-[#0A0A0A] rounded-2xl border border-slate-200 dark:border-[#262626] p-5 shadow-2xl">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              Delete &ldquo;{categoryToDelete.name}&rdquo;?
            </h3>
            <p className="text-xs text-slate-500 dark:text-[#A3A3A3] mt-2">
              Are you sure you want to delete this category? Existing transactions will retain their historical records.
            </p>
            <div className="mt-4 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setCategoryToDelete(null)}
                className="px-3.5 py-1.5 text-xs font-medium text-slate-600 dark:text-[#A3A3A3] hover:text-slate-900 dark:hover:text-white rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-3.5 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-colors duration-150"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
