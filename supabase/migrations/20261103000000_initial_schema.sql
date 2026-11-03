-- ==============================================================================
-- EXPENSE TRACKER - PRODUCTION POSTGRESQL SCHEMA WITH ROW-LEVEL SECURITY (RLS)
-- Version: 20261103000000
-- Monetary Unit: Integer Paise (1 INR = 100 paise) to prevent floating-point rounding errors
-- ==============================================================================

-- Enable UUID extension if not already available
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 1. USER PROFILES
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL DEFAULT '',
    email TEXT NOT NULL,
    currency TEXT NOT NULL DEFAULT 'INR',
    monthly_allowance_paise BIGINT NOT NULL DEFAULT 0 CHECK (monthly_allowance_paise >= 0),
    student_type TEXT DEFAULT 'College Undergraduate',
    institution TEXT DEFAULT '',
    roll_number TEXT DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ==============================================================================
-- 2. USER PREFERENCES & DASHBOARD CONFIG
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.user_preferences (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    theme TEXT NOT NULL DEFAULT 'system',
    widgets JSONB NOT NULL DEFAULT '[]'::jsonb,
    widget_config JSONB NOT NULL DEFAULT '{}'::jsonb,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ==============================================================================
-- 3. CATEGORIES
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('income', 'expense', 'both')),
    icon TEXT NOT NULL DEFAULT 'Tag',
    color TEXT NOT NULL DEFAULT '#64748B',
    is_custom BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT categories_user_name_type_unique UNIQUE (user_id, name, type)
);

CREATE INDEX IF NOT EXISTS idx_categories_user_id ON public.categories (user_id);

-- ==============================================================================
-- 4. TRANSACTIONS
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
    amount_paise BIGINT NOT NULL CHECK (amount_paise > 0),
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    date DATE NOT NULL,
    payment_method TEXT,
    description TEXT,
    is_recurring BOOLEAN NOT NULL DEFAULT false,
    debt_type TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ DEFAULT NULL
);

CREATE INDEX IF NOT EXISTS idx_transactions_user_date ON public.transactions (user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_user_deleted ON public.transactions (user_id, deleted_at);
CREATE INDEX IF NOT EXISTS idx_transactions_category ON public.transactions (category_id);

-- ==============================================================================
-- 5. BUDGETS
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.budgets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
    limit_paise BIGINT NOT NULL CHECK (limit_paise > 0),
    period TEXT NOT NULL CHECK (period IN ('monthly', 'yearly')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT budgets_user_category_period_unique UNIQUE (user_id, category_id, period)
);

CREATE INDEX IF NOT EXISTS idx_budgets_user_id ON public.budgets (user_id);

-- ==============================================================================
-- 6. SAVINGS GOALS & ALLOCATIONS
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.savings_goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    target_amount_paise BIGINT NOT NULL CHECK (target_amount_paise > 0),
    current_amount_paise BIGINT NOT NULL DEFAULT 0 CHECK (current_amount_paise >= 0),
    target_date DATE NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_savings_goals_user ON public.savings_goals (user_id);

CREATE TABLE IF NOT EXISTS public.savings_allocations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    goal_id UUID NOT NULL REFERENCES public.savings_goals(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    amount_paise BIGINT NOT NULL CHECK (amount_paise > 0),
    date DATE NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('deposit', 'withdrawal')),
    note TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_savings_allocations_goal ON public.savings_allocations (goal_id);
CREATE INDEX IF NOT EXISTS idx_savings_allocations_user ON public.savings_allocations (user_id);

-- ==============================================================================
-- ROW-LEVEL SECURITY (RLS) POLICIES
-- Strict isolation: Users can only select, insert, update, and delete their own records
-- ==============================================================================

-- 1. User Profiles RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
    ON public.user_profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
    ON public.user_profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON public.user_profiles FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- 2. User Preferences RLS
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own preferences"
    ON public.user_preferences FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own preferences"
    ON public.user_preferences FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences"
    ON public.user_preferences FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 3. Categories RLS
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own categories"
    ON public.categories FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own categories"
    ON public.categories FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own categories"
    ON public.categories FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own categories"
    ON public.categories FOR DELETE
    USING (auth.uid() = user_id);

-- 4. Transactions RLS
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own transactions"
    ON public.transactions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions"
    ON public.transactions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own transactions"
    ON public.transactions FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own transactions"
    ON public.transactions FOR DELETE
    USING (auth.uid() = user_id);

-- 5. Budgets RLS
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own budgets"
    ON public.budgets FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own budgets"
    ON public.budgets FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own budgets"
    ON public.budgets FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own budgets"
    ON public.budgets FOR DELETE
    USING (auth.uid() = user_id);

-- 6. Savings Goals RLS
ALTER TABLE public.savings_goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own savings goals"
    ON public.savings_goals FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own savings goals"
    ON public.savings_goals FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own savings goals"
    ON public.savings_goals FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own savings goals"
    ON public.savings_goals FOR DELETE
    USING (auth.uid() = user_id);

-- 7. Savings Allocations RLS
ALTER TABLE public.savings_allocations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own savings allocations"
    ON public.savings_allocations FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own savings allocations"
    ON public.savings_allocations FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own savings allocations"
    ON public.savings_allocations FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own savings allocations"
    ON public.savings_allocations FOR DELETE
    USING (auth.uid() = user_id);

-- ==============================================================================
-- AUTOMATIC NEW USER INITIALIZATION TRIGGER
-- Automatically provisions profile, default preferences, and baseline categories
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
    -- 1. Create profile record
    INSERT INTO public.user_profiles (id, email, name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1))
    );

    -- 2. Create preferences record
    INSERT INTO public.user_preferences (user_id, theme, widgets, widget_config)
    VALUES (
        NEW.id,
        'system',
        '[]'::jsonb,
        '{"showTrends": true, "privacyMode": false}'::jsonb
    );

    -- 3. Seed baseline categories for the new user
    INSERT INTO public.categories (user_id, name, type, icon, color, is_custom) VALUES
        (NEW.id, 'Food & Dining', 'expense', 'Utensils', '#EF4444', false),
        (NEW.id, 'Books & Supplies', 'expense', 'BookOpen', '#3B82F6', false),
        (NEW.id, 'Transport', 'expense', 'Bus', '#F59E0B', false),
        (NEW.id, 'Tuition & Fees', 'expense', 'GraduationCap', '#8B5CF6', false),
        (NEW.id, 'Hostel & Rent', 'expense', 'Home', '#10B981', false),
        (NEW.id, 'Entertainment', 'expense', 'Film', '#EC4899', false),
        (NEW.id, 'Personal Care', 'expense', 'Heart', '#06B6D4', false),
        (NEW.id, 'Pocket Money / Allowance', 'income', 'Wallet', '#10B981', false),
        (NEW.id, 'Scholarship', 'income', 'Award', '#3B82F6', false),
        (NEW.id, 'Part-time Job / Internship', 'income', 'Briefcase', '#8B5CF6', false),
        (NEW.id, 'Freelancing', 'income', 'Laptop', '#F59E0B', false);

    RETURN NEW;
END;
$$;

-- Drop trigger if existing, then recreate
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
