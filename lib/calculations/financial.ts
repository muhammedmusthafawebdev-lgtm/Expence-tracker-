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
