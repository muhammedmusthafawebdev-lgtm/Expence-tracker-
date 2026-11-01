'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import {
  LayoutDashboard,
  CircleDollarSign,
  ArrowLeftRight,
  PieChart,
  PiggyBank,
  Menu,
  X,
  FileBarChart,
  Settings,
  User,
  Trash2,
  Tag,
} from 'lucide-react';
import { AppScreen } from '@/types';

export function MobileNav() {
  const { currentScreen, setCurrentScreen, deletedTransactions } = useApp();
  const [isMoreOpen, setIsMoreOpen] = useState(false);

  const deletedCount = deletedTransactions.length;

  const primaryItems: { id: AppScreen; label: string; icon: React.ElementType }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'transactions', label: 'Transactions', icon: ArrowLeftRight },
    { id: 'budget', label: 'Budgets', icon: PieChart },
    { id: 'savings', label: 'Savings', icon: PiggyBank },
  ];

  const moreItems: {
    id: AppScreen;
    label: string;
    icon: React.ElementType;
    badge?: number;
    desc: string;
  }[] = [
    { id: 'categories', label: 'Categories', icon: Tag, desc: 'Manage expense & income categories' },
    {
      id: 'money',
      label: 'Money Dashboard',
      icon: CircleDollarSign,
      desc: 'Overview & animated circular spending chart',
    },
    { id: 'reports', label: 'Financial Reports', icon: FileBarChart, desc: 'Printable financial statements' },
    { id: 'profile', label: 'Student Profile', icon: User, desc: 'College info & allowance' },
    { id: 'settings', label: 'Settings', icon: Settings, desc: 'Theme, currency & widgets' },
    {
      id: 'recently-deleted',
      label: 'Recently Deleted',
      icon: Trash2,
      badge: deletedCount,
      desc: '30-day recovery trash bin',
    },
  ];

  const handleSelectScreen = (screen: AppScreen) => {
    setCurrentScreen(screen);
    setIsMoreOpen(false);
  };

  return (
    <>
      {/* Mobile Bottom Bar (Sticky at bottom, capped height) */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#000000]/95 backdrop-blur-md border-t border-slate-200 dark:border-[#262626] px-2 py-1.5 flex items-center justify-around"
        aria-label="Mobile Navigation"
      >
        {primaryItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentScreen === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleSelectScreen(item.id)}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-colors duration-150 ${
                isActive
                  ? 'text-blue-600 dark:text-blue-400 font-semibold'
                  : 'text-slate-500 dark:text-[#A3A3A3] hover:text-slate-800 dark:hover:text-white'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs mt-0.5 tracking-tight">{item.label}</span>
            </button>
          );
        })}

        {/* More Button */}
        <button
          onClick={() => setIsMoreOpen(true)}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-colors duration-150 relative ${
            isMoreOpen || moreItems.some((m) => m.id === currentScreen)
              ? 'text-blue-600 dark:text-blue-400 font-semibold'
              : 'text-slate-500 dark:text-[#A3A3A3]'
          }`}
        >
          <Menu className="w-5 h-5" />
          <span className="text-xs mt-0.5 tracking-tight">More</span>
        </button>
      </nav>

      {/* More Drawer Sheet */}
      {isMoreOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex flex-col justify-end md:hidden animate-in fade-in"
          role="dialog"
          aria-modal="true"
        >
          <div className="absolute inset-0" onClick={() => setIsMoreOpen(false)} />

          <div className="relative bg-white dark:bg-[#0A0A0A] rounded-t-3xl border-t border-slate-200 dark:border-[#262626] p-6 max-h-[85vh] overflow-y-auto animate-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-[#262626]">
              <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                More Features
              </h3>
              <button
                onClick={() => setIsMoreOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 divide-y divide-slate-100 dark:divide-[#262626] mt-2">
              {moreItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentScreen === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelectScreen(item.id)}
                    className={`flex items-center justify-between py-3.5 text-left transition-colors duration-150 ${
                      isActive ? 'text-blue-600 dark:text-blue-400 font-medium' : 'text-slate-700 dark:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-slate-100 dark:bg-[#141414] text-slate-600 dark:text-[#A3A3A3] border border-transparent dark:border-[#262626]">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-sm font-medium">{item.label}</div>
                        <div className="text-xs text-slate-400 dark:text-[#A3A3A3]">{item.desc}</div>
                      </div>
                    </div>

                    {item.badge ? (
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300">
                        {item.badge}
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
