# Complete Supabase Backend & Authentication Integration Plan

Deliver a production-grade, complete Supabase backend integration and polished authentication experience for Expense Tracker, while preserving the existing Apple-inspired design system, mobile-first responsive layout, and strict integer-paise financial calculations.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> The implementation strictly transitions from a frontend-only session model to a full Supabase PostgreSQL backend with Row-Level Security (RLS) on all tables, real authentication, version-controlled migrations, and zero fake data.

- **Design System Preservation**: Strictly retain existing Tailwind CSS classes, color palette, typography hierarchy, and UI components (`AppShell`, `Sidebar`, `Header`, `MobileNav`, `TransactionDrawer`, `QuickCustomizeModal`). No extra decorative cards, excessive shadows, or extraneous pills.
- **Real Supabase Authentication**: Support email/password signup, email verification notice, login, session persistence in local storage, forgot password, password reset, magic link OTP, logout, and protected view routing.
- **Normalized PostgreSQL Schema & Versioned Migrations**: Commit `supabase/migrations/20261103000000_initial_schema.sql` defining profiles, preferences, categories, transactions, budgets, savings goals, and savings allocations with Foreign Keys and Indexes.
- **Row-Level Security (RLS)**: Enforce RLS on 100% of user-owned tables so users can read and write only their own rows (`auth.uid() = user_id`).
- **Financial Calculation Integrity**: Maintain integer-paise representation (1 INR = 100 paise) across all database columns and state, preserving 18/18 financial regression tests.

---

## 1. Overview & Core Concept

- **What It Delivers**: A comprehensive, secure personal finance system where all transactions, custom categories, period budgets, savings allocations, and user preferences are persisted in a real PostgreSQL database backed by Supabase.
- **Target Users**: Students, monthly salary earners, and personal finance managers who require absolute reliability, multi-device persistence, and clean privacy isolation.
- **Key Value**: Real cloud persistence and authenticated multi-user isolation without compromising speed, responsiveness, or mathematical financial integrity.

---

## 2. User Experience & Visual Design

- **Welcome & Auth Views**:
  - `WelcomeView`: Clean minimal landing page with headline *"Your money. Your clarity."*, tagline *"Your expense data, all in one place."*, primary CTA *"Get started"* (routes to sign up), secondary CTA *"Log in"*, and tertiary *"Explore demo / Quick start"*.
  - `LoginView`: Clean form with email, password, show/hide eye toggle, *"Forgot password?"*, *"Sign in with Magic Link"*, and *"Don't have an account? Sign up"*.
  - `SignUpView`: Full name, email, password, confirm password with live strength gauge and match indicator.
  - `ForgotPasswordView`: Email form triggering Supabase password recovery.
  - `CheckInboxView`: Clean confirmation view with 60-second resend cooldown timer.
  - `ResetPasswordView`: Form to submit new password and confirm password.
  - `MagicLinkView`: Passwordless email OTP entry with rate-limit cooldown.
- **App Shell Integration**:
  - Auth and Welcome screens hide the app sidebar, header, and mobile navigation for an immersive, distraction-free experience.
  - Authenticated sessions load user profile data, display active session state in the Header and Profile, and provide an explicit "Sign Out" button.
- **Responsive & Mobile-First**:
  - iPhone layouts (375px/390px) with minimum 44px touch targets, safe area spacing, and zero layout shift.
  - Clean desktop layout with collapsible sidebar.

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Supabase SDK Architecture (`@supabase/supabase-js`)**:
  - *Chosen Approach*: Install `@supabase/supabase-js` and configure standard singleton client with cookie/localStorage session persistence and auth state listeners.
  - *Why*: Provides official, type-safe PostgreSQL querying, RLS enforcement, and auth lifecycle management.
  - *Alternatives Considered*: Direct REST fetch calls (lacks auth token refresh handling and type safety).
- **Decision 2: Dual-Mode Data Provider (`SupabaseDataProvider` with Graceful Fallback)**:
  - *Chosen Approach*: Implement `SupabaseDataProvider` implementing `IDataProvider`. If Supabase credentials are configured in `.env.local` or environment, all reads/writes go to Supabase. If not configured, it informs the user cleanly through `BannerNoticeModal` with setup instructions.
  - *Why*: Ensures zero crash state when testing builds without live cloud keys while offering full production capabilities.
- **Decision 3: Database Currency Precision (BIGINT / INTEGER paise)**:
  - *Chosen Approach*: Store all monetary values (`amount_paise`, `limit_paise`, `target_amount_paise`, `monthly_allowance_paise`) as integer values in PostgreSQL.
  - *Why*: Eliminates IEEE-754 floating-point errors (e.g., `0.1 + 0.2 !== 0.3`) and conforms to strict banking standards.

---

## 4. Technical Architecture & Data Strategy

### System Architecture Diagram

```
┌────────────────────────────────────────────────────────────────────────┐
│                          Next.js App Router                            │
├────────────────────────────────────────────────────────────────────────┤
│                           ScreenRouter.tsx                             │
│  ┌───────────────────────┐             ┌────────────────────────────┐  │
│  │    Unauthenticated    │             │   Authenticated (AppShell) │  │
│  │ ───────────────────── │             │ ────────────────────────── │  │
│  │ • WelcomeView         │   Login /   │ • DashboardView            │  │
│  │ • LoginView           │  ─────────► │ • MoneyDashboardView       │  │
│  │ • SignUpView          │   SignUp    │ • TransactionsView         │  │
│  │ • ForgotPasswordView  │             │ • BudgetView               │  │
│  │ • MagicLinkView       │  ◄───────── │ • SavingsView              │  │
│  │ • ResetPasswordView   │   SignOut   │ • CategoriesView           │  │
│  │ • CheckInboxView      │             │ • Reports / Settings / etc │  │
│  └───────────────────────┘             └────────────────────────────┘  │
├────────────────────────────────────────────────────────────────────────┤
│                       AppContext & AuthContext                         │
│  • User Session State (user, session, loading)                         │
│  • Financial Summary (Net balance, available, savings)                 │
│  • Optimistic UI Updates & Error Boundaries                            │
├────────────────────────────────────────────────────────────────────────┤
│                    Data-Access Layer (IDataProvider)                   │
│                                                                        │
│               ┌──────────────────────────────────────┐                 │
│               │         SupabaseDataProvider         │                 │
│               └──────────────────┬───────────────────┘                 │
└──────────────────────────────────┼─────────────────────────────────────┘
                                   │
                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│                   Supabase Cloud / PostgreSQL Database                 │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ Tables:                                                          │  │
│  │ • auth.users (Supabase managed Auth & Passwords)                 │  │
│  │ • public.user_profiles (Profile details, currency, allowance)    │  │
│  │ • public.user_preferences (Theme, widget order & visibility)     │  │
│  │ • public.categories (System & custom income/expense categories)  │  │
│  │ • public.transactions (Income & expenses, soft-delete, integer)  │  │
│  │ • public.budgets (Period limits: monthly, yearly)                │  │
│  │ • public.savings_goals (Target funds, current allocations)       │  │
│  │ • public.savings_allocations (Deposits and withdrawals)          │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│  Row-Level Security (RLS) on all public tables: (auth.uid() = user_id)  │
└────────────────────────────────────────────────────────────────────────┘
```

### PostgreSQL Normalized Schema Details

1. **`user_profiles`**:
   - `id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE`
   - `name TEXT NOT NULL DEFAULT ''`
   - `email TEXT NOT NULL`
   - `currency TEXT NOT NULL DEFAULT 'INR'`
   - `monthly_allowance_paise BIGINT NOT NULL DEFAULT 0`
   - `student_type TEXT DEFAULT 'College Undergraduate'`
   - `institution TEXT DEFAULT ''`
   - `roll_number TEXT DEFAULT ''`
   - `created_at TIMESTAMPTZ NOT NULL DEFAULT now()`
   - `updated_at TIMESTAMPTZ NOT NULL DEFAULT now()`

2. **`user_preferences`**:
   - `user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE`
   - `theme TEXT NOT NULL DEFAULT 'system'`
   - `widgets JSONB NOT NULL DEFAULT '[]'::jsonb`
   - `widget_config JSONB NOT NULL DEFAULT '{}'::jsonb`
   - `updated_at TIMESTAMPTZ NOT NULL DEFAULT now()`

3. **`categories`**:
   - `id UUID PRIMARY KEY DEFAULT gen_random_uuid()`
   - `user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE`
   - `name TEXT NOT NULL`
   - `type TEXT NOT NULL CHECK (type IN ('income', 'expense', 'both'))`
   - `icon TEXT NOT NULL DEFAULT 'Tag'`
   - `color TEXT NOT NULL DEFAULT '#64748B'`
   - `is_custom BOOLEAN NOT NULL DEFAULT true`
   - `created_at TIMESTAMPTZ NOT NULL DEFAULT now()`
   - *Unique Constraint*: `UNIQUE (user_id, lower(name), type)`

4. **`transactions`**:
   - `id UUID PRIMARY KEY DEFAULT gen_random_uuid()`
   - `user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE`
   - `type TEXT NOT NULL CHECK (type IN ('income', 'expense'))`
   - `amount_paise BIGINT NOT NULL CHECK (amount_paise > 0)`
   - `category_id UUID REFERENCES categories(id) ON DELETE SET NULL`
   - `date DATE NOT NULL`
   - `payment_method TEXT`
   - `description TEXT`
   - `is_recurring BOOLEAN NOT NULL DEFAULT false`
   - `debt_type TEXT`
   - `created_at TIMESTAMPTZ NOT NULL DEFAULT now()`
   - `deleted_at TIMESTAMPTZ DEFAULT NULL`
   - *Indexes*: `(user_id, date DESC)`, `(user_id, deleted_at)`

5. **`budgets`**:
   - `id UUID PRIMARY KEY DEFAULT gen_random_uuid()`
   - `user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE`
   - `category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE`
   - `limit_paise BIGINT NOT NULL CHECK (limit_paise > 0)`
   - `period TEXT NOT NULL CHECK (period IN ('monthly', 'yearly'))`
   - `created_at TIMESTAMPTZ NOT NULL DEFAULT now()`
   - *Unique Constraint*: `UNIQUE (user_id, category_id, period)`

6. **`savings_goals` & `savings_allocations`**:
   - `savings_goals`: `id`, `user_id`, `title`, `target_amount_paise`, `current_amount_paise`, `target_date`, `notes`, `created_at`
   - `savings_allocations`: `id`, `user_id`, `goal_id REFERENCES savings_goals(id) ON DELETE CASCADE`, `amount_paise`, `date`, `type CHECK (type IN ('deposit', 'withdrawal'))`, `note`, `created_at`

7. **Automatic User Profile Trigger**:
   - PostgreSQL trigger on `auth.users` `AFTER INSERT` to insert initial `user_profiles`, default student categories, and `user_preferences`.

---

## 5. Implementation Steps

1. **Dependencies**:
   - Install `@supabase/supabase-js`.
2. **Migrations**:
   - Create `supabase/migrations/20261103000000_initial_schema.sql` with tables, indexes, constraints, trigger functions, and RLS policies.
3. **Services & Data Layer**:
   - Implement `services/supabase/client.ts` with browser client initialization.
   - Implement `services/supabase/supabase-data-provider.ts` matching `IDataProvider` interface.
   - Update `services/data-provider.ts` to switch dynamically between Supabase and local session provider based on configuration.
4. **Authentication Views & Routing**:
   - Implement `components/auth/WelcomeView.tsx`, `LoginView.tsx`, `SignUpView.tsx`, `ForgotPasswordView.tsx`, `ResetPasswordView.tsx`, `MagicLinkView.tsx`, `CheckInboxView.tsx`.
   - Update `components/layout/AppShell.tsx` to omit sidebars and headers when viewing auth/welcome views.
   - Update `components/views/ScreenRouter.tsx` to render authentication screens.
   - Add session management and logout handlers in `Header.tsx` and `ProfileView.tsx`.
5. **Testing & Verification**:
   - Create an automated test runner script `scripts/verify-supabase-schema.ts` to validate SQL syntax, table definitions, foreign keys, and RLS policies.
   - Run financial integrity tests (`scripts/verify-financial-integrity.ts`).
   - Run `npm run lint` and `npm run build`.

---

## 6. Verification Plan

### Automated Verification
1. **Financial Logic Regression**:
   - Execute `npx tsx scripts/verify-financial-integrity.ts` -> Confirm all 18/18 financial calculation tests pass.
2. **Schema & Migration Verification**:
   - Execute `npx tsx scripts/verify-supabase-schema.ts` -> Confirm all tables, constraints, trigger definitions, and RLS policies exist and are syntactically valid.
3. **TypeScript & ESLint Quality Check**:
   - Run `npm run lint` -> 0 errors, 0 warnings.
4. **Applet Compilation**:
   - Run `compile_applet` (`npm run build`) -> App Router compiles cleanly with all dynamic routes and components.

### User-Facing Verification Steps
1. **Welcome Landing Page**:
   - Load app at root; observe Welcome page with "Your money. Your clarity.", CTAs, and value pillars.
2. **Authentication User Flows**:
   - Test Sign Up: validate form, test password match indicator.
   - Test Login: show/hide password toggle, input validation.
   - Test Forgot Password: input email -> "Check your inbox" screen with 60s cooldown timer.
   - Test Magic Link: input email -> triggers passwordless sign-in request.
3. **Session & Persistence Transitions**:
   - Log in / quick-start into dashboard -> AppShell sidebar and header appear.
   - Create transaction, budget, custom category, and savings goal -> verify state updates.
   - Click "Log out" in Profile -> cleanly returns to Welcome screen.
