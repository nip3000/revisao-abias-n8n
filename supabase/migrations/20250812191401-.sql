-- Harden search_path for newly created functions
CREATE OR REPLACE FUNCTION public.create_default_account_for_user(p_user_id UUID DEFAULT auth.uid())
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = 'public'
AS $$
DECLARE
  v_default_id UUID;
  v_any_id UUID;
BEGIN
  SELECT id INTO v_default_id
  FROM public.poupeja_accounts
  WHERE user_id = p_user_id AND is_default
  LIMIT 1;

  IF v_default_id IS NOT NULL THEN
    RETURN v_default_id;
  END IF;

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

  INSERT INTO public.poupeja_accounts (user_id, name, bank_name, type, is_default)
  VALUES (p_user_id, 'Conta Principal', NULL, 'checking', true)
  RETURNING id INTO v_default_id;

  RETURN v_default_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.set_default_account(p_account_id UUID, p_user_id UUID DEFAULT auth.uid())
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = 'public'
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
SECURITY DEFINER SET search_path = 'public'
AS $$
  SELECT id FROM public.poupeja_accounts WHERE user_id = p_user_id AND is_default LIMIT 1;
$$;