'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { Info, AlertTriangle, CheckCircle2, X } from 'lucide-react';

export function BannerNoticeModal() {
  const { bannerNotice, clearBannerNotice } = useApp();

  if (!bannerNotice) return null;

  const icons = {
    info: <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />,
    notice: <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />,
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="banner-notice-title"
    >
      <div className="relative w-full max-w-md p-6 bg-white dark:bg-[#111111] rounded-2xl border border-slate-200 dark:border-[#262626] shadow-xl overflow-hidden">
        {/* Subtle top indicator bar */}
        <div
          className={`absolute top-0 left-0 right-0 h-1 ${
            bannerNotice.type === 'warning'
              ? 'bg-amber-500'
              : bannerNotice.type === 'notice'
              ? 'bg-emerald-500'
              : 'bg-blue-600'
          }`}
        />

        <div className="flex items-start gap-3.5 mb-3">
          <div
            className={`p-2 rounded-xl shrink-0 ${
              bannerNotice.type === 'warning'
                ? 'bg-amber-50 dark:bg-amber-950/50'
                : bannerNotice.type === 'notice'
                ? 'bg-emerald-50 dark:bg-emerald-950/50'
                : 'bg-blue-50 dark:bg-blue-950/50'
            }`}
          >
            {icons[bannerNotice.type]}
          </div>

          <div className="flex-1 pr-4">
            <h3
              id="banner-notice-title"
              className="text-base font-semibold text-slate-900 dark:text-white leading-tight"
            >
              {bannerNotice.title}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-[#A3A3A3]">
              {bannerNotice.message}
            </p>
          </div>

          <button
            onClick={clearBannerNotice}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#0A0A0A] transition-colors"
            aria-label="Close message"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-5 flex items-center justify-end gap-2.5">
          <button
            onClick={clearBannerNotice}
            className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 dark:bg-white dark:text-black rounded-xl hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors active:scale-95"
          >
            Acknowledge
          </button>
        </div>
      </div>
    </div>
  );
}
