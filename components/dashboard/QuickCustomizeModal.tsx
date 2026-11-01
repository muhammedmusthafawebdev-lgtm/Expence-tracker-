'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import {
  X,
  SlidersHorizontal,
  Check,
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

  if (!isCustomizeModalOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="customize-dashboard-title"
    >
      <div className="relative w-full max-w-xl bg-white dark:bg-[#111111] rounded-2xl border border-slate-200 dark:border-[#262626] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-[#262626]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
              <SlidersHorizontal className="w-4 h-4" />
            </div>
            <div>
              <h2
                id="customize-dashboard-title"
                className="text-base font-semibold text-slate-900 dark:text-white leading-tight"
              >
                Customize Dashboard
              </h2>
              <p className="text-xs text-slate-500 dark:text-[#A3A3A3] mt-0.5">
                Reorder, pin, or toggle widget visibility
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsCustomizeModalOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#0A0A0A] transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Legend / Tip */}
        <div className="px-6 py-2.5 bg-slate-50 dark:bg-[#0A0A0A] border-b border-slate-100 dark:border-[#262626] text-[11px] text-slate-500 dark:text-[#A3A3A3] flex items-center justify-between">
          <span>Pinned widgets appear at the top. Use arrows to change order.</span>
          <span className="font-medium text-blue-600 dark:text-blue-400">
            {widgets.filter((w) => w.visible).length} of {widgets.length} visible
          </span>
        </div>

        {/* Widget list with reordering, pinning, and switch controls */}
        <div className="p-6 overflow-y-auto space-y-3 divide-y divide-slate-100 dark:divide-[#262626]">
          {widgets.map((widget, index) => {
            const isFirst = index === 0;
            const isLast = index === widgets.length - 1;

            return (
              <div
                key={widget.id}
                className="flex items-center justify-between gap-3 pt-3 first:pt-0"
              >
                {/* Left: Reorder buttons & Info */}
                <div className="flex items-center gap-2.5 flex-1 min-w-0">
                  {/* Up / Down Reorder buttons */}
                  <div className="flex flex-col gap-0.5 shrink-0">
                    <button
                      type="button"
                      disabled={isFirst}
                      onClick={() => moveWidget(widget.id, 'up')}
                      className="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#262626] disabled:opacity-20 disabled:hover:bg-transparent transition-colors"
                      title="Move up"
                      aria-label={`Move ${widget.label} up`}
                    >
                      <ChevronUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={isLast}
                      onClick={() => moveWidget(widget.id, 'down')}
                      className="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#262626] disabled:opacity-20 disabled:hover:bg-transparent transition-colors"
                      title="Move down"
                      aria-label={`Move ${widget.label} down`}
                    >
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Widget Label & Description */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                        {widget.label}
                      </span>
                      {widget.pinned && (
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 border border-blue-200/50 dark:border-blue-900/50">
                          PINNED
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-[#A3A3A3] truncate mt-0.5">
                      {widget.desc}
                    </p>
                  </div>
                </div>

                {/* Right: Pin Toggle & Show/Hide Switch */}
                <div className="flex items-center gap-3 shrink-0">
                  {/* Pin button */}
                  <button
                    type="button"
                    onClick={() => toggleWidgetPin(widget.id)}
                    className={`p-1.5 rounded-lg text-xs font-medium transition-colors ${
                      widget.pinned
                        ? 'text-blue-600 bg-blue-50 dark:bg-blue-950/60 dark:text-blue-400'
                        : 'text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#262626]'
                    }`}
                    title={widget.pinned ? 'Unpin widget' : 'Pin widget to top'}
                    aria-label={`Toggle pin for ${widget.label}`}
                  >
                    <Pin className={`w-3.5 h-3.5 ${widget.pinned ? 'fill-current' : ''}`} />
                  </button>

                  {/* Visibility Switch */}
                  <button
                    type="button"
                    role="switch"
                    aria-checked={widget.visible}
                    onClick={() => toggleWidgetVisible(widget.id)}
                    className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 ${
                      widget.visible ? 'bg-blue-600' : 'bg-slate-200 dark:bg-[#262626]'
                    }`}
                    aria-label={`Toggle visibility of ${widget.label}`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                        widget.visible ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-50 dark:bg-[#0A0A0A] border-t border-slate-100 dark:border-[#262626]">
          <button
            type="button"
            onClick={resetWidgetLayout}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-900 dark:text-[#A3A3A3] dark:hover:text-white transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset to Default
          </button>
          <button
            type="button"
            onClick={() => setIsCustomizeModalOpen(false)}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 dark:bg-white dark:text-black dark:hover:bg-slate-200 rounded-xl transition-colors shadow-xs"
          >
            <Check className="w-3.5 h-3.5" />
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
