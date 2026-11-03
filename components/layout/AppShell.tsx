'use client';

import React from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { MobileNav } from '@/components/layout/MobileNav';
import { TransactionDrawer } from '@/components/transactions/TransactionDrawer';
import { QuickCustomizeModal } from '@/components/dashboard/QuickCustomizeModal';
import { BannerNoticeModal } from '@/components/ui/BannerNoticeModal';

import { useApp } from '@/context/AppContext';

const AUTH_SCREENS = new Set([
  'welcome',
  'login',
  'signup',
  'forgot-password',
  'reset-password',
  'magic-link',
  'check-inbox',
]);

export function AppShell({ children }: { children: React.ReactNode }) {
  const { currentScreen } = useApp();
  const isAuthScreen = AUTH_SCREENS.has(currentScreen);

  if (isAuthScreen) {
    return (
      <div className="min-h-screen flex flex-col bg-[#F9FAFB] dark:bg-[#000000] text-slate-900 dark:text-white font-sans selection:bg-blue-600 selection:text-white antialiased">
        <main className="flex-1 flex flex-col">{children}</main>
        <BannerNoticeModal />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-[#F9FAFB] dark:bg-[#000000] text-slate-900 dark:text-white font-sans selection:bg-blue-600 selection:text-white antialiased">
      {/* Desktop Collapsible Sidebar (260px expanded, 72px collapsed) */}
      <Sidebar />

      {/* Main Viewport Container */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden pb-16 md:pb-0">
        <Header />

        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileNav />

      {/* Global Slide-over Drawer for Add/Edit Transaction */}
      <TransactionDrawer />

      {/* Quick Dashboard Customize Modal */}
      <QuickCustomizeModal />

      {/* Honest Warning Notice Modal */}
      <BannerNoticeModal />
    </div>
  );
}
