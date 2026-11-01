'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import {
  Trash2,
  RotateCcw,
  Clock,
} from 'lucide-react';
import { formatINR } from '@/lib/calculations/financial';
import { CategoryIcon } from '@/components/ui/CategoryIcon';
import { EmptyState } from '@/components/ui/EmptyState';
import { ConfirmModal } from '@/components/ui/ConfirmModal';

export function RecentlyDeletedView() {
  const {
    deletedTransactions,
    categories,
    restoreTransaction,
    permanentlyDeleteTransaction,
    emptyTrash,
  } = useApp();

  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [showEmptyTrashModal, setShowEmptyTrashModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleEmptyTrash = async () => {
    setIsProcessing(true);
    try {
      await emptyTrash();
      setShowEmptyTrashModal(false);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSinglePurge = async () => {
    if (!confirmDeleteId) return;
    setIsProcessing(true);
    try {
      await permanentlyDeleteTransaction(confirmDeleteId);
      setConfirmDeleteId(null);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            Recently Deleted
          </h2>
          <p className="text-xs text-slate-500 dark:text-[#A3A3A3] mt-0.5">
            Items here are held for 30 days before permanent purging. You can restore records at any time.
          </p>
        </div>

        {deletedTransactions.length > 0 && (
          <button
            onClick={() => setShowEmptyTrashModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 hover:bg-red-100 dark:hover:bg-red-900/60 rounded-xl transition-colors border border-red-200/80 dark:border-red-900/80 self-start sm:self-auto active:scale-95"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Empty Trash ({deletedTransactions.length})
          </button>
        )}
      </div>

      {/* 30-Day Retention Notice */}
      <div className="p-3.5 bg-slate-100 dark:bg-[#0A0A0A] rounded-xl border border-slate-200/80 dark:border-[#262626] flex items-start gap-3 text-xs text-slate-600 dark:text-[#A3A3A3]">
        <Clock className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong>Retention Policy:</strong> Deleted transactions remain recoverable in this bin. Restoring an item returns it to your active transactions ledger with original categories and financial calculations preserved.
        </div>
      </div>

      {/* List of deleted transactions */}
      {deletedTransactions.length > 0 ? (
        <div className="bg-white dark:bg-[#0A0A0A] rounded-2xl border border-slate-200/80 dark:border-[#262626] shadow-xs divide-y divide-slate-100 dark:divide-[#262626]">
          {deletedTransactions.map((tx) => {
            const cat = categories.find((c) => c.id === tx.categoryId);
            const isExpense = tx.type === 'expense';

            return (
              <div
                key={tx.id}
                className="p-3.5 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 hover:bg-slate-50/50 dark:hover:bg-[#111111]/40 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 opacity-60"
                    style={{ backgroundColor: `${cat?.color || '#2563EB'}20` }}
                  >
                    <CategoryIcon name={cat?.icon || 'Tag'} color={cat?.color} className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-700 dark:text-slate-300 line-through">
                      {cat?.name || 'General'}{' '}
                      <span className="font-normal text-slate-400">
                        ({isExpense ? 'Expense' : 'Income'})
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 dark:text-[#A3A3A3] mt-0.5">
                      Amount: {formatINR(tx.amountPaise)} · Date: {tx.date}{' '}
                      {tx.deletedAt ? `· Deleted on ${tx.deletedAt.split('T')[0]}` : ''}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <button
                    onClick={() => restoreTransaction(tx.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Restore
                  </button>
                  <button
                    onClick={() => setConfirmDeleteId(tx.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/60 rounded-xl transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Purge
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={Trash2}
          title="Trash Bin is Empty"
          description="No recently deleted transactions. When you delete entries from your ledger, they are retained here safely for 30 days."
        />
      )}

      {/* Confirmation Modal: Empty Entire Trash */}
      <ConfirmModal
        isOpen={showEmptyTrashModal}
        onClose={() => setShowEmptyTrashModal(false)}
        onConfirm={handleEmptyTrash}
        title="Empty Trash Bin"
        message={`Are you sure you want to permanently delete all ${deletedTransactions.length} records? This action cannot be undone and will permanently remove them from this session.`}
        confirmLabel="Empty Trash Permanently"
        cancelLabel="Keep Items"
        itemCount={deletedTransactions.length}
        variant="danger"
        isPending={isProcessing}
      />

      {/* Confirmation Modal: Purge Single Item */}
      <ConfirmModal
        isOpen={confirmDeleteId !== null}
        onClose={() => setConfirmDeleteId(null)}
        onConfirm={handleSinglePurge}
        title="Permanently Delete Record"
        message="Are you sure you want to permanently delete this transaction? This action cannot be undone."
        confirmLabel="Yes, Delete Permanently"
        cancelLabel="Cancel"
        variant="danger"
        isPending={isProcessing}
      />
    </div>
  );
}
