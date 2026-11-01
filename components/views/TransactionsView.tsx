'use client';

import React, { useState, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import {
  Search,
  Plus,
  Trash2,
  Edit2,
  FolderOpen,
} from 'lucide-react';
import { formatINR } from '@/lib/calculations/financial';
import { CategoryIcon } from '@/components/ui/CategoryIcon';
import { EmptyState } from '@/components/ui/EmptyState';
import { TransactionType } from '@/types';

export function TransactionsView() {
  const {
    transactions,
    categories,
    openAddTransaction,
    openEditTransaction,
    deleteTransaction,
  } = useApp();

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<TransactionType | 'all'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState('');

  // Filtered transactions (excluding deleted)
  const filtered = useMemo(() => {
    return transactions.filter((t) => {
      if (t.deletedAt) return false;
      if (typeFilter !== 'all' && t.type !== typeFilter) return false;
      if (categoryFilter !== 'all' && t.categoryId !== categoryFilter) return false;
      if (dateFilter && t.date !== dateFilter) return false;

      if (search.trim()) {
        const q = search.toLowerCase();
        const cat = categories.find((c) => c.id === t.categoryId);
        const matchDesc = t.description?.toLowerCase().includes(q);
        const matchCat = cat?.name.toLowerCase().includes(q);
        const matchMethod = t.paymentMethod?.toLowerCase().includes(q);
        if (!matchDesc && !matchCat && !matchMethod) return false;
      }

      return true;
    });
  }, [transactions, categories, typeFilter, categoryFilter, dateFilter, search]);

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Top Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            Transactions
          </h2>
          <p className="text-xs text-slate-500 dark:text-[#A3A3A3] mt-0.5">
            {filtered.length} {filtered.length === 1 ? 'entry' : 'entries'} in active ledger
          </p>
        </div>

        <button
          onClick={openAddTransaction}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors duration-150 self-start sm:self-auto active:scale-95"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          Add Transaction
        </button>
      </div>

      {/* Simplified Filter Toolbar */}
      <div className="p-3 bg-white dark:bg-[#0A0A0A] rounded-2xl border border-slate-200/80 dark:border-[#262626]">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search description, category..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-[#141414] border border-slate-200 dark:border-[#262626] rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          {/* Type Segmented Control */}
          <div className="flex p-0.5 bg-slate-100 dark:bg-[#141414] rounded-xl border border-slate-200/60 dark:border-[#262626]">
            {(['all', 'expense', 'income'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={`flex-1 py-1 text-xs font-semibold rounded-lg capitalize transition-colors duration-150 ${
                  typeFilter === t
                    ? 'bg-white dark:bg-[#262626] text-slate-900 dark:text-white'
                    : 'text-slate-500 dark:text-[#A3A3A3] hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Category Dropdown */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-[#141414] border border-slate-200 dark:border-[#262626] rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Date Filter */}
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-[#141414] border border-slate-200 dark:border-[#262626] rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>
      </div>

      {/* Transaction List / Table */}
      {filtered.length > 0 ? (
        <div className="bg-white dark:bg-[#0A0A0A] rounded-2xl border border-slate-200/80 dark:border-[#262626] overflow-hidden">
          {/* Desktop Table: Compact Scannable Layout */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-[#262626] bg-slate-50/50 dark:bg-[#141414]/40 text-xs font-bold text-slate-500 dark:text-[#A3A3A3] uppercase tracking-wider">
                  <th className="py-2.5 px-4">Category</th>
                  <th className="py-2.5 px-4">Date</th>
                  <th className="py-2.5 px-4">Method</th>
                  <th className="py-2.5 px-4">Description</th>
                  <th className="py-2.5 px-4 text-right">Amount</th>
                  <th className="py-2.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-[#262626] text-xs">
                {filtered.map((tx) => {
                  const cat = categories.find((c) => c.id === tx.categoryId);
                  const isExpense = tx.type === 'expense';
                  return (
                    <tr
                      key={tx.id}
                      className="hover:bg-slate-50/60 dark:hover:bg-[#141414]/60 transition-colors duration-150 h-10"
                    >
                      <td className="py-2 px-4">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0"
                            style={{ backgroundColor: `${cat?.color || '#2563EB'}20` }}
                          >
                            <CategoryIcon name={cat?.icon || 'Tag'} color={cat?.color} className="w-3.5 h-3.5" />
                          </div>
                          <span className="font-semibold text-slate-900 dark:text-white">
                            {cat?.name || 'General'}
                          </span>
                        </div>
                      </td>
                      <td className="py-2 px-4 text-slate-600 dark:text-[#A3A3A3] tabular-nums">
                        {tx.date}
                      </td>
                      <td className="py-2 px-4 text-slate-600 dark:text-[#A3A3A3]">
                        {tx.paymentMethod || '—'}
                      </td>
                      <td className="py-2 px-4 text-slate-600 dark:text-[#A3A3A3] max-w-xs truncate">
                        {tx.description || '—'}
                      </td>
                      <td
                        className={`py-2 px-4 text-right font-bold tabular-nums ${
                          isExpense ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'
                        }`}
                      >
                        {isExpense ? '-' : '+'}
                        {formatINR(tx.amountPaise)}
                      </td>
                      <td className="py-2 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openEditTransaction(tx)}
                            className="p-1 rounded-md text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-[#141414] transition-colors duration-150"
                            title="Edit Transaction"
                            aria-label="Edit"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => deleteTransaction(tx.id)}
                            className="p-1 rounded-md text-slate-400 hover:text-red-600 hover:bg-slate-100 dark:hover:bg-[#141414] transition-colors duration-150"
                            title="Move to Recently Deleted"
                            aria-label="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Scannable Cards */}
          <div className="md:hidden divide-y divide-slate-100 dark:divide-[#262626]">
            {filtered.map((tx) => {
              const cat = categories.find((c) => c.id === tx.categoryId);
              const isExpense = tx.type === 'expense';
              return (
                <div key={tx.id} className="p-3 flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2.5">
                    <div
                      className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                      style={{ backgroundColor: `${cat?.color || '#2563EB'}20` }}
                    >
                      <CategoryIcon name={cat?.icon || 'Tag'} color={cat?.color} className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-slate-900 dark:text-white">
                        {cat?.name || 'General'}
                      </div>
                      <div className="text-xs text-slate-400 dark:text-[#A3A3A3] mt-0.5">
                        {tx.date} {tx.paymentMethod ? `· ${tx.paymentMethod}` : ''}
                      </div>
                      {tx.description && (
                        <div className="text-xs text-slate-600 dark:text-[#A3A3A3] mt-0.5 line-clamp-1">
                          {tx.description}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <div
                      className={`text-xs font-bold tabular-nums ${
                        isExpense ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'
                      }`}
                    >
                      {isExpense ? '-' : '+'}
                      {formatINR(tx.amountPaise)}
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditTransaction(tx)}
                        className="p-1 text-slate-400 hover:text-blue-600 transition-colors duration-150"
                        title="Edit"
                        aria-label="Edit"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => deleteTransaction(tx.id)}
                        className="p-1 text-slate-400 hover:text-red-600 transition-colors duration-150"
                        title="Delete"
                        aria-label="Delete"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <EmptyState
          icon={FolderOpen}
          title="No Transactions Match Filter"
          description="Try adjusting your search criteria or record a new transaction."
          actionLabel="Add Transaction"
          onAction={openAddTransaction}
        />
      )}
    </div>
  );
}
