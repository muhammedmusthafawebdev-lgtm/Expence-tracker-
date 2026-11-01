'use client';

import React from 'react';
import { Wallet } from 'lucide-react';

interface BrandLogoProps {
  collapsed?: boolean;
  className?: string;
  onClick?: () => void;
}

export function BrandLogo({ collapsed = false, className = '', onClick }: BrandLogoProps) {
  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-2.5 cursor-pointer select-none transition-all ${className}`}
      role="banner"
    >
      <div className="w-9 h-9 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-black flex items-center justify-center shadow-xs shrink-0 transition-transform active:scale-95">
        <Wallet className="w-5 h-5 stroke-[2.2]" />
      </div>
      {!collapsed && (
        <div className="flex flex-col overflow-hidden">
          <span className="font-semibold text-[15px] tracking-tight text-slate-900 dark:text-white whitespace-nowrap">
            Expence Tracker
          </span>
          <span className="text-[11px] text-slate-500 dark:text-[#A3A3A3] whitespace-nowrap">
            Personal Finance &amp; Budget
          </span>
        </div>
      )}
    </div>
  );
}
