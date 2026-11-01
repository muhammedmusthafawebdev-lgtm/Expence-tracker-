'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  actionLabel?: string;
  onAction?: () => void;
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  compact?: boolean;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  actionLabel,
  onAction,
  secondaryAction,
  compact = false,
}: EmptyStateProps) {
  const primaryAction = action || (actionLabel && onAction ? { label: actionLabel, onClick: onAction } : undefined);

  return (
    <div
      className={`bg-white dark:bg-[#0A0A0A] rounded-2xl border border-slate-200/80 dark:border-[#262626] shadow-xs flex flex-col items-center justify-center text-center p-6 transition-all ${
        compact ? 'py-10' : 'py-14 md:py-16'
      }`}
    >
      <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-3 shrink-0 shadow-xs">
        <Icon className="w-6 h-6 stroke-[1.8]" />
      </div>

      <h3 className="text-base font-semibold text-slate-900 dark:text-white tracking-tight">
        {title}
      </h3>

      <p className="text-xs text-slate-500 dark:text-[#A3A3A3] max-w-sm mt-1.5 leading-relaxed">
        {description}
      </p>

      {(primaryAction || secondaryAction) && (
        <div className="mt-5 flex flex-wrap items-center justify-center gap-2.5">
          {secondaryAction && (
            <button
              onClick={secondaryAction.onClick}
              className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-[#A3A3A3] bg-slate-100 dark:bg-[#111111] hover:bg-slate-200 dark:hover:bg-[#262626] rounded-xl transition-colors"
            >
              {secondaryAction.label}
            </button>
          )}

          {primaryAction && (
            <button
              onClick={primaryAction.onClick}
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors shadow-xs active:scale-95"
            >
              {primaryAction.label}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
