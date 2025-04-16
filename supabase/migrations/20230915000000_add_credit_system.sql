    -- Add credit-related fields to the profiles table
    ALTER TABLE public.profiles 
    ADD COLUMN IF NOT EXISTS credits_balance INTEGER NOT NULL DEFAULT 10,
    ADD COLUMN IF NOT EXISTS lifetime_credits INTEGER NOT NULL DEFAULT 10,
    ADD COLUMN IF NOT EXISTS last_credit_refresh_date TIMESTAMPTZ DEFAULT NULL;

    -- Create credit transactions table
    CREATE TABLE IF NOT EXISTS public.credit_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    amount INTEGER NOT NULL,
    description TEXT NOT NULL,
    transaction_type TEXT NOT NULL CHECK (transaction_type IN ('earn', 'spend')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    -- Create index for faster queries
    CREATE INDEX IF NOT EXISTS credit_transactions_user_id_idx ON public.credit_transactions(user_id);
    CREATE INDEX IF NOT EXISTS credit_transactions_created_at_idx ON public.credit_transactions(created_at);

    -- Update database types
    COMMENT ON TABLE public.credit_transactions IS 'Stores all credit transactions for users';
    COMMENT ON COLUMN public.profiles.credits_balance IS 'Current credit balance for the user';
    COMMENT ON COLUMN public.profiles.lifetime_credits IS 'Total credits earned by the user over time';
    COMMENT ON COLUMN public.profiles.last_credit_refresh_date IS 'Last date when credits were refreshed (for daily/weekly bonuses)';

    -- Function to increment a value (for incrementing lifetime credits)
    CREATE OR REPLACE FUNCTION public.increment(x INTEGER)
    RETURNS INTEGER AS $$
    BEGIN
    RETURN x + 1;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;

    -- Transaction functions for credit operations
    CREATE OR REPLACE FUNCTION public.begin_transaction()
    RETURNS RECORD AS $$
    DECLARE
    tx TEXT;
    BEGIN
    tx := (MD5(NOW()::TEXT || RANDOM()::TEXT));
    RETURN ROW(tx);
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;

    CREATE OR REPLACE FUNCTION public.commit_transaction(tid TEXT)
    RETURNS VOID AS $$
    BEGIN
    -- This is a placeholder in our example since we don't have actual transaction support in our custom functions
    -- In a real implementation, you'd use proper transaction management
    RETURN;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;

    CREATE OR REPLACE FUNCTION public.rollback_transaction(tid TEXT)
    RETURNS VOID AS $$
    BEGIN
    -- This is a placeholder in our example
    RETURN;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;

    -- Realtime publication for credit transactions
    BEGIN;
    DROP PUBLICATION IF EXISTS supabase_realtime;
    
    CREATE PUBLICATION supabase_realtime FOR TABLE 
        profiles, 
        credit_transactions;
    COMMIT;

    -- Enable row-level security
    ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;

    -- RLS policies for credit_transactions
    CREATE POLICY "Users can view their own transactions" 
    ON public.credit_transactions 
    FOR SELECT 
    USING (auth.uid() = user_id);

    CREATE POLICY "Service role can manage all transactions" 
    ON public.credit_transactions 
    USING (auth.role() = 'service_role'); 