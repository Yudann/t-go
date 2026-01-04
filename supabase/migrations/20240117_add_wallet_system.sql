-- Wallet System Schema & Logic
-- Run this in Supabase SQL Editor

--------------------------------------------------------------
-- 1. Create Wallets Table
--------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.wallets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) NOT NULL UNIQUE,
    balance DECIMAL(15, 2) DEFAULT 0.00 NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

--------------------------------------------------------------
-- 2. Create Wallet Transactions Table
--------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.wallet_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    wallet_id UUID REFERENCES public.wallets(id) NOT NULL,
    type VARCHAR(20) NOT NULL, -- 'topup', 'payment', 'refund'
    amount DECIMAL(15, 2) NOT NULL,
    balance_before DECIMAL(15, 2) NOT NULL,
    balance_after DECIMAL(15, 2) NOT NULL,
    description TEXT,
    reference_id VARCHAR(100), -- Ticket ID or other reference
    reference_type VARCHAR(50), -- 'ticket', 'promo', etc
    status VARCHAR(20) DEFAULT 'completed', -- 'pending', 'completed', 'failed'
    payment_method VARCHAR(50), -- 'bank', 'ewallet', 'etc'
    external_transaction_id VARCHAR(100),
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

--------------------------------------------------------------
-- 3. Enable RLS
--------------------------------------------------------------
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;

-- Wallets: Users can view their own wallet
DROP POLICY IF EXISTS "Users can view own wallet" ON public.wallets;
CREATE POLICY "Users can view own wallet" ON public.wallets FOR SELECT USING (auth.uid() = user_id);

-- Wallet Transactions: Users can view their own transactions
DROP POLICY IF EXISTS "Users can view own transactions" ON public.wallet_transactions;
CREATE POLICY "Users can view own transactions" ON public.wallet_transactions FOR SELECT USING (auth.uid() = user_id);

--------------------------------------------------------------
-- 4. RPC Function: PROCESS_TOPUP
--------------------------------------------------------------
CREATE OR REPLACE FUNCTION process_topup(
    p_user_id UUID,
    p_amount DECIMAL,
    p_payment_method VARCHAR,
    p_external_transaction_id VARCHAR,
    p_metadata JSONB DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_wallet_id UUID;
    v_balance_before DECIMAL;
    v_balance_after DECIMAL;
    v_transaction_id UUID;
BEGIN
    -- 1. Get or Create Wallet
    SELECT id, balance INTO v_wallet_id, v_balance_before
    FROM public.wallets
    WHERE user_id = p_user_id
    FOR UPDATE; -- Lock row

    IF v_wallet_id IS NULL THEN
        INSERT INTO public.wallets (user_id, balance)
        VALUES (p_user_id, 0)
        RETURNING id, balance INTO v_wallet_id, v_balance_before;
    END IF;

    -- 2. Calculate New Balance
    v_balance_after := v_balance_before + p_amount;

    -- 3. Update Wallet Balance
    UPDATE public.wallets
    SET balance = v_balance_after,
        updated_at = NOW()
    WHERE id = v_wallet_id;

    -- 4. Create Transaction Record
    INSERT INTO public.wallet_transactions (
        user_id, wallet_id, type, amount, balance_before, balance_after,
        description, status, payment_method, external_transaction_id, metadata
    )
    VALUES (
        p_user_id, v_wallet_id, 'topup', p_amount, v_balance_before, v_balance_after,
        'Top Up Saldo T-GO Pay', 'completed', p_payment_method, p_external_transaction_id, p_metadata
    )
    RETURNING id INTO v_transaction_id;

    RETURN json_build_object(
        'success', true,
        'transaction_id', v_transaction_id,
        'balance_before', v_balance_before,
        'balance_after', v_balance_after,
        'amount', p_amount
    );
END;
$$;

--------------------------------------------------------------
-- 5. RPC Function: PROCESS_PAYMENT
--------------------------------------------------------------
CREATE OR REPLACE FUNCTION process_payment(
    p_user_id UUID,
    p_amount DECIMAL,
    p_description VARCHAR,
    p_reference_id VARCHAR DEFAULT NULL,
    p_reference_type VARCHAR DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_wallet_id UUID;
    v_balance_before DECIMAL;
    v_balance_after DECIMAL;
    v_transaction_id UUID;
BEGIN
    -- 1. Get Wallet
    SELECT id, balance INTO v_wallet_id, v_balance_before
    FROM public.wallets
    WHERE user_id = p_user_id
    FOR UPDATE;

    IF v_wallet_id IS NULL THEN
        RAISE EXCEPTION 'Wallet not found';
    END IF;

    -- 2. Check Balance
    IF v_balance_before < p_amount THEN
        RAISE EXCEPTION 'Insufficient balance';
    END IF;

    -- 3. Calculate New Balance
    v_balance_after := v_balance_before - p_amount;

    -- 4. Update Wallet Balance
    UPDATE public.wallets
    SET balance = v_balance_after,
        updated_at = NOW()
    WHERE id = v_wallet_id;

    -- 5. Create Transaction Record
    INSERT INTO public.wallet_transactions (
        user_id, wallet_id, type, amount, balance_before, balance_after,
        description, reference_id, reference_type, status
    )
    VALUES (
        p_user_id, v_wallet_id, 'payment', p_amount, v_balance_before, v_balance_after,
        p_description, p_reference_id, p_reference_type, 'completed'
    )
    RETURNING id INTO v_transaction_id;

    RETURN json_build_object(
        'success', true,
        'transaction_id', v_transaction_id,
        'balance_before', v_balance_before,
        'balance_after', v_balance_after,
        'amount', p_amount
    );
END;
$$;
