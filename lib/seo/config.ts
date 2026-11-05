/**
 * Centralized SEO Configuration & Domain Resolver
 * Provides environment-aware canonical URLs, site metadata constants,
 * and structured data definitions for search engines.
 */

export const SITE_CONFIG = {
  name: 'Expense Tracker',
  shortName: 'ExpenceTracker',
  title: 'Expense Tracker — Personal Finance & Budget Management',
  titleTemplate: '%s | Expense Tracker',
  description:
    'A minimal, Apple-inspired personal finance application for tracking daily income, categorized expenses, monthly budgets, savings goals, and money lent with precision integer-paise financial integrity.',
  keywords: [
    'expense tracker',
    'personal finance tracker',
    'student expense tracker',
    'monthly budget planner',
    'money lent tracker',
    'debt management',
    'savings goal tracker',
    'cash flow management',
    'INR currency tracker',
    'financial clarity',
  ],
  author: 'Expense Tracker Team',
  creator: 'Expense Tracker',
  publisher: 'Expense Tracker',
  applicationCategory: 'FinanceApplication',
  operatingSystem: 'All',
  currency: 'INR',
  locale: 'en_IN',
  themeColorLight: '#FBFBFD',
  themeColorDark: '#000000',
};

/**
 * Resolves the canonical base URL of the deployment.
 * Prioritizes custom public site URL, runtime Cloud Run APP_URL,
 * or current window origin, with a safe fallback to the shared deployment URL.
 */
export function getSiteUrl(): string {
  const envUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.APP_URL;

  if (envUrl && !envUrl.includes('MY_APP_URL')) {
    return envUrl.replace(/\/$/, '');
  }

  if (typeof window !== 'undefined' && window.location.origin) {
    return window.location.origin.replace(/\/$/, '');
  }

  // Pre-configured AI Studio Cloud Run shared domain
  return 'https://ais-pre-vx74xw4fi4rd6dpk4c32wz-958078926013.asia-east1.run.app';
}
