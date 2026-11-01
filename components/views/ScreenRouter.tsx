'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { motion, AnimatePresence } from 'motion/react';
import { DashboardView } from '@/components/views/DashboardView';
import { MoneyDashboardView } from '@/components/views/MoneyDashboardView';
import { TransactionsView } from '@/components/views/TransactionsView';
import { CategoriesView } from '@/components/views/CategoriesView';
import { BudgetView } from '@/components/views/BudgetView';
import { SavingsView } from '@/components/views/SavingsView';
import { ReportsView } from '@/components/views/ReportsView';
import { ProfileView } from '@/components/views/ProfileView';
import { SettingsView } from '@/components/views/SettingsView';
import { RecentlyDeletedView } from '@/components/views/RecentlyDeletedView';

export function ScreenRouter() {
  const { currentScreen } = useApp();

  const renderScreen = () => {
    switch (currentScreen) {
      case 'dashboard':
        return <DashboardView />;
      case 'money':
        return <MoneyDashboardView />;
      case 'transactions':
        return <TransactionsView />;
      case 'categories':
        return <CategoriesView />;
      case 'budget':
        return <BudgetView />;
      case 'savings':
        return <SavingsView />;
      case 'reports':
        return <ReportsView />;
      case 'profile':
        return <ProfileView />;
      case 'settings':
        return <SettingsView />;
      case 'recently-deleted':
        return <RecentlyDeletedView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={currentScreen}
        initial={{ opacity: 0, y: 3 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15, ease: 'easeOut' }}
      >
        {renderScreen()}
      </motion.div>
    </AnimatePresence>
  );
}
