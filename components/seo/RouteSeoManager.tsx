'use client';

import { useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { AppScreen } from '@/types';
import { SITE_CONFIG } from '@/lib/seo/config';

const SCREEN_TITLES: Record<AppScreen, string> = {
  welcome: SITE_CONFIG.title,
  login: 'Sign In — Secure Access | Expense Tracker',
  signup: 'Create Account — Get Started | Expense Tracker',
  'forgot-password': 'Reset Password | Expense Tracker',
  'reset-password': 'Set New Password | Expense Tracker',
  'magic-link': 'Sign In with Magic Link | Expense Tracker',
  'check-inbox': 'Check Your Email | Expense Tracker',
  dashboard: 'Financial Dashboard | Expense Tracker',
  money: 'Money Overview & Analytics | Expense Tracker',
  transactions: 'Transaction Ledger | Expense Tracker',
  categories: 'Expense & Income Categories | Expense Tracker',
  budget: 'Budget Thresholds | Expense Tracker',
  savings: 'Savings Goals & Milestones | Expense Tracker',
  debt: 'Debt & Money Lent | Expense Tracker',
  reports: 'Financial Statement Reports | Expense Tracker',
  profile: 'Profile & Account Settings | Expense Tracker',
  settings: 'Preferences & Widgets | Expense Tracker',
  'recently-deleted': 'Recently Deleted Trash Bin | Expense Tracker',
};

const PRIVATE_SCREENS: Set<AppScreen> = new Set([
  'dashboard',
  'money',
  'transactions',
  'categories',
  'budget',
  'savings',
  'debt',
  'reports',
  'profile',
  'settings',
  'recently-deleted',
]);

/**
 * RouteSeoManager: Synchronizes document title and enforces strict noindex
 * directives for private authenticated application screens.
 */
export function RouteSeoManager() {
  const { currentScreen } = useApp();

  useEffect(() => {
    // 1. Update document title safely without leaking sensitive numbers
    const title = SCREEN_TITLES[currentScreen] || SITE_CONFIG.title;
    document.title = title;

    // 2. Manage client-side robots meta tag for search engine crawlers executing JS
    const isPrivate = PRIVATE_SCREENS.has(currentScreen);
    let robotsMeta = document.querySelector('meta[name="robots"]') as HTMLMetaElement | null;

    if (isPrivate) {
      if (!robotsMeta) {
        robotsMeta = document.createElement('meta');
        robotsMeta.name = 'robots';
        document.head.appendChild(robotsMeta);
      }
      robotsMeta.content = 'noindex, nofollow, noarchive';
    } else if (robotsMeta) {
      robotsMeta.content = 'index, follow, max-image-preview:large';
    }
  }, [currentScreen]);

  return null;
}
