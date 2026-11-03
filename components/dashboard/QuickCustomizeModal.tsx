'use client';

import React, { useEffect, useCallback } from 'react';
import { useApp } from '@/context/AppContext';
import {
  X,
  ChevronUp,
  ChevronDown,
  Pin,
  RotateCcw,
} from 'lucide-react';

export function QuickCustomizeModal() {
  const {
    isCustomizeModalOpen,
    setIsCustomizeModalOpen,
    widgets,
    moveWidget,
    toggleWidgetPin,
    toggleWidgetVisible,
    resetWidgetLayout,
  } = useApp();

  const handleClose = useCallback(() => {
    setIsCustomizeModalOpen(false);
  }, [setIsCustomizeModalOpen]);

  // Escape key handler
  useEffect(() => {
    if (!isCustomizeModalOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCustomizeModalOpen, handleClose]);

  if (!isCustomizeModalOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
      aria-labelledby="customize-dashboard-title"
    >
      {/* Backdrop click to dismiss */}
      <div className="absolute inset-0" onClick={handleClose} />

      <div className="relative w-full max-w-lg bg-white dark:bg-[#0A0A0A] rounded-2xl border border-slate-200/80 dark:border-[#262626] shadow-2xl overflow-hidden flex flex-col max-h-[min(640px,88dvh)] z-10 animate-in zoom-in-95 duration-150">
        {/* Header - Clean, minimal without harsh dividing lines */}
        <div className="flex items-start justify-between px-6 pt-5 pb-2 shrink-0">
          <div>
            <h2
              id="customize-dashboard-title"
              className="text-base font-semibold text-slate-900 dark:text-white tracking-tight"
            >
              Customize Dashboard
            </h2>
            <p className="text-xs text-slate-500 dark:text-[#A3A3A3] mt-0.5">
              Reorder cards, pin to top, or toggle visibility
            </p>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 -mr-1.5 -mt-0.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#141414] transition-colors duration-150"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable List - Single clean list with NO borders between rows and NO nested boxes */}
        <div className="flex-1 min-h-0 overflow-y-auto px-4 py-2 space-y-1 overscroll-contain">
          {widgets.map((widget, index) => {
            const isFirst = index === 0;
            const isLast = index === widgets.length - 1;

            return (
              <div
                key={widget.id}
                className={`flex items-center justify-between gap-3 px-3 py-2 rounded-xl transition-colors duration-150 ${
                  widget.visible
                    ? 'hover:bg-slate-50 dark:hover:bg-[#141414]'
                    : 'opacity-40 hover:opacity-75 hover:bg-slate-50 dark:hover:bg-[#141414]'
                }`}
              >
                {/* Left: Reorder arrows & Widget Name */}
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  {/* Up / Down Reorder Arrows (Min 44x44px touch target) */}
                  <div className="flex items-center shrink-0">
                    <button
                      type="button"
                      disabled={isFirst}
                      onClick={() => moveWidget(widget.id, 'up')}
                      className="w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#262626] disabled:opacity-20 disabled:hover:bg-transparent transition-colors duration-150 active:scale-95"
                      title="Move up"
                      aria-label={`Move ${widget.label} up`}
                    >
                      <ChevronUp className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      disabled={isLast}
                      onClick={() => moveWidget(widget.id, 'down')}
                      className="w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#262626] disabled:opacity-20 disabled:hover:bg-transparent transition-colors duration-150 active:scale-95"
                      title="Move down"
                      aria-label={`Move ${widget.label} down`}
                    >
                      <ChevronDown className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Widget Title - Primary text, never truncated */}
                  <div className="min-w-0 flex-1 pl-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs font-semibold text-slate-900 dark:text-white leading-normal break-words">
                        {widget.label}
                      </span>
                      {widget.pinned && (
                        <span className="shrink-0 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400">
                          PINNED
                        </span>
                      )}
                      {['billsRecurring', 'financialHealth', 'netWorth', 'debtEmi', 'reportsSummary'].includes(widget.id) && (
                        <span className="shrink-0 px-1.5 py-0.5 rounded text-[9px] font-medium bg-slate-100 dark:bg-[#1a1a1a] text-slate-500 dark:text-[#888888]">
                          Optional
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Pin Toggle & Visibility Switch (Min 44x44px touch targets) */}
                <div className="flex items-center gap-1 shrink-0">
                  {/* Pin button */}
                  <button
                    type="button"
                    onClick={() => toggleWidgetPin(widget.id)}
                    className={`w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl transition-colors duration-150 active:scale-95 ${
                      widget.pinned
                        ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60'
                        : 'text-slate-300 dark:text-[#525252] hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#1e1e1e]'
                    }`}
                    title={widget.pinned ? 'Pinned to top (Click to unpin)' : 'Pin to top'}
                    aria-label={`${widget.pinned ? 'Unpin' : 'Pin'} ${widget.label}`}
                  >
                    <Pin className={`w-4 h-4 ${widget.pinned ? 'fill-current' : ''}`} />
                  </button>

                  {/* iOS-style Visibility Switch */}
                  <button
                    type="button"
                    role="switch"
                    aria-checked={widget.visible}
                    onClick={() => toggleWidgetVisible(widget.id)}
                    className="w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center cursor-pointer rounded-xl hover:bg-slate-50 dark:hover:bg-[#141414] transition-colors"
                    aria-label={`Toggle visibility of ${widget.label}`}
                  >
                    <span
                      className={`relative inline-flex h-5 w-9 shrink-0 rounded-full border-2 border-transparent transition-colors duration-150 ease-out ${
                        widget.visible ? 'bg-blue-600' : 'bg-slate-200 dark:bg-[#262626]'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-xs ring-0 transition-transform duration-150 ease-out ${
                          widget.visible ? 'translate-x-4' : 'translate-x-0'
                        }`}
                      />
                    </span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer - Clean, minimal without harsh dividing lines */}
        <div className="flex items-center justify-between px-6 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] shrink-0">
          <button
            type="button"
            onClick={resetWidgetLayout}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-900 dark:text-[#A3A3A3] dark:hover:text-white transition-colors duration-150 py-1.5 px-2 rounded-lg hover:bg-slate-100 dark:hover:bg-[#141414]"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset to Default
          </button>
          <button
            type="button"
            onClick={handleClose}
            className="inline-flex items-center justify-center px-5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-black dark:hover:bg-slate-200 rounded-xl transition-all duration-150 shadow-xs active:scale-[0.98]"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
