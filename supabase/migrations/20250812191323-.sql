-- Create accounts table and integrate with transactions
-- 1) Create poupeja_accounts table
CREATE TABLE IF NOT EXISTS public.poupeja_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  bank_name TEXT,
  type TEXT NOT NULL DEFAULT 'checking', -- checking, savings, cash, credit_card
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.poupeja_accounts ENABLE ROW LEVEL SECURITY;

-- Policies
DO $$ BEGIN
  -- SELECT
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'poupeja_accounts' AND policyname = 'Users can view their own accounts'
  ) THEN
    CREATE POLICY "Users can view their own accounts"
    ON public.poupeja_accounts
    FOR SELECT
    USING (auth.uid() = user_id);
  END IF;

  -- INSERT
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'poupeja_accounts' AND policyname = 'Users can insert their own accounts'
  ) THEN
    CREATE POLICY "Users can insert their own accounts"
    ON public.poupeja_accounts
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);
  END IF;

  -- UPDATE
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'poupeja_accounts' AND policyname = 'Users can update their own accounts'
  ) THEN
    CREATE POLICY "Users can update their own accounts"
    ON public.poupeja_accounts
    FOR UPDATE
    USING (auth.uid() = user_id);
  END IF;

  -- DELETE
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'poupeja_accounts' AND policyname = 'Users can delete their own accounts'
  ) THEN
    CREATE POLICY "Users can delete their own accounts"
    ON public.poupeja_accounts
    FOR DELETE
    USING (auth.uid() = user_id);
  END IF;

  -- ALL convenience policy
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'poupeja_accounts' AND policyname = 'Users can manage own accounts'
  ) THEN
    CREATE POLICY "Users can manage own accounts"
    ON public.poupeja_accounts
    FOR ALL
    USING (user_id = auth.uid());
  END IF;
END $$;

-- Keep updated_at fresh
DROP TRIGGER IF EXISTS tr_accounts_update_timestamp ON public.poupeja_accounts;
CREATE TRIGGER tr_accounts_update_timestamp
BEFORE UPDATE ON public.poupeja_accounts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column_safe();

-- Ensure only one default account per user
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND tablename = 'poupeja_accounts' AND indexname = 'unique_default_account_per_user'
  ) THEN
    CREATE UNIQUE INDEX unique_default_account_per_user
    ON public.poupeja_accounts(user_id)
    WHERE is_default;
  END IF;
END $$;

-- 2) Add account_id to transactions
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'poupeja_transactions' AND column_name = 'account_id'
  ) THEN
    ALTER TABLE public.poupeja_transactions ADD COLUMN account_id UUID NULL;
  END IF;
END $$;

-- FK and index for account_id
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'poupeja_transactions_account_fk'
  ) THEN
    ALTER TABLE public.poupeja_transactions
      ADD CONSTRAINT poupeja_transactions_account_fk
      FOREIGN KEY (account_id)
      REFERENCES public.poupeja_accounts(id)
      ON DELETE SET NULL;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND tablename = 'poupeja_transactions' AND indexname = 'idx_transactions_account_id'
  ) THEN
    CREATE INDEX idx_transactions_account_id ON public.poupeja_transactions(account_id);
  END IF;
END $$;

-- 3) Helper functions for defaults
CREATE OR REPLACE FUNCTION public.create_default_account_for_user(p_user_id UUID DEFAULT auth.uid())
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_default_id UUID;
  v_any_id UUID;
BEGIN
  -- Return existing default if present
  SELECT id INTO v_default_id
  FROM public.poupeja_accounts
  WHERE user_id = p_user_id AND is_default
  LIMIT 1;

  IF v_default_id IS NOT NULL THEN
    RETURN v_default_id;
  END IF;

  -- If user has any account, set first as default
  SELECT id INTO v_any_id
  FROM public.poupeja_accounts
  WHERE user_id = p_user_id
  LIMIT 1;

  IF v_any_id IS NOT NULL THEN
    UPDATE public.poupeja_accounts
    SET is_default = false
    WHERE user_id = p_user_id AND is_default;

    UPDATE public.poupeja_accounts
    SET is_default = true
    WHERE id = v_any_id AND user_id = p_user_id
    RETURNING id INTO v_default_id;

    RETURN v_default_id;
  END IF;

  -- Create a new default account
  INSERT INTO public.poupeja_accounts (user_id, name, bank_name, type, is_default)
  VALUES (p_user_id, 'Conta Principal', NULL, 'checking', true)
  RETURNING id INTO v_default_id;

  RETURN v_default_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.set_default_account(p_account_id UUID, p_user_id UUID DEFAULT auth.uid())
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_owner UUID;
BEGIN
  SELECT user_id INTO v_owner FROM public.poupeja_accounts WHERE id = p_account_id;
  IF v_owner IS NULL OR v_owner <> p_user_id THEN
    RAISE EXCEPTION 'Account does not belong to user';
  END IF;

  UPDATE public.poupeja_accounts SET is_default = false WHERE user_id = p_user_id AND is_default;
  UPDATE public.poupeja_accounts SET is_default = true WHERE id = p_account_id;
  RETURN TRUE;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_default_account_id(p_user_id UUID DEFAULT auth.uid())
RETURNS UUID
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT id FROM public.poupeja_accounts WHERE user_id = p_user_id AND is_default LIMIT 1;
$$;