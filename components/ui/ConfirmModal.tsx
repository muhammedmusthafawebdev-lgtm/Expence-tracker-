'use client';

import React, { useEffect } from 'react';
import { AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  itemCount?: number;
  variant?: 'danger' | 'warning' | 'info';
  isPending?: boolean;
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  itemCount,
  variant = 'danger',
  isPending = false,
}: ConfirmModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const icons = {
    danger: <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />,
    warning: <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400" />,
    info: <Info className="w-5 h-5 text-blue-600 dark:text-blue-400" />,
  };

  const confirmColors = {
    danger: 'bg-red-600 hover:bg-red-700 text-white',
    warning: 'bg-amber-600 hover:bg-amber-700 text-white',
    info: 'bg-blue-600 hover:bg-blue-700 text-white',
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
    >
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative w-full max-w-md bg-white dark:bg-[#0A0A0A] rounded-2xl border border-slate-200 dark:border-[#262626] shadow-2xl p-6 overflow-hidden animate-in zoom-in-95 duration-150">
        <div className="flex items-start gap-3.5 mb-3">
          <div
            className={`p-2 rounded-xl shrink-0 ${
              variant === 'danger'
                ? 'bg-red-50 dark:bg-red-950/50'
                : variant === 'warning'
                ? 'bg-amber-50 dark:bg-amber-950/50'
                : 'bg-blue-50 dark:bg-blue-950/50'
            }`}
          >
            {icons[variant]}
          </div>

          <div className="flex-1 pr-4">
            <div className="flex items-center gap-2">
              <h3
                id="confirm-modal-title"
                className="text-base font-semibold text-slate-900 dark:text-white leading-tight"
              >
                {title}
              </h3>
              {typeof itemCount === 'number' && (
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-[#141414] text-slate-700 dark:text-[#A3A3A3] border border-transparent dark:border-[#262626]">
                  {itemCount} {itemCount === 1 ? 'item' : 'items'}
                </span>
              )}
            </div>

            <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-[#A3A3A3]">
              {message}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#141414] transition-colors duration-150"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-6 flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-[#262626]">
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-[#A3A3A3] hover:text-slate-900 dark:hover:text-white transition-colors duration-150 disabled:opacity-50"
          >
            {cancelLabel}
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isPending}
            className={`px-4 py-2 text-xs font-semibold rounded-xl transition-colors duration-150 active:scale-95 disabled:opacity-50 ${confirmColors[variant]}`}
          >
            {isPending ? 'Processing...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
