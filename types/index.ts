export type TransactionType = 'income' | 'expense';

export type PaymentMethod = 'UPI' | 'Cash' | 'Net Banking' | 'Debit Card' | 'Other';

export interface Transaction {
  id: string;
  type: TransactionType;
  amountPaise: number; // Stored as integer paise (1 INR = 100 paise)
  categoryId: string;
  date: string; // ISO Date YYYY-MM-DD
  paymentMethod?: PaymentMethod;
  description?: string;
  createdAt: string;
  deletedAt?: string | null;
}

export type StudentAudience = 'college' | 'school' | 'hostel' | 'exam' | 'custom';

export interface Category {
  id: string;
  name: string;
  type: TransactionType | 'both';
  icon: string;
  color: string;
  studentGroup: StudentAudience;
  isCustom?: boolean;
}

// Strictly simplified to Monthly and Yearly per requirements
export type BudgetPeriod = 'monthly' | 'yearly';

export interface Budget {
  id: string;
  categoryId: string;
  limitPaise: number;
  period: BudgetPeriod;
  createdAt: string;
}

export interface SavingsAllocation {
  id: string;
  amountPaise: number;
  date: string;
  type: 'deposit' | 'withdrawal';
  note?: string;
}

export interface SavingsGoal {
  id: string;
  title: string;
  targetAmountPaise: number;
  currentAmountPaise: number; // Sum of dedicated allocations, not ordinary expenses
  targetDate: string;
  notes?: string;
  allocations: SavingsAllocation[];
  createdAt: string;
}

export interface UserProfile {
  name: string;
  email: string;
  studentType: string;
  institution: string;
  rollNumber: string;
  monthlyAllowancePaise: number;
  currency: 'INR';
}

export type DashboardWidgetId =
  | 'balanceSummary'
  | 'incomeExpenseChart'
  | 'categorySpendingChart'
  | 'budgetOverview'
  | 'savingsProgress'
  | 'recentTransactions';

export interface DashboardWidgetItem {
  id: DashboardWidgetId;
  label: string;
  desc: string;
  visible: boolean;
  pinned: boolean;
}

export interface DashboardWidgetConfig {
  balanceSummary: boolean;
  incomeExpenseChart: boolean;
  categorySpendingChart: boolean;
  budgetOverview: boolean;
  savingsProgress: boolean;
  recentTransactions: boolean;
}

// Retained views: dashboard, transactions, budget, savings, reports, profile, settings, recently-deleted
export type AppScreen =
  | 'dashboard'
  | 'transactions'
  | 'budget'
  | 'savings'
  | 'reports'
  | 'profile'
  | 'settings'
  | 'recently-deleted';

export type ThemeMode = 'light' | 'dark' | 'system';

export interface FinancialSummary {
  totalIncomePaise: number;
  totalExpensesPaise: number;
  netBalancePaise: number;
  savingsAllocatedPaise: number;
  availableBalancePaise: number;
}
