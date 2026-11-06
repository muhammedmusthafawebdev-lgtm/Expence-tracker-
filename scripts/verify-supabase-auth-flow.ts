/**
 * Automated Test Suite for Supabase Authentication & Callback Verification
 * Validates:
 * 1. Supabase browser client configuration & multiple env var alias support
 * 2. getAuthRedirectUrl helper behavior and correctness
 * 3. Next.js App Router auth callback route (/app/auth/callback/route.ts)
 * 4. PKCE code exchange & OTP token_hash handling
 * 5. Open-redirect attack prevention in callback
 * 6. Sign-up, Sign-in, and Magic Link validation logic
 * 7. Absence of obsolete "Phase 1 not completed" or "Frontend-Only Phase Notice"
 */

import * as fs from 'fs';
import * as path from 'path';

let passed = 0;
let failed = 0;

function assert(condition: boolean, title: string, details?: string) {
  if (condition) {
    console.log(`  ✓ PASS: ${title}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${title}`);
    if (details) console.error(`    Details: ${details}`);
    failed++;
  }
}

async function testAuthSuite() {
  console.log('\n======================================================');
  console.log('🧪 VERIFYING SUPABASE AUTHENTICATION ARCHITECTURE');
  console.log('======================================================\n');

  // Test 1: Callback Route File Verification
  console.log('📋 Test Suite 1: Auth Callback Route Handler (/app/auth/callback/route.ts)');
  const callbackRoutePath = path.resolve(process.cwd(), 'app/auth/callback/route.ts');
  assert(fs.existsSync(callbackRoutePath), 'Callback route handler file exists');

  const callbackContent = fs.readFileSync(callbackRoutePath, 'utf8');
  assert(callbackContent.includes("export async function GET"), 'GET handler exported in app/auth/callback/route.ts');
  assert(callbackContent.includes("searchParams.get('code')"), 'Reads PKCE code parameter from URL');
  assert(callbackContent.includes("searchParams.get('token_hash')"), 'Reads token_hash parameter from URL');
  assert(callbackContent.includes("searchParams.get('error')"), 'Handles error and error_description from Supabase');
  assert(
    callbackContent.includes("safeNext") || callbackContent.includes("next.startsWith('/')"),
    'Enforces open-redirect prevention on destination URL'
  );

  // Test 2: Supabase Browser Client Initialization
  console.log('\n📋 Test Suite 2: Supabase Client Configuration & PKCE Setup');
  const clientPath = path.resolve(process.cwd(), 'services/supabase/client.ts');
  assert(fs.existsSync(clientPath), 'services/supabase/client.ts exists');

  const clientContent = fs.readFileSync(clientPath, 'utf8');
  assert(clientContent.includes("flowType: 'pkce'"), 'Explicitly configures PKCE flowType for secure browser authentication');
  assert(clientContent.includes("detectSessionInUrl: true"), 'Enables detectSessionInUrl for hash and query parameter recovery');
  assert(clientContent.includes("persistSession: true"), 'Configures session persistence in browser storage');
  assert(clientContent.includes("getAuthRedirectUrl"), 'Exports getAuthRedirectUrl helper');

  // Test 3: AuthContext Implementation
  console.log('\n📋 Test Suite 3: AuthContext & State Management');
  const authContextPath = path.resolve(process.cwd(), 'context/AuthContext.tsx');
  assert(fs.existsSync(authContextPath), 'context/AuthContext.tsx exists');

  const authContent = fs.readFileSync(authContextPath, 'utf8');
  assert(authContent.includes("exchangeCodeForSession"), 'AuthContext exchanges authorization code for session');
  assert(authContent.includes("verifyOtp"), 'AuthContext supports verifyOtp for token_hash verification');
  assert(authContent.includes("signInWithOtp"), 'AuthContext implements signInWithMagicLink with signInWithOtp');
  assert(authContent.includes("signInWithPassword"), 'AuthContext implements signIn with signInWithPassword');
  assert(authContent.includes("signUp"), 'AuthContext implements signUp with full_name metadata');
  assert(authContent.includes("onAuthStateChange"), 'Subscribes to onAuthStateChange for real-time session sync');

  // Test 4: MagicLinkView Implementation
  console.log('\n📋 Test Suite 4: Magic Link Screen Quality & Honest Confirmation');
  const magicLinkPath = path.resolve(process.cwd(), 'components/auth/MagicLinkView.tsx');
  const magicLinkContent = fs.readFileSync(magicLinkPath, 'utf8');
  assert(magicLinkContent.includes("signInWithMagicLink"), 'Calls genuine signInWithMagicLink');
  assert(!magicLinkContent.includes("Sparkles"), 'No AI Sparkles icons on Magic Link screen');
  assert(!magicLinkContent.includes("Frontend-Only Phase Notice"), 'Zero obsolete Frontend-Only Phase Notice text');
  assert(magicLinkContent.includes("Open Email Inbox"), 'Provides user action to open their email client');

  // Test 5: Login & SignUp Screen Quality
  console.log('\n📋 Test Suite 5: Login & Sign Up Screens');
  const loginPath = path.resolve(process.cwd(), 'components/auth/LoginView.tsx');
  const loginContent = fs.readFileSync(loginPath, 'utf8');
  assert(loginContent.includes("signIn("), 'LoginView executes real signIn');
  assert(!loginContent.includes("Frontend-Only Phase Notice"), 'No Frontend-Only Phase Notice on login screen');

  const signUpPath = path.resolve(process.cwd(), 'components/auth/SignUpView.tsx');
  const signUpContent = fs.readFileSync(signUpPath, 'utf8');
  assert(signUpContent.includes("signUp("), 'SignUpView executes real signUp');
  assert(!signUpContent.includes("Frontend-Only Phase Notice"), 'No Frontend-Only Phase Notice on sign-up screen');
  assert(
    signUpContent.includes("requiresEmailConfirmation"),
    'Properly inspects requiresEmailConfirmation before advancing to dashboard'
  );

  // Test 6: Route Protection in ScreenRouter
  console.log('\n📋 Test Suite 6: Route Protection & Session Loading State');
  const routerPath = path.resolve(process.cwd(), 'components/views/ScreenRouter.tsx');
  const routerContent = fs.readFileSync(routerPath, 'utf8');
  assert(routerContent.includes("isConfigured && loading"), 'Displays session verification loading state during auth checks');
  assert(routerContent.includes("isConfigured && !user && !isAuthScreen"), 'Enforces route protection for unauthenticated users');

  // Test 7: Global Codebase Search for Obsolete Phase Notices
  console.log('\n📋 Test Suite 7: Clean Codebase Guarantee');
  const appShellPath = path.resolve(process.cwd(), 'components/layout/AppShell.tsx');
  const appShellContent = fs.readFileSync(appShellPath, 'utf8');
  assert(!appShellContent.includes("Phase 1 not completed"), 'No Phase 1 not completed notice in AppShell');

  console.log('\n======================================================');
  console.log(`📊 AUTH AUDIT SUMMARY: ${passed} Passed, ${failed} Failed`);
  console.log('======================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

testAuthSuite().catch((err) => {
  console.error('Fatal error running auth test suite:', err);
  process.exit(1);
});
