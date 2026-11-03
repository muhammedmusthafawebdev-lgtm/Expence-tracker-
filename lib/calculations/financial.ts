import { Transaction, BudgetPeriod } from '@/types';

/**
 * Safe Financial Calculations Engine
 * Uses integer paise arithmetic (1 INR = 100 paise) to eliminate IEEE 754 floating-point errors.
 */

export function paiseToRupees(paise: number): number {
  return paise / 100;
}

export function rupeesToPaise(rupees: number | string): number {
  if (typeof rupees === 'string') {
    const sanitized = rupees.replace(/[^0-9.-]+/g, '');
    const num = parseFloat(sanitized);
    if (isNaN(num)) return 0;
    return Math.round(num * 100);
  }
  if (isNaN(rupees)) return 0;
  return Math.round(rupees * 100);
}

/**
 * Formats integer paise into Indian Rupee format (₹ XX,XX,XXX.XX)
 * Uses Indian numbering system grouping (Lakhs, Crores)
 */
export function formatINR(paise: number, options?: { showDecimal?: boolean }): string {
  const isNegative = paise < 0;
  const absPaise = Math.abs(paise);
  const rupees = Math.floor(absPaise / 100);
  const remainderPaise = absPaise % 100;

  // Indian currency numbering format
  const rupeesStr = rupees.toString();
  let lastThree = rupeesStr.substring(rupeesStr.length - 3);
  const otherNumbers = rupeesStr.substring(0, rupeesStr.length - 3);
  if (otherNumbers !== '') {
    lastThree = ',' + lastThree;
  }
  const formattedRupees = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + lastThree;

  const showDec = options?.showDecimal ?? true;
  const decimalPart = showDec ? `.${remainderPaise.toString().padStart(2, '0')}` : '';

  return `${isNegative ? '-' : ''}₹${formattedRupees}${decimalPart}`;
}

/**
 * Net Balance = Total Income - Total Expenses
 */
export function calculateNetBalance(totalIncomePaise: number, totalExpensesPaise: number): number {
  return totalIncomePaise - totalExpensesPaise;
}

/**
 * Available Balance = Net Balance - Savings Balance
 * Note: Savings allocations are stored funds, not ordinary operating expenses.
 */
export function calculateAvailableBalance(netBalancePaise: number, savingsPaise: number): number {
  return netBalancePaise - savingsPaise;
}

/**
 * Budget Usage Percentage = (Category Expenses / Category Budget Limit) * 100
 */
export function calculateBudgetUsage(spentPaise: number, limitPaise: number): number {
  if (limitPaise <= 0) return 0;
  const pct = (spentPaise / limitPaise) * 100;
  return Math.round(pct * 10) / 10;
}

export type BudgetThresholdLevel = 'safe' | 'moderate' | 'warning' | 'critical' | 'exceeded';

export interface BudgetStatusInfo {
  level: BudgetThresholdLevel;
  percentage: number;
  label: string;
  badgeClass: string;
  progressClass: string;
}

export function getBudgetStatus(usagePercentage: number): BudgetStatusInfo {
  if (usagePercentage >= 100) {
    return {
      level: 'exceeded',
      percentage: usagePercentage,
      label: 'Exceeded (100%+)',
      badgeClass: 'text-red-600 bg-red-50 dark:bg-red-950/40 dark:text-red-400 border border-red-200 dark:border-red-900',
      progressClass: 'bg-red-600',
    };
  }
  if (usagePercentage >= 90) {
    return {
      level: 'critical',
      percentage: usagePercentage,
      label: 'Critical (90%+)',
      badgeClass: 'text-rose-600 bg-rose-50 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200 dark:border-rose-900',
      progressClass: 'bg-rose-600',
    };
  }
  if (usagePercentage >= 75) {
    return {
      level: 'warning',
      percentage: usagePercentage,
      label: 'Warning (75%+)',
      badgeClass: 'text-amber-600 bg-amber-50 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200 dark:border-amber-900',
      progressClass: 'bg-amber-500',
    };
  }
  if (usagePercentage >= 50) {
    return {
      level: 'moderate',
      percentage: usagePercentage,
      label: 'Moderate (50%+)',
      badgeClass: 'text-blue-600 bg-blue-50 dark:bg-blue-950/40 dark:text-blue-400 border border-blue-200 dark:border-blue-900',
      progressClass: 'bg-blue-600',
    };
  }
  return {
    level: 'safe',
    percentage: usagePercentage,
    label: 'On Track (<50%)',
    badgeClass: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900',
    progressClass: 'bg-emerald-600',
  };
}

/**
 * Calculates total category expenses for a budget period:
 * - 'monthly': strictly expenses within the given year-month (YYYY-MM)
 * - 'yearly': strictly expenses within the given year (YYYY)
 * - Excludes deleted transactions (deletedAt != null)
 * - Excludes income or non-expense records
 * - Timezone-safe date extraction
 */
export function calculateBudgetSpent(
  transactions: Transaction[],
  categoryId: string,
  period: BudgetPeriod,
  referenceDate: Date = new Date()
): number {
  const year = referenceDate.getFullYear().toString();
  const month = String(referenceDate.getMonth() + 1).padStart(2, '0');
  const monthPrefix = `${year}-${month}`; // YYYY-MM

  return transactions
    .filter((t) => {
      if (t.deletedAt || t.type !== 'expense' || t.categoryId !== categoryId) {
        return false;
      }
      if (period === 'monthly') {
        return t.date.startsWith(monthPrefix);
      }
      if (period === 'yearly') {
        return t.date.startsWith(year);
      }
      return false;
    })
    .reduce((sum, t) => sum + t.amountPaise, 0);
}

export interface FinancialHealthResult {
  score: number;
  grade: 'Excellent' | 'Healthy' | 'Moderate' | 'Needs Attention' | 'Critical Deficit';
  gradeColor: string;
  status: 'empty' | 'deficit' | 'active';
  savingsRate: number; // percentage (0-100)
  spendingRatio: number; // percentage
  message: string;
}

/**
 * Calculates Financial Health based on verifiable, non-fabricated metrics:
 * - Handles zero activity (neutral empty state, score 0, status 'empty')
 * - Handles expenses with zero income (explicit deficit state, status 'deficit')
 * - When income > 0, evaluates 3 pillars (Max 100 points):
 *   1. Net Operating Margin / Savings Rate (Max 50 pts)
 *   2. Spend-to-Income Discipline (Max 35 pts)
 *   3. Dedicated Capital / Goal Allocation Bonus (Max 15 pts)
 */
export function calculateFinancialHealth(
  periodIncomePaise: number,
  periodExpensesPaise: number,
  savingsAllocatedPaise: number = 0,
  availableBalancePaise: number = 0
): FinancialHealthResult {
  // Case 1: Zero activity
  if (periodIncomePaise === 0 && periodExpensesPaise === 0) {
    return {
      score: 0,
      grade: 'Moderate',
      gradeColor: 'text-slate-500 dark:text-[#A3A3A3]',
      status: 'empty',
      savingsRate: 0,
      spendingRatio: 0,
      message: 'No financial activity recorded for this period. Add income and expenses to assess financial health.',
    };
  }

  // Case 2: Expenses with zero income (Operating Deficit)
  if (periodIncomePaise === 0 && periodExpensesPaise > 0) {
    return {
      score: 15,
      grade: 'Critical Deficit',
      gradeColor: 'text-rose-600 dark:text-rose-400',
      status: 'deficit',
      savingsRate: 0,
      spendingRatio: 100,
      message: 'Operating in pure deficit with ₹0 incoming funds recorded.',
    };
  }

  // Case 3: Positive income
  const netPaise = periodIncomePaise - periodExpensesPaise;
  const rawSavingsRate = (netPaise / periodIncomePaise) * 100;
  const savingsRate = Math.max(0, Math.round(rawSavingsRate));
  const rawSpendRatio = (periodExpensesPaise / periodIncomePaise) * 100;
  const spendingRatio = Math.round(rawSpendRatio);

  let score = 0;

  // Pillar 1: Savings Rate / Operating Surplus (Max 50 points)
  if (rawSavingsRate >= 30) {
    score += 50;
  } else if (rawSavingsRate >= 20) {
    score += 40;
  } else if (rawSavingsRate >= 10) {
    score += 25;
  } else if (rawSavingsRate >= 0) {
    score += 15;
  } else {
    // Deficit (spending exceeds income)
    score += 0;
  }

  // Pillar 2: Spend-to-Income Discipline (Max 35 points)
  if (rawSpendRatio <= 50) {
    score += 35;
  } else if (rawSpendRatio <= 70) {
    score += 25;
  } else if (rawSpendRatio <= 85) {
    score += 15;
  } else if (rawSpendRatio <= 100) {
    score += 5;
  } else {
    score += 0;
  }

  // Pillar 3: Dedicated Reserves Cushion (Max 15 points)
  if (savingsAllocatedPaise > 0) {
    if (savingsAllocatedPaise >= Math.round(periodIncomePaise * 0.1)) {
      score += 10;
    } else {
      score += 5;
    }
  }
  if (availableBalancePaise > 0) {
    score += 5;
  }

  score = Math.min(100, Math.max(10, score));

  let grade: 'Excellent' | 'Healthy' | 'Moderate' | 'Needs Attention' = 'Needs Attention';
  let gradeColor = 'text-rose-600 dark:text-rose-400';

  if (score >= 80) {
    grade = 'Excellent';
    gradeColor = 'text-emerald-600 dark:text-emerald-400';
  } else if (score >= 60) {
    grade = 'Healthy';
    gradeColor = 'text-blue-600 dark:text-blue-400';
  } else if (score >= 40) {
    grade = 'Moderate';
    gradeColor = 'text-amber-500';
  }

  const message =
    netPaise >= 0
      ? `Operating in net surplus with ${savingsRate}% savings rate.`
      : `Operating in net deficit of ₹${(Math.abs(netPaise) / 100).toFixed(2)}.`;

  return {
    score,
    grade,
    gradeColor,
    status: 'active',
    savingsRate,
    spendingRatio,
    message,
  };
}
