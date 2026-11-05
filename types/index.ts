export type TransactionType = 'income' | 'expense';

export type PaymentMethod = 'UPI' | 'Cash' | 'Net Banking' | 'Debit Card' | 'Credit Card' | 'Other';

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
  isRecurring?: boolean; // Explicitly user-designated recurring commitment
  debtType?: 'loan' | 'emi' | 'borrowed' | 'lent';
}

export type StudentAudience = 'college' | 'school' | 'hostel' | 'exam' | 'custom';

export interface Category {
  id: string;
  name: string;
  type: TransactionType | 'both';
  icon: string;
  color: string;
  studentGroup?: StudentAudience;
  isCustom?: boolean;
  groupName?: string;
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
  | 'overview'
  | 'moneyAnalytics'
  | 'cashFlow'
  | 'budget'
  | 'savings'
  | 'recentTransactions'
  | 'billsRecurring'
  | 'financialHealth'
  | 'netWorth'
  | 'debtEmi'
  | 'reportsSummary'
  // Legacy aliases for backwards compatibility with session storage
  | 'moneyDashboard'
  | 'balanceSummary'
  | 'incomeExpenseChart'
  | 'categorySpendingChart'
  | 'budgetOverview'
  | 'savingsProgress';

export interface DashboardWidgetItem {
  id: DashboardWidgetId;
  label: string;
  desc: string;
  visible: boolean;
  pinned: boolean;
}

export interface DashboardWidgetConfig {
  overview?: boolean;
  moneyAnalytics?: boolean;
  cashFlow?: boolean;
  budget?: boolean;
  savings?: boolean;
  recentTransactions?: boolean;
  billsRecurring?: boolean;
  financialHealth?: boolean;
  netWorth?: boolean;
  debtEmi?: boolean;
  reportsSummary?: boolean;
  [key: string]: boolean | undefined;
}

// Application screens including authenticated views and authentication flow screens
export type AppScreen =
  | 'welcome'
  | 'login'
  | 'signup'
  | 'forgot-password'
  | 'reset-password'
  | 'magic-link'
  | 'check-inbox'
  | 'dashboard'
  | 'money'
  | 'transactions'
  | 'categories'
  | 'budget'
  | 'savings'
  | 'debt'
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

export type DebtStatus = 'active' | 'partially_repaid' | 'overdue' | 'settled';

export interface DebtRepayment {
  id: string;
  debtId: string;
  amountPaise: number; // Stored as integer paise (BIGINT)
  repaymentDate: string; // YYYY-MM-DD
  note?: string;
  notes?: string; // Ergonomic alias
  createdAt: string;
}

export interface Debt {
  id: string;
  personName: string;
  phoneNumber?: string;
  phone?: string; // Ergonomic alias for UI components
  principalAmountPaise: number; // Stored as integer paise (BIGINT)
  lentDate: string; // YYYY-MM-DD
  expectedRepaymentDate?: string; // YYYY-MM-DD
  description?: string;
  status: DebtStatus;
  repayments: DebtRepayment[];
  totalRepaidPaise: number;
  outstandingBalancePaise: number;
  outstandingPaise: number; // Ergonomic alias
  createdAt: string;
  updatedAt: string;
}

export interface DebtSummary {
  totalLentPaise: number;
  totalRepaidPaise: number;
  totalOutstandingPaise: number;
  activeCount: number;
  settledCount: number;
}
