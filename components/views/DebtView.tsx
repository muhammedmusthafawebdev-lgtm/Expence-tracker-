'use client';

import React, { useState, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import {
  HandCoins,
  Plus,
  Search,
  SlidersHorizontal,
  Calendar,
  Phone,
  ArrowDownLeft,
  Info,
  Clock,
  CheckCircle2,
  AlertTriangle,
  MoreVertical,
  Edit2,
  Trash2,
  Eye,
} from 'lucide-react';
import { Debt, DebtStatus } from '@/types';
import { formatINR } from '@/lib/calculations/financial';
import { EmptyState } from '@/components/ui/EmptyState';
import { CreateDebtModal } from '@/components/debt/CreateDebtModal';
import { RecordRepaymentModal } from '@/components/debt/RecordRepaymentModal';
import { DebtDetailModal } from '@/components/debt/DebtDetailModal';

type SortOption = 'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc' | 'name-asc';

export function DebtView() {
  const {
    debts,
    debtSummary,
    submitDebt,
    updateDebt,
    deleteDebt,
    submitDebtRepayment,
    deleteDebtRepayment,
  } = useApp();

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingDebt, setEditingDebt] = useState<Debt | null>(null);
  const [repaymentDebt, setRepaymentDebt] = useState<Debt | null>(null);
  const [detailDebt, setDetailDebt] = useState<Debt | null>(null);

  // Search, filter, and sort state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | DebtStatus>('all');
  const [sortBy, setSortBy] = useState<SortOption>('date-desc');

  // Filtered & sorted debts list
  const filteredDebts = useMemo(() => {
    return debts
      .filter((debt) => {
        // Search filter (person name or phone or description)
        if (searchQuery.trim()) {
          const query = searchQuery.toLowerCase().trim();
          const matchName = debt.personName.toLowerCase().includes(query);
          const matchPhone = debt.phone?.toLowerCase().includes(query);
          const matchDesc = debt.description?.toLowerCase().includes(query);
          if (!matchName && !matchPhone && !matchDesc) return false;
        }

        // Status filter
        if (statusFilter !== 'all' && debt.status !== statusFilter) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'date-desc':
            return new Date(b.lentDate).getTime() - new Date(a.lentDate).getTime();
          case 'date-asc':
            return new Date(a.lentDate).getTime() - new Date(b.lentDate).getTime();
          case 'amount-desc':
            return b.outstandingPaise - a.outstandingPaise;
          case 'amount-asc':
            return a.outstandingPaise - b.outstandingPaise;
          case 'name-asc':
            return a.personName.localeCompare(b.personName);
          default:
            return 0;
        }
      });
  }, [debts, searchQuery, statusFilter, sortBy]);

  const handleCreateSubmit = async (data: {
    personName: string;
    principalAmountPaise: number;
    phone?: string;
    lentDate: string;
    expectedRepaymentDate?: string;
    description?: string;
  }) => {
    if (editingDebt) {
      await updateDebt(editingDebt.id, data);
      setEditingDebt(null);
    } else {
      await submitDebt(data);
    }
  };

  const handleRecordRepaymentSubmit = async (
    debtId: string,
    amountPaise: number,
    repaymentDate: string,
    notes?: string
  ) => {
    await submitDebtRepayment(debtId, amountPaise, repaymentDate, notes);
  };

  const handleDeleteDebt = async (debtId: string) => {
    await deleteDebt(debtId);
  };

  const getStatusBadge = (status: DebtStatus) => {
    switch (status) {
      case 'active':
        return {
          label: 'Active',
          style:
            'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border-blue-200/60 dark:border-blue-900/60',
          icon: Clock,
        };
      case 'partially_repaid':
        return {
          label: 'Partially Repaid',
          style:
            'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border-amber-200/60 dark:border-amber-900/60',
          icon: ArrowDownLeft,
        };
      case 'overdue':
        return {
          label: 'Overdue',
          style:
            'bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 border-red-200/60 dark:border-red-900/60',
          icon: AlertTriangle,
        };
      case 'settled':
        return {
          label: 'Settled',
          style:
            'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border-emerald-200/60 dark:border-emerald-900/60',
          icon: CheckCircle2,
        };
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            Debt &amp; Money Lent
          </h2>
          <p className="text-xs text-slate-500 dark:text-[#A3A3A3] mt-0.5">
            Track money lent to friends, colleagues, and family with repayment schedules
          </p>
        </div>

        <button
          onClick={() => {
            setEditingDebt(null);
            setIsCreateOpen(true);
          }}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 min-h-[40px] text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors duration-150 self-start sm:self-auto active:scale-95"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          Record Money Lent
        </button>
      </div>

      {/* Semantic Asset Principle Banner */}
      <div className="p-3.5 bg-blue-50/60 dark:bg-blue-950/30 rounded-xl border border-blue-200/60 dark:border-blue-900/40 flex items-start gap-3 text-xs text-blue-900 dark:text-blue-300">
        <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong>Asset Receivable Principle:</strong> Money you lend to others remains part of your personal wealth as an asset receivable. It is <strong>never counted as an operating expense</strong>, and repayments are returns of capital rather than income.
        </div>
      </div>

      {/* 5 Metrics Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        <div className="p-4 bg-white dark:bg-[#0A0A0A] rounded-2xl border border-slate-200/80 dark:border-[#262626]">
          <span className="text-[11px] font-medium text-slate-500 dark:text-[#A3A3A3]">Total Lent</span>
          <div className="mt-1 text-lg sm:text-2xl font-bold text-slate-900 dark:text-white tabular-nums">
            {formatINR(debtSummary.totalLentPaise)}
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-[#0A0A0A] rounded-2xl border border-slate-200/80 dark:border-[#262626]">
          <span className="text-[11px] font-medium text-slate-500 dark:text-[#A3A3A3]">Total Repaid</span>
          <div className="mt-1 text-lg sm:text-2xl font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
            {formatINR(debtSummary.totalRepaidPaise)}
          </div>
        </div>

        <div className="col-span-2 sm:col-span-1 p-4 bg-white dark:bg-[#0A0A0A] rounded-2xl border border-slate-200/80 dark:border-[#262626]">
          <span className="text-[11px] font-medium text-slate-500 dark:text-[#A3A3A3]">Total Outstanding</span>
          <div className="mt-1 text-lg sm:text-2xl font-bold text-blue-600 dark:text-blue-400 tabular-nums">
            {formatINR(debtSummary.totalOutstandingPaise)}
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-[#0A0A0A] rounded-2xl border border-slate-200/80 dark:border-[#262626]">
          <span className="text-[11px] font-medium text-slate-500 dark:text-[#A3A3A3]">Active Records</span>
          <div className="mt-1 text-lg sm:text-2xl font-bold text-slate-900 dark:text-white tabular-nums">
            {debtSummary.activeCount}
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-[#0A0A0A] rounded-2xl border border-slate-200/80 dark:border-[#262626]">
          <span className="text-[11px] font-medium text-slate-500 dark:text-[#A3A3A3]">Settled Records</span>
          <div className="mt-1 text-lg sm:text-2xl font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
            {debtSummary.settledCount}
          </div>
        </div>
      </div>

      {/* Filter, Search & Sort Toolbar */}
      <div className="p-3 bg-white dark:bg-[#0A0A0A] rounded-2xl border border-slate-200/80 dark:border-[#262626] space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by person name, phone, or notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 text-xs bg-slate-50 dark:bg-[#141414] border border-slate-200 dark:border-[#262626] rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2 shrink-0">
            <SlidersHorizontal className="w-4 h-4 text-slate-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="px-3 py-2 text-xs bg-slate-50 dark:bg-[#141414] border border-slate-200 dark:border-[#262626] rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600 cursor-pointer"
            >
              <option value="date-desc">Lent Date (Newest)</option>
              <option value="date-asc">Lent Date (Oldest)</option>
              <option value="amount-desc">Highest Outstanding</option>
              <option value="amount-asc">Lowest Outstanding</option>
              <option value="name-asc">Person Name (A-Z)</option>
            </select>
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 pt-1 text-xs">
          {(
            [
              { id: 'all', label: 'All Debts' },
              { id: 'active', label: 'Active' },
              { id: 'partially_repaid', label: 'Partially Repaid' },
              { id: 'overdue', label: 'Overdue' },
              { id: 'settled', label: 'Settled' },
            ] as const
          ).map((tab) => {
            const isActive = statusFilter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3 py-1.5 rounded-xl font-medium transition-colors whitespace-nowrap shrink-0 ${
                  isActive
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-black font-semibold'
                    : 'text-slate-600 dark:text-[#A3A3A3] hover:bg-slate-100 dark:hover:bg-[#141414]'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Debt Records List */}
      {filteredDebts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDebts.map((debt) => {
            const badge = getStatusBadge(debt.status);
            const BadgeIcon = badge.icon;
            const pct =
              debt.principalAmountPaise > 0
                ? Math.min(100, Math.round((debt.totalRepaidPaise / debt.principalAmountPaise) * 100))
                : 0;

            return (
              <div
                key={debt.id}
                className="p-5 bg-white dark:bg-[#0A0A0A] rounded-2xl border border-slate-200/80 dark:border-[#262626] flex flex-col justify-between space-y-4 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
              >
                <div>
                  {/* Top card bar: person & status */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                        {debt.personName}
                      </h3>
                      {debt.phone && (
                        <div className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-[#A3A3A3] mt-0.5">
                          <Phone className="w-3 h-3" />
                          <span>{debt.phone}</span>
                        </div>
                      )}
                    </div>

                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${badge.style}`}
                    >
                      <BadgeIcon className="w-3 h-3" />
                      {badge.label}
                    </span>
                  </div>

                  {/* Financial figures */}
                  <div className="grid grid-cols-3 gap-2 p-3 mt-3 bg-slate-50 dark:bg-[#141414] rounded-xl border border-slate-200/60 dark:border-[#262626]">
                    <div>
                      <span className="text-[10px] text-slate-500 dark:text-[#A3A3A3]">Principal</span>
                      <div className="text-xs font-bold text-slate-900 dark:text-white tabular-nums mt-0.5">
                        {formatINR(debt.principalAmountPaise)}
                      </div>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 dark:text-[#A3A3A3]">Repaid</span>
                      <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 tabular-nums mt-0.5">
                        {formatINR(debt.totalRepaidPaise)}
                      </div>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 dark:text-[#A3A3A3]">Outstanding</span>
                      <div className="text-xs font-bold text-blue-600 dark:text-blue-400 tabular-nums mt-0.5">
                        {formatINR(debt.outstandingPaise)}
                      </div>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="mt-3 space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-500 dark:text-[#A3A3A3]">Repaid</span>
                      <span className="font-semibold text-slate-900 dark:text-white tabular-nums">
                        {pct}%
                      </span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-[#1a1a1a] overflow-hidden">
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

                  {/* Dates & context */}
                  <div className="mt-3 space-y-1 text-xs text-slate-500 dark:text-[#A3A3A3]">
                    <div className="flex items-center gap-1.5 text-[11px]">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>Lent: {debt.lentDate}</span>
                    </div>
                    {debt.expectedRepaymentDate && (
                      <div
                        className={`flex items-center gap-1.5 text-[11px] ${
                          debt.status === 'overdue'
                            ? 'text-red-600 dark:text-red-400 font-semibold'
                            : ''
                        }`}
                      >
                        <Clock className="w-3.5 h-3.5" />
                        <span>Due: {debt.expectedRepaymentDate}</span>
                        {debt.status === 'overdue' && <span>(Overdue)</span>}
                      </div>
                    )}
                    {debt.description && (
                      <p className="text-[11px] text-slate-500 dark:text-[#A3A3A3] line-clamp-1 pt-0.5">
                        {debt.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Actions bottom row */}
                <div className="pt-3 border-t border-slate-100 dark:border-[#262626] flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    {debt.outstandingPaise > 0 && (
                      <button
                        onClick={() => setRepaymentDebt(debt)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-blue-600 dark:text-blue-400 text-xs font-semibold transition-colors duration-150 min-h-[36px]"
                      >
                        <ArrowDownLeft className="w-3.5 h-3.5" />
                        Repay
                      </button>
                    )}

                    <button
                      onClick={() => setDetailDebt(debt)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-[#141414] hover:bg-slate-200 dark:hover:bg-[#262626] text-slate-700 dark:text-[#A3A3A3] text-xs font-semibold transition-colors duration-150 min-h-[36px]"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Details
                    </button>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setEditingDebt(debt);
                        setIsCreateOpen(true);
                      }}
                      className="p-2 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#141414] transition-colors"
                      title="Edit Debt Record"
                      aria-label="Edit Debt Record"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Delete debt record for "${debt.personName}"?`)) {
                          handleDeleteDebt(debt.id);
                        }
                      }}
                      className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                      title="Delete Debt Record"
                      aria-label="Delete Debt Record"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={HandCoins}
          title={
            debts.length === 0
              ? 'No Debt Records Yet'
              : 'No Debt Records Match Your Filter'
          }
          description={
            debts.length === 0
              ? 'Keep track of money you lend to friends, peers, or roommates with full repayment tracking.'
              : 'Try clearing your search terms or selecting a different status filter.'
          }
          actionLabel={debts.length === 0 ? 'Record Money Lent' : undefined}
          onAction={
            debts.length === 0
              ? () => {
                  setEditingDebt(null);
                  setIsCreateOpen(true);
                }
              : undefined
          }
        />
      )}

      {/* Modal: Create or Edit Debt */}
      {isCreateOpen && (
        <CreateDebtModal
          isOpen={isCreateOpen}
          onClose={() => {
            setIsCreateOpen(false);
            setEditingDebt(null);
          }}
          onSubmit={handleCreateSubmit}
          initialDebt={editingDebt}
        />
      )}

      {/* Modal: Record Repayment */}
      {repaymentDebt && (
        <RecordRepaymentModal
          isOpen={Boolean(repaymentDebt)}
          debt={repaymentDebt}
          onClose={() => setRepaymentDebt(null)}
          onSubmit={handleRecordRepaymentSubmit}
        />
      )}

      {/* Modal: View Debt Details & Repayment History */}
      {detailDebt && (
        <DebtDetailModal
          isOpen={Boolean(detailDebt)}
          debt={debts.find((d) => d.id === detailDebt.id) || detailDebt}
          onClose={() => setDetailDebt(null)}
          onRecordRepayment={(d) => setRepaymentDebt(d)}
          onEdit={(d) => {
            setEditingDebt(d);
            setIsCreateOpen(true);
          }}
          onDelete={handleDeleteDebt}
          onDeleteRepayment={deleteDebtRepayment}
        />
      )}
    </div>
  );
}
