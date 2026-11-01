'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { BrandLogo } from '@/components/ui/BrandLogo';
import {
  LayoutDashboard,
  ArrowLeftRight,
  PieChart,
  PiggyBank,
  FileBarChart,
  Settings,
  User,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { AppScreen } from '@/types';

export function Sidebar() {
  const {
    currentScreen,
    setCurrentScreen,
    isSidebarCollapsed,
    toggleSidebar,
    deletedTransactions,
    userProfile,
  } = useApp();

  const deletedCount = deletedTransactions.length;

  const primaryNavItems: {
    id: AppScreen;
    label: string;
    icon: React.ElementType;
  }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'transactions', label: 'Transactions', icon: ArrowLeftRight },
    { id: 'budget', label: 'Budgets', icon: PieChart },
    { id: 'savings', label: 'Savings', icon: PiggyBank },
    { id: 'reports', label: 'Reports', icon: FileBarChart },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside
      className={`hidden md:flex flex-col h-screen border-r border-slate-200 dark:border-[#262626] bg-white dark:bg-[#000000] transition-all duration-250 z-30 select-none ${
        isSidebarCollapsed ? 'w-[72px]' : 'w-[260px]'
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-100 dark:border-[#262626] shrink-0">
        <BrandLogo
          collapsed={isSidebarCollapsed}
          onClick={() => setCurrentScreen('dashboard')}
        />

        <button
          onClick={toggleSidebar}
          aria-label={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#111111] transition-colors"
        >
          {isSidebarCollapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Main Nav Items */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        <div>
          {!isSidebarCollapsed && (
            <div className="px-3 mb-2 text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-[#A3A3A3]">
              Finance
            </div>
          )}
          <nav className="space-y-1">
            {primaryNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentScreen === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentScreen(item.id)}
                  title={isSidebarCollapsed ? item.label : undefined}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-slate-900 text-white dark:bg-white dark:text-black font-semibold shadow-xs'
                      : 'text-slate-600 dark:text-[#A3A3A3] hover:bg-slate-100 dark:hover:bg-[#111111] hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      isActive
                        ? 'text-white dark:text-black'
                        : 'text-slate-500 dark:text-[#A3A3A3]'
                    }`}
                  />
                  {!isSidebarCollapsed && <span className="truncate">{item.label}</span>}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Utility / Trash Item */}
        <div>
          {!isSidebarCollapsed && (
            <div className="px-3 mb-2 text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-[#A3A3A3]">
              Trash &amp; Storage
            </div>
          )}
          <nav className="space-y-1">
            <button
              onClick={() => setCurrentScreen('recently-deleted')}
              title={isSidebarCollapsed ? 'Recently Deleted' : undefined}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                currentScreen === 'recently-deleted'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-black font-semibold'
                  : 'text-slate-500 dark:text-[#A3A3A3] hover:bg-slate-100 dark:hover:bg-[#111111] hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Trash2 className="w-4 h-4 shrink-0" />
              {!isSidebarCollapsed && <span className="truncate">Recently Deleted</span>}
              {!isSidebarCollapsed && deletedCount > 0 ? (
                <span className="ml-auto text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-slate-200 dark:bg-[#111111] text-slate-600 dark:text-[#A3A3A3]">
                  {deletedCount}
                </span>
              ) : null}
            </button>
          </nav>
        </div>
      </div>

      {/* Profile Section Footer */}
      <div className="p-3 border-t border-slate-100 dark:border-[#262626]">
        <button
          onClick={() => setCurrentScreen('profile')}
          title={isSidebarCollapsed ? 'Profile' : undefined}
          className={`w-full flex items-center gap-2.5 p-2 rounded-xl transition-colors ${
            currentScreen === 'profile'
              ? 'bg-slate-100 dark:bg-[#111111] ring-1 ring-slate-200 dark:ring-[#262626]'
              : 'hover:bg-slate-50 dark:hover:bg-[#111111]'
          }`}
        >
          <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 flex items-center justify-center font-bold text-xs shrink-0">
            {userProfile.name ? userProfile.name.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
          </div>
          {!isSidebarCollapsed && (
            <div className="text-left overflow-hidden">
              <div className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                {userProfile.name || 'Student Account'}
              </div>
              <div className="text-[11px] text-slate-500 dark:text-[#A3A3A3] truncate">
                {userProfile.studentType || 'College Undergraduate'}
              </div>
            </div>
          )}
        </button>
      </div>
    </aside>
  );
}
