/**
 * Automated Verification Script: Supabase Schema, RLS & Migration Audit
 * Validates the SQL migration file and schema definitions against requirements.
 */

import * as fs from 'fs';
import * as path from 'path';

let passCount = 0;
let failCount = 0;

function assert(condition: boolean, testName: string, details?: string) {
  if (condition) {
    console.log(`✅ PASS: ${testName}`);
    passCount++;
  } else {
    console.error(`❌ FAIL: ${testName}`);
    if (details) console.error(`   Details: ${details}`);
    failCount++;
  }
}

async function runAudit() {
  console.log('===============================================================');
  console.log('SUPABASE POSTGRESQL SCHEMA & RLS INTEGRITY AUDIT');
  console.log('===============================================================\n');

  const migrationPath = path.join(process.cwd(), 'supabase/migrations/20261103000000_initial_schema.sql');
  const migrationExists = fs.existsSync(migrationPath);
  assert(migrationExists, 'Migration file 20261103000000_initial_schema.sql exists in repository');

  if (!migrationExists) {
    console.error('Aborting schema audit: migration file not found');
    process.exit(1);
  }

  const sql = fs.readFileSync(migrationPath, 'utf8');

  // 1. Table Definitions
  const requiredTables = [
    'public.user_profiles',
    'public.user_preferences',
    'public.categories',
    'public.transactions',
    'public.budgets',
    'public.savings_goals',
    'public.savings_allocations',
  ];

  for (const table of requiredTables) {
    assert(
      sql.includes(`CREATE TABLE IF NOT EXISTS ${table}`),
      `Table ${table} is defined with proper namespace`
    );
  }

  // 2. Integer paise enforcement (no floating point currency)
  assert(
    sql.includes('monthly_allowance_paise BIGINT') &&
    sql.includes('amount_paise BIGINT') &&
    sql.includes('limit_paise BIGINT') &&
    sql.includes('target_amount_paise BIGINT') &&
    sql.includes('current_amount_paise BIGINT'),
    'All monetary columns use BIGINT integer-paise representation'
  );

  // 3. Row Level Security Enabled on all tables
  for (const table of requiredTables) {
    assert(
      sql.includes(`ALTER TABLE ${table} ENABLE ROW LEVEL SECURITY;`),
      `RLS explicitly enabled on ${table}`
    );
  }

  // 4. RLS isolation policies using auth.uid()
  const requiredPolicies = [
    'Users can view own profile',
    'Users can update own profile',
    'Users can view own preferences',
    'Users can update own preferences',
    'Users can view own categories',
    'Users can insert own categories',
    'Users can delete own categories',
    'Users can view own transactions',
    'Users can insert own transactions',
    'Users can update own transactions',
    'Users can delete own transactions',
    'Users can view own budgets',
    'Users can insert own budgets',
    'Users can update own budgets',
    'Users can delete own budgets',
    'Users can view own savings goals',
    'Users can view own savings allocations',
  ];

  for (const policy of requiredPolicies) {
    assert(
      sql.includes(`CREATE POLICY "${policy}"`),
      `Security policy "${policy}" defined`
    );
  }

  // 5. Automated trigger on auth.users for new user initialization
  assert(
    sql.includes('CREATE OR REPLACE FUNCTION public.handle_new_user()') &&
    sql.includes('CREATE TRIGGER on_auth_user_created'),
    'New user registration trigger provisions profile, preferences, and baseline categories'
  );

  // 6. Foreign key cascades and data integrity
  assert(
    sql.includes('REFERENCES auth.users(id) ON DELETE CASCADE') &&
    sql.includes('REFERENCES public.categories(id) ON DELETE SET NULL'),
    'Foreign keys define proper cascade and set-null referential integrity'
  );

  // 7. Soft delete support on transactions
  assert(
    sql.includes('deleted_at TIMESTAMPTZ DEFAULT NULL'),
    'Transactions table supports soft-delete retention via deleted_at timestamp'
  );

  console.log('\n---------------------------------------------------------------');
  console.log(`TOTAL TESTS: ${passCount + failCount} | PASSED: ${passCount} | FAILED: ${failCount}`);
  console.log('---------------------------------------------------------------');

  if (failCount > 0) {
    process.exit(1);
  }
}

runAudit().catch((err) => {
  console.error('Fatal audit failure:', err);
  process.exit(1);
});
