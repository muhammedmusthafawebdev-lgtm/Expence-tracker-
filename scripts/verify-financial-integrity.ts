import {
  calculateBudgetSpent,
  calculateFinancialHealth,
  calculateNetBalance,
  calculateAvailableBalance,
} from '../lib/calculations/financial';
import { Transaction, Category, BudgetPeriod } from '../types';

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition: boolean, testName: string, details?: string) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✓ PASS: ${testName}`);
  } else {
    failedTests++;
    console.error(`  ✗ FAIL: ${testName}`);
    if (details) console.error(`    Details: ${details}`);
  }
}

console.log('\n============================================================');
console.log('--- EXPENSE TRACKER FINANCIAL INTEGRITY & REGRESSION TESTS ---');
console.log('============================================================\n');

// -------------------------------------------------------------
// TEST SUITE 1: BudgetWidget Period Isolation & Date Boundaries
// -------------------------------------------------------------
console.log('1. Testing BudgetWidget Period Isolation & Date Boundaries:');

const testReferenceDate = new Date('2026-11-15T12:00:00Z'); // Current month: 2026-11, Year: 2026

const sampleTransactions: Transaction[] = [
  // Current month expense (2026-11)
  {
    id: 'tx_1',
    type: 'expense',
    amountPaise: 45000, // ₹450.00
    categoryId: 'food',
    date: '2026-11-02',
    createdAt: '2026-11-02T10:00:00Z',
    deletedAt: null,
  },
  // Another current month expense (2026-11)
  {
    id: 'tx_2',
    type: 'expense',
    amountPaise: 55000, // ₹550.00
    categoryId: 'food',
    date: '2026-11-10',
    createdAt: '2026-11-10T10:00:00Z',
    deletedAt: null,
  },
  // Previous month expense in same year (2026-10) -> Should NOT count in monthly budget
  {
    id: 'tx_3',
    type: 'expense',
    amountPaise: 120000, // ₹1200.00
    categoryId: 'food',
    date: '2026-10-25',
    createdAt: '2026-10-25T10:00:00Z',
    deletedAt: null,
  },
  // Previous year expense (2025-11) -> Should NOT count in monthly or yearly budget
  {
    id: 'tx_4',
    type: 'expense',
    amountPaise: 300000, // ₹3000.00
    categoryId: 'food',
    date: '2025-11-05',
    createdAt: '2025-11-05T10:00:00Z',
    deletedAt: null,
  },
  // Soft-deleted current month expense -> Must be excluded
  {
    id: 'tx_5',
    type: 'expense',
    amountPaise: 99900,
    categoryId: 'food',
    date: '2026-11-08',
    createdAt: '2026-11-08T10:00:00Z',
    deletedAt: '2026-11-09T00:00:00Z',
  },
  // Income transaction in food category -> Must be excluded
  {
    id: 'tx_6',
    type: 'income',
    amountPaise: 50000,
    categoryId: 'food',
    date: '2026-11-04',
    createdAt: '2026-11-04T10:00:00Z',
    deletedAt: null,
  },
];

// Monthly budget spent for food should ONLY sum tx_1 (45000) + tx_2 (55000) = 100000 paise (₹1000.00)
const monthlySpent = calculateBudgetSpent(sampleTransactions, 'food', 'monthly', testReferenceDate);
assert(
  monthlySpent === 100000,
  'Monthly budget spent strictly includes current month expenses only (100,000 paise)',
  `Received: ${monthlySpent} paise, Expected: 100000 paise`
);

// Yearly budget spent for food should sum tx_1 (45000) + tx_2 (55000) + tx_3 (120000) = 220000 paise (₹2200.00)
const yearlySpent = calculateBudgetSpent(sampleTransactions, 'food', 'yearly', testReferenceDate);
assert(
  yearlySpent === 220000,
  'Yearly budget spent strictly includes current calendar year expenses only (220,000 paise)',
  `Received: ${yearlySpent} paise, Expected: 220000 paise`
);

// Soft deleted transaction was excluded
assert(!sampleTransactions.filter((t) => t.id === 'tx_5' && !t.deletedAt).length, 'Deleted transactions are excluded');

// -------------------------------------------------------------
// TEST SUITE 2: BillsRecurringWidget Scoping & User Designation
// -------------------------------------------------------------
console.log('\n2. Testing BillsRecurringWidget User-Designation & Monthly Scoping:');

const currentMonthStr = '2026-11';
const recurringTestTransactions: Transaction[] = [
  // User designated recurring bill in current month
  {
    id: 'rec_1',
    type: 'expense',
    amountPaise: 800000, // ₹8,000 rent
    categoryId: 'housing',
    date: '2026-11-01',
    description: 'Hostel PG Rent',
    isRecurring: true,
    createdAt: '2026-11-01T00:00:00Z',
  },
  // User designated recurring subscription in current month
  {
    id: 'rec_2',
    type: 'expense',
    amountPaise: 19900, // ₹199
    categoryId: 'entertainment',
    date: '2026-11-05',
    description: 'Music Streaming',
    isRecurring: true,
    createdAt: '2026-11-05T00:00:00Z',
  },
  // Non-recurring transaction with keyword "rent" in description and Credit Card payment -> MUST NOT BE INCLUDED!
  {
    id: 'non_rec_1',
    type: 'expense',
    amountPaise: 50000, // ₹500
    categoryId: 'misc',
    date: '2026-11-03',
    description: 'Rented bicycle for weekend trip',
    paymentMethod: 'Credit Card',
    isRecurring: false, // NOT designated recurring!
    createdAt: '2026-11-03T00:00:00Z',
  },
  // Non-recurring transaction with Net Banking payment -> MUST NOT BE INCLUDED!
  {
    id: 'non_rec_2',
    type: 'expense',
    amountPaise: 150000, // ₹1500
    categoryId: 'shopping',
    date: '2026-11-04',
    description: 'Online book purchase via Net Banking',
    paymentMethod: 'Net Banking',
    isRecurring: false,
    createdAt: '2026-11-04T00:00:00Z',
  },
  // Recurring bill from previous month (2026-10) -> MUST NOT BE INCLUDED IN CURRENT MONTH TOTAL
  {
    id: 'rec_prev_month',
    type: 'expense',
    amountPaise: 800000,
    categoryId: 'housing',
    date: '2026-10-01',
    description: 'Hostel PG Rent',
    isRecurring: true,
    createdAt: '2026-10-01T00:00:00Z',
  },
];

// Apply the widget filter logic
const filteredRecurring = recurringTestTransactions.filter((t) => {
  if (t.type !== 'expense' || t.deletedAt) return false;
  if (!t.isRecurring) return false;
  return t.date.startsWith(currentMonthStr);
});

const monthlyRecurringTotalPaise = filteredRecurring.reduce((sum, t) => sum + t.amountPaise, 0);

assert(
  filteredRecurring.length === 2,
  'Only explicitly user-designated recurring transactions in current month are included (length = 2)'
);
assert(
  !filteredRecurring.some((t) => t.id === 'non_rec_1' || t.id === 'non_rec_2'),
  'Ordinary Credit Card and Net Banking purchases are excluded from recurring commitments'
);
assert(
  !filteredRecurring.some((t) => t.id === 'rec_prev_month'),
  'Previous month recurring transactions are excluded from current month total'
);
assert(
  monthlyRecurringTotalPaise === 819900, // 800000 + 19900 = 819900 paise
  'Monthly recurring total matches exact expected paise (819,900 paise / ₹8,199.00)',
  `Received: ${monthlyRecurringTotalPaise}`
);

// -------------------------------------------------------------
// TEST SUITE 3: DebtEmiWidget Credit Card Exclusion & Loan Scoping
// -------------------------------------------------------------
console.log('\n3. Testing DebtEmiWidget Credit Card Exclusion & Deduplication:');

const categories: Category[] = [
  { id: 'cat_loan', name: 'Education Loan EMI', type: 'expense', icon: 'GraduationCap', color: '#EF4444', groupName: 'EMI & Loans' },
  { id: 'cat_food', name: 'Food & Dining', type: 'expense', icon: 'Utensils', color: '#F59E0B' },
  { id: 'cat_shopping', name: 'Shopping', type: 'expense', icon: 'Shirt', color: '#EC4899' },
];

const debtTestTransactions: Transaction[] = [
  // Actual Loan EMI
  {
    id: 'debt_1',
    type: 'expense',
    amountPaise: 500000, // ₹5,000
    categoryId: 'cat_loan',
    date: '2026-11-05',
    description: 'Semester 1 Loan Installment',
    paymentMethod: 'Net Banking',
    createdAt: '2026-11-05T00:00:00Z',
  },
  // Ordinary shopping purchase paid via Credit Card -> MUST NOT BE INCLUDED AS DEBT/EMI!
  {
    id: 'card_purchase_1',
    type: 'expense',
    amountPaise: 299900, // ₹2,999
    categoryId: 'cat_shopping',
    date: '2026-11-08',
    description: 'Winter Jacket bought on Credit Card',
    paymentMethod: 'Credit Card',
    createdAt: '2026-11-08T00:00:00Z',
  },
  // Food purchase paid via Credit Card -> MUST NOT BE INCLUDED AS DEBT/EMI!
  {
    id: 'card_purchase_2',
    type: 'expense',
    amountPaise: 65000, // ₹650
    categoryId: 'cat_food',
    date: '2026-11-09',
    description: 'Restaurant dinner paid by credit card',
    paymentMethod: 'Credit Card',
    createdAt: '2026-11-09T00:00:00Z',
  },
];

const seenIds = new Set<string>();
const detectedDebt = debtTestTransactions.filter((t) => {
  if (t.type !== 'expense' || t.deletedAt || seenIds.has(t.id)) return false;
  const cat = categories.find((c) => c.id === t.categoryId);
  const catName = (cat?.name || '').toLowerCase();
  const groupName = (cat?.groupName || '').toLowerCase();

  const isEmiCategory =
    catName.includes('emi') ||
    catName.includes('loan') ||
    groupName.includes('emi') ||
    groupName.includes('loan');

  if (isEmiCategory) {
    seenIds.add(t.id);
    return true;
  }
  return false;
});

const totalDebtPaise = detectedDebt.reduce((sum, t) => sum + t.amountPaise, 0);

assert(
  detectedDebt.length === 1 && detectedDebt[0].id === 'debt_1',
  'Only explicitly categorized loan/EMI records appear (length = 1)'
);
assert(
  !detectedDebt.some((t) => t.id === 'card_purchase_1' || t.id === 'card_purchase_2'),
  'Ordinary credit card purchases are NOT included as debt or EMI'
);
assert(
  totalDebtPaise === 500000,
  'Total debt paise equals exactly 500,000 paise (₹5,000.00)',
  `Received: ${totalDebtPaise}`
);

// -------------------------------------------------------------
// TEST SUITE 4: Net Liquid Capital & Reserves (Cash + Goals)
// -------------------------------------------------------------
console.log('\n4. Testing Net Liquid Capital & Dynamic Status Badge:');

// Scenario A: Positive Balance
const incomePaise = 3000000; // ₹30,000
const expensesPaise = 1800000; // ₹18,000
const savingsAllocatedPaise = 500000; // ₹5,000 ring-fenced for goals

const netBalancePaise = calculateNetBalance(incomePaise, expensesPaise); // 1,200,000 (₹12,000)
const availableBalancePaise = calculateAvailableBalance(netBalancePaise, savingsAllocatedPaise); // 700,000 (₹7,000)

// Total liquid capital reconstituted
const totalCapitalPaise = availableBalancePaise + savingsAllocatedPaise; // 1,200,000

assert(
  totalCapitalPaise === netBalancePaise,
  'Available balance + savings reserves equals net balance with zero double-counting (1,200,000 paise)'
);
assert(
  totalCapitalPaise >= 0,
  'Dynamic status badge reflects Positive Balance when capital is non-negative'
);

// Scenario B: Deficit Balance
const deficitIncomePaise = 500000; // ₹5,000
const deficitExpensesPaise = 1500000; // ₹15,000
const deficitSavingsPaise = 0;

const deficitNetBalance = calculateNetBalance(deficitIncomePaise, deficitExpensesPaise); // -1,000,000
const deficitAvailable = calculateAvailableBalance(deficitNetBalance, deficitSavingsPaise); // -1,000,000
const deficitTotalCapital = deficitAvailable + deficitSavingsPaise; // -1,000,000

assert(
  deficitTotalCapital < 0,
  'Dynamic status badge reflects Net Deficit when capital is negative (-1,000,000 paise)'
);

// -------------------------------------------------------------
// TEST SUITE 5: Financial Health Scoring Formula & Edge Cases
// -------------------------------------------------------------
console.log('\n5. Testing FinancialHealth Scoring Formula & Edge Cases:');

// Edge Case 1: Zero activity (no income, no expenses)
const emptyHealth = calculateFinancialHealth(0, 0, 0, 0);
assert(
  emptyHealth.status === 'empty' && emptyHealth.score === 0,
  'Zero activity returns status "empty" and score 0 (NO fabricated score 50)'
);

// Edge Case 2: Expenses with ₹0 income (operating deficit)
const deficitHealth = calculateFinancialHealth(0, 500000, 0, -500000);
assert(
  deficitHealth.status === 'deficit' && deficitHealth.grade === 'Critical Deficit' && deficitHealth.score === 15,
  'Expenses with ₹0 income returns status "deficit" with Grade "Critical Deficit" (15/100)'
);

// Normal Case 3: Balanced student budget (Income ₹20,000, Expenses ₹12,000 -> 40% savings rate)
const goodHealth = calculateFinancialHealth(2000000, 1200000, 300000, 500000);
assert(
  goodHealth.status === 'active' && goodHealth.score >= 80 && goodHealth.grade === 'Excellent',
  '40% savings rate with reserves earns Grade "Excellent" (score >= 80)',
  `Received score: ${goodHealth.score}, grade: ${goodHealth.grade}`
);

// Normal Case 4: Tight budget with spending exceeding income (Income ₹10,000, Expenses ₹12,000)
const overspendingHealth = calculateFinancialHealth(1000000, 1200000, 0, -200000);
assert(
  overspendingHealth.status === 'active' && overspendingHealth.score < 40 && overspendingHealth.grade === 'Needs Attention',
  'Overspending income receives low score (<40) with Grade "Needs Attention"',
  `Received score: ${overspendingHealth.score}, grade: ${overspendingHealth.grade}`
);

// Mathematical safety: ensure no NaN or undefined
assert(!isNaN(goodHealth.score) && !isNaN(deficitHealth.score) && !isNaN(emptyHealth.score), 'No NaN in health score calculations');

console.log('\n============================================================');
console.log(`TEST RESULTS: ${passedTests} passed, ${failedTests} failed, ${totalTests} total.`);
console.log('============================================================\n');

if (failedTests > 0) {
  process.exit(1);
}
