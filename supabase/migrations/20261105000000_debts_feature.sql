-- ==============================================================================
-- DEBTS & DEBT REPAYMENTS MIGRATION
-- Tracks money lent to others (assets receivable) and repayments over time
-- ==============================================================================

-- 1. DEBTS TABLE
CREATE TABLE IF NOT EXISTS public.debts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    person_name TEXT NOT NULL,
    phone_number TEXT,
    principal_amount_paise BIGINT NOT NULL CHECK (principal_amount_paise > 0),
    lent_date DATE NOT NULL,
    expected_repayment_date DATE,
    description TEXT,
    status TEXT NOT NULL CHECK (status IN ('active', 'partially_repaid', 'overdue', 'settled')) DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_debts_user_id ON public.debts (user_id);
CREATE INDEX IF NOT EXISTS idx_debts_lent_date ON public.debts (lent_date);
CREATE INDEX IF NOT EXISTS idx_debts_status ON public.debts (status);

-- 2. DEBT REPAYMENTS TABLE
CREATE TABLE IF NOT EXISTS public.debt_repayments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    debt_id UUID NOT NULL REFERENCES public.debts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    amount_paise BIGINT NOT NULL CHECK (amount_paise > 0),
    repayment_date DATE NOT NULL,
    note TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_debt_repayments_debt_id ON public.debt_repayments (debt_id);
CREATE INDEX IF NOT EXISTS idx_debt_repayments_user_id ON public.debt_repayments (user_id);
CREATE INDEX IF NOT EXISTS idx_debt_repayments_date ON public.debt_repayments (repayment_date);

-- ==============================================================================
-- ROW-LEVEL SECURITY (RLS) POLICIES
-- Strict isolation: Users can access only their own debt and repayment records
-- ==============================================================================

ALTER TABLE public.debts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own debts"
    ON public.debts FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own debts"
    ON public.debts FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own debts"
    ON public.debts FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own debts"
    ON public.debts FOR DELETE
    USING (auth.uid() = user_id);

ALTER TABLE public.debt_repayments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own debt repayments"
    ON public.debt_repayments FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own debt repayments"
    ON public.debt_repayments FOR INSERT
    WITH CHECK (
        auth.uid() = user_id
        AND EXISTS (
            SELECT 1 FROM public.debts
            WHERE debts.id = debt_repayments.debt_id
            AND debts.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update own debt repayments"
    ON public.debt_repayments FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own debt repayments"
    ON public.debt_repayments FOR DELETE
    USING (auth.uid() = user_id);
