'use client';

import React from 'react';
import {
  X,
  Calendar,
  Phone,
  FileText,
  User,
  Trash2,
  Edit2,
  ArrowDownLeft,
  CheckCircle2,
  Clock,
  AlertTriangle,
} from 'lucide-react';
import { Debt } from '@/types';
import { formatINR } from '@/lib/calculations/financial';

interface DebtDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  debt: Debt;
  onRecordRepayment: (debt: Debt) => void;
  onEdit: (debt: Debt) => void;
  onDelete: (debtId: string) => void;
  onDeleteRepayment: (repaymentId: string, debtId: string) => Promise<unknown>;
}

export function DebtDetailModal({
  isOpen,
  onClose,
  debt,
  onRecordRepayment,
  onEdit,
  onDelete,
  onDeleteRepayment,
}: DebtDetailModalProps) {
  if (!isOpen) return null;

  const pct =
    debt.principalAmountPaise > 0
      ? Math.min(100, Math.round((debt.totalRepaidPaise / debt.principalAmountPaise) * 100))
      : 0;

  const statusConfig = {
    active: {
      label: 'Active',
      color: 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border-blue-200/60 dark:border-blue-900/60',
      icon: Clock,
    },
    partially_repaid: {
      label: 'Partially Repaid',
      color: 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border-amber-200/60 dark:border-amber-900/60',
      icon: ArrowDownLeft,
    },
    overdue: {
      label: 'Overdue',
      color: 'bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 border-red-200/60 dark:border-red-900/60',
      icon: AlertTriangle,
    },
    settled: {
      label: 'Settled',
      color: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border-emerald-200/60 dark:border-emerald-900/60',
      icon: CheckCircle2,
    },
  }[debt.status];

  const StatusIcon = statusConfig.icon;

  const handleDeleteSelf = () => {
    if (confirm(`Are you sure you want to delete the debt record for "${debt.personName}"?`)) {
      onDelete(debt.id);
      onClose();
    }
  };

  const handleDeleteRepaymentClick = async (repaymentId: string, amountPaise: number) => {
    if (
      confirm(
        `Delete this repayment record of ${formatINR(
          amountPaise
        )}? This will increase the outstanding balance.`
      )
    ) {
      await onDeleteRepayment(repaymentId, debt.id);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-lg max-h-[90dvh] overflow-y-auto bg-white dark:bg-[#0A0A0A] rounded-2xl border border-slate-200 dark:border-[#262626] shadow-2xl p-5 sm:p-6 space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100 dark:border-[#262626]">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {debt.personName}
              </h3>
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${statusConfig.color}`}
              >
                <StatusIcon className="w-3 h-3" />
                {statusConfig.label}
              </span>
            </div>
            {debt.phone && (
              <a
                href={`tel:${debt.phone}`}
                className="inline-flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 hover:underline mt-1"
              >
                <Phone className="w-3.5 h-3.5" />
                {debt.phone}
              </a>
            )}
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                onEdit(debt);
                onClose();
              }}
              className="p-2 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#141414] transition-colors"
              title="Edit Debt Details"
              aria-label="Edit Debt Details"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={handleDeleteSelf}
              className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
              title="Delete Debt Record"
              aria-label="Delete Debt Record"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#141414] transition-colors"
              aria-label="Close dialog"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Financial Breakdown Grid */}
        <div className="grid grid-cols-3 gap-3 p-3.5 bg-slate-50 dark:bg-[#141414] rounded-xl border border-slate-200/80 dark:border-[#262626]">
          <div>
            <span className="text-[11px] text-slate-500 dark:text-[#A3A3A3]">Principal</span>
            <div className="text-sm sm:text-base font-bold text-slate-900 dark:text-white tabular-nums mt-0.5">
              {formatINR(debt.principalAmountPaise)}
            </div>
          </div>
          <div>
            <span className="text-[11px] text-slate-500 dark:text-[#A3A3A3]">Repaid</span>
            <div className="text-sm sm:text-base font-bold text-emerald-600 dark:text-emerald-400 tabular-nums mt-0.5">
              {formatINR(debt.totalRepaidPaise)}
            </div>
          </div>
          <div>
            <span className="text-[11px] text-slate-500 dark:text-[#A3A3A3]">Outstanding</span>
            <div className="text-sm sm:text-base font-bold text-blue-600 dark:text-blue-400 tabular-nums mt-0.5">
              {formatINR(debt.outstandingPaise)}
            </div>
          </div>
        </div>

        {/* Repayment Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500 dark:text-[#A3A3A3]">Repayment Progress</span>
            <span className="font-semibold text-slate-900 dark:text-white tabular-nums">
              {pct}% repaid
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-[#1f1f1f] overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                debt.status === 'settled'
                  ? 'bg-emerald-600'
                  : debt.status === 'overdue'
                  ? 'bg-red-500'
                  : 'bg-blue-600'
              }`}
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        {/* Metadata info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-600 dark:text-[#A3A3A3]">
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-[#141414] border border-slate-200/60 dark:border-[#262626]">
            <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
            <div>
              <span className="block text-[10px] text-slate-400 uppercase font-semibold">Lent Date</span>
              <span className="font-medium text-slate-800 dark:text-slate-200">{debt.lentDate}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-[#141414] border border-slate-200/60 dark:border-[#262626]">
            <Clock className="w-4 h-4 text-slate-400 shrink-0" />
            <div>
              <span className="block text-[10px] text-slate-400 uppercase font-semibold">Expected Repayment</span>
              <span
                className={`font-medium ${
                  debt.status === 'overdue'
                    ? 'text-red-600 dark:text-red-400 font-semibold'
                    : 'text-slate-800 dark:text-slate-200'
                }`}
              >
                {debt.expectedRepaymentDate || 'No due date set'}
              </span>
            </div>
          </div>
        </div>

        {/* Notes if present */}
        {debt.description && (
          <div className="p-3 bg-slate-50 dark:bg-[#141414] rounded-xl border border-slate-200/60 dark:border-[#262626] text-xs">
            <span className="block text-[10px] text-slate-400 uppercase font-semibold mb-1">
              Notes
            </span>
            <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{debt.description}</p>
          </div>
        )}

        {/* Repayment History Section */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-[#A3A3A3]">
              Repayment History ({debt.repayments?.length || 0})
            </h4>

            {debt.outstandingPaise > 0 && (
              <button
                onClick={() => {
                  onRecordRepayment(debt);
                  onClose();
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors duration-150 active:scale-95"
              >
                <ArrowDownLeft className="w-3.5 h-3.5" />
                Record Repayment
              </button>
            )}
          </div>

          {debt.repayments && debt.repayments.length > 0 ? (
            <div className="divide-y divide-slate-100 dark:divide-[#262626] border border-slate-200/80 dark:border-[#262626] rounded-xl overflow-hidden max-h-56 overflow-y-auto">
              {debt.repayments.map((rep) => (
                <div
                  key={rep.id}
                  className="flex items-center justify-between p-3 bg-white dark:bg-[#0A0A0A] hover:bg-slate-50 dark:hover:bg-[#141414] transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                      <ArrowDownLeft className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white tabular-nums">
                        +{formatINR(rep.amountPaise)}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {rep.repaymentDate}
                        {(rep.note || rep.notes) && ` • ${rep.note || rep.notes}`}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeleteRepaymentClick(rep.id, rep.amountPaise)}
                    className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                    title="Delete this repayment"
                    aria-label="Delete this repayment"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 rounded-xl border border-dashed border-slate-200 dark:border-[#262626] text-center text-xs text-slate-400">
              No repayments recorded yet.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-slate-100 dark:border-[#262626] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-[#A3A3A3] hover:bg-slate-100 dark:hover:bg-[#141414] rounded-xl transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
