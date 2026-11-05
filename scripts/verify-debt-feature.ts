/**
 * Automated Verification Script for Debt Management Feature
 * Tests schema integrity, RLS policies, data provider logic,
 * dynamic status calculations, repayment tracking, overpayment prevention,
 * and financial asset independence.
 */

import { ClientSessionDataProvider } from '../services/data-provider';
import { Debt, DebtStatus } from '../types';
import { formatINR, paiseToRupees, rupeesToPaise } from '../lib/calculations/financial';
import * as fs from 'fs';
import * as path from 'path';

let passed = 0;
let failed = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    console.log(`  ✅ PASS: ${message}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${message}`);
    failed++;
  }
}

async function runTests() {
  console.log('\n======================================================');
  console.log('🧪 VERIFYING DEBT MANAGEMENT FEATURE IMPLEMENTATION');
  console.log('======================================================\n');

  // Test 1: PostgreSQL Migration File Verification
  console.log('📋 Test Suite 1: PostgreSQL Schema & RLS Migration');
  const migrationPath = path.join(
    process.cwd(),
    'supabase/migrations/20261105000000_debts_feature.sql'
  );
  assert(fs.existsSync(migrationPath), 'Migration file 20261105000000_debts_feature.sql exists');

  const migrationSql = fs.readFileSync(migrationPath, 'utf8');
  assert(migrationSql.includes('CREATE TABLE IF NOT EXISTS public.debts'), 'debts table definition present');
  assert(migrationSql.includes('CREATE TABLE IF NOT EXISTS public.debt_repayments'), 'debt_repayments table definition present');
  assert(migrationSql.includes('principal_amount_paise BIGINT NOT NULL'), 'principal_amount_paise stored as BIGINT');
  assert(migrationSql.includes('amount_paise BIGINT NOT NULL'), 'repayment amount_paise stored as BIGINT');
  assert(migrationSql.includes('ALTER TABLE public.debts ENABLE ROW LEVEL SECURITY'), 'RLS enabled on debts');
  assert(migrationSql.includes('ALTER TABLE public.debt_repayments ENABLE ROW LEVEL SECURITY'), 'RLS enabled on debt_repayments');
  assert(migrationSql.includes('ON DELETE CASCADE'), 'Foreign key cascade delete configured');
  assert(migrationSql.includes('idx_debts_user_id'), 'Index on debts(user_id) configured');
  assert(migrationSql.includes('idx_debt_repayments_debt_id'), 'Index on debt_repayments(debt_id) configured');

  // Test 2: Data Provider & Dynamic Status Lifecycle
  console.log('\n📋 Test Suite 2: Debt Lifecycle & Dynamic Status Transitions');
  const provider = new ClientSessionDataProvider();

  // Create a debt: ₹10,000 lent to "Rahul Verma"
  const createRes1 = await provider.createDebt({
    personName: 'Rahul Verma',
    principalAmountPaise: rupeesToPaise(10000), // 1000000 paise
    phone: '+91 98765 43210',
    lentDate: '2026-11-01',
    expectedRepaymentDate: '2026-11-30',
    description: 'Advance for semester textbook purchase',
  });
  const debt1 = createRes1.item!;

  assert(debt1.personName === 'Rahul Verma', 'Debt created with correct person name');
  assert(debt1.principalAmountPaise === 1000000, 'Principal stored accurately in integer paise (10,00,000)');
  assert(debt1.totalRepaidPaise === 0, 'Initial repaid amount is 0 paise');
  assert(debt1.outstandingPaise === 1000000, 'Initial outstanding equals principal');
  assert(debt1.status === 'active', 'Initial status is "active"');

  // Test 3: Partial Repayment
  console.log('\n📋 Test Suite 3: Partial Repayment & Status Update');
  const rep1 = await provider.addDebtRepayment(
    debt1.id,
    rupeesToPaise(4000), // ₹4,000
    '2026-11-05',
    'UPI payment via PhonePe'
  );
  assert(rep1.success, 'Partial repayment recorded successfully');

  const debtsAfterRep1 = await provider.getDebts();
  const updatedDebt1 = debtsAfterRep1.find((d) => d.id === debt1.id)!;

  assert(updatedDebt1.totalRepaidPaise === 400000, 'Total repaid updated to ₹4,000 (4,00,000 paise)');
  assert(updatedDebt1.outstandingPaise === 600000, 'Outstanding reduced to ₹6,000 (6,00,000 paise)');
  assert(updatedDebt1.status === 'partially_repaid', 'Status transitioned to "partially_repaid"');
  assert(updatedDebt1.repayments?.length === 1, 'Repayment history contains 1 record');

  // Test 4: Overpayment Prevention
  console.log('\n📋 Test Suite 4: Overpayment Prevention Guard');
  let overpaymentRejected = false;
  try {
    // Attempt to repay ₹7,000 when only ₹6,000 is outstanding
    const overpaymentRes = await provider.addDebtRepayment(debt1.id, rupeesToPaise(7000), '2026-11-06');
    if (!overpaymentRes.success) {
      overpaymentRejected = true;
    }
  } catch {
    overpaymentRejected = true;
  }
  assert(overpaymentRejected, 'Overpayment greater than outstanding balance is strictly rejected');

  // Test 5: Full Repayment & Auto-Settlement
  console.log('\n📋 Test Suite 5: Full Repayment & Settlement');
  await provider.addDebtRepayment(debt1.id, rupeesToPaise(6000), '2026-11-07', 'Final cash repayment');
  const debtsAfterRep2 = await provider.getDebts();
  const settledDebt = debtsAfterRep2.find((d) => d.id === debt1.id)!;

  assert(settledDebt.totalRepaidPaise === 1000000, 'Total repaid equals principal ₹10,000');
  assert(settledDebt.outstandingPaise === 0, 'Outstanding balance is ₹0');
  assert(settledDebt.status === 'settled', 'Status transitioned automatically to "settled"');
  assert(settledDebt.repayments?.length === 2, 'Repayment history contains both partial repayments');

  // Test 6: Deleting Repayment Reverts Status & Balance
  console.log('\n📋 Test Suite 6: Repayment Deletion & Balance Restoration');
  const repayment6k = settledDebt.repayments!.find((r) => r.amountPaise === 600000)!;
  await provider.deleteDebtRepayment(repayment6k.id, debt1.id);
  const debtsAfterRepDelete = await provider.getDebts();
  const restoredDebt = debtsAfterRepDelete.find((d) => d.id === debt1.id)!;

  assert(restoredDebt.outstandingPaise === 600000, 'Deleting repayment restored outstanding balance to ₹6,000');
  assert(restoredDebt.status === 'partially_repaid', 'Status accurately reverted to "partially_repaid"');

  // Test 7: Overdue Status Calculation
  console.log('\n📋 Test Suite 7: Overdue Status Calculation');
  const overdueRes = await provider.createDebt({
    personName: 'Karan Mehra',
    principalAmountPaise: rupeesToPaise(2500),
    lentDate: '2026-09-01',
    expectedRepaymentDate: '2026-10-01', // Date in the past
    description: 'Exam registration fee help',
  });
  const overdueDebt = overdueRes.item!;
  assert(overdueDebt.status === 'overdue', 'Debt with past due date and outstanding > 0 marked "overdue"');

  // Test 8: Financial Segregation (Asset Receivable vs Expenses)
  console.log('\n📋 Test Suite 8: Financial Segregation & Net Worth Integrity');
  const txs = await provider.getTransactions();
  const hasDebtTx = txs.some(
    (t) => t.description?.includes('Rahul Verma') || t.description?.includes('Karan Mehra')
  );
  assert(!hasDebtTx, 'Debt records do NOT inject fake transactions or pollute cash flow');

  // Test 9: Deletion of Debt
  console.log('\n📋 Test Suite 9: Cascade Deletion');
  await provider.deleteDebt(overdueDebt.id);
  const remainingDebts = await provider.getDebts();
  assert(!remainingDebts.some((d) => d.id === overdueDebt.id), 'Debt record deleted successfully');

  console.log('\n======================================================');
  console.log(`📊 TEST RESULTS: ${passed} Passed, ${failed} Failed`);
  console.log('======================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Fatal error during test execution:', err);
  process.exit(1);
});
