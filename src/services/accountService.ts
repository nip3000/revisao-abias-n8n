import { supabase } from "@/integrations/supabase/client";
import { Account } from "@/types/accounts";

export const getAccounts = async (): Promise<Account[]> => {
  const { data, error } = await supabase
    .from('poupeja_accounts')
    .select(`
      *,
      poupeja_banks!bank_id (
        id,
        name,
        code
      )
    `)
    .order('is_default', { ascending: false })
    .order('name', { ascending: true });
  if (error) throw error;
  return data as Account[];
};

export const ensureDefaultAccount = async (): Promise<string | null> => {
  const { data, error } = await supabase.rpc('create_default_account_for_user');
  if (error) {
    console.warn('[accounts] ensureDefaultAccount error:', error);
    return null;
  }
  return data as string | null;
};

export const createAccount = async (payload: { name: string; bank_id?: string; account_number?: string; agency?: string; type?: string; is_default?: boolean; }): Promise<Account> => {
  const { data: auth } = await supabase.auth.getUser();
  if (!auth?.user) throw new Error('Not authenticated');

  // 1) Create the account WITHOUT toggling is_default to avoid unique constraint violations
  const { data, error } = await supabase
    .from('poupeja_accounts')
    .insert({
      user_id: auth.user.id,
      name: payload.name,
      bank_id: payload.bank_id || null,
      account_number: payload.account_number || null,
      agency: payload.agency || null,
      type: payload.type || 'checking',
      // don't set is_default here; handle via RPC to keep exclusivity
    })
    .select('*')
    .single();
  if (error) throw error;

  // 2) If requested as default, delegate to DB function that ensures exclusivity atomically
  if (payload.is_default && data?.id) {
    await setDefaultAccount(data.id);
  }

  return data as Account;
};

export const setDefaultAccount = async (accountId: string): Promise<boolean> => {
  const { error } = await supabase.rpc('set_default_account', { p_account_id: accountId });
  if (error) throw error;
  return true;
};

export const updateAccount = async (
  accountId: string,
  payload: { name?: string; bank_id?: string | null; account_number?: string | null; agency?: string | null; type?: string; is_default?: boolean }
): Promise<Account> => {
  // Build update payload without setting is_default=true here to avoid unique constraint race
  const updateData: Record<string, any> = {
    name: payload.name,
    bank_id: payload.bank_id ?? null,
    account_number: payload.account_number ?? null,
    agency: payload.agency ?? null,
    type: payload.type,
  };
  if (payload.is_default === false) {
    updateData.is_default = false;
  }

  const { data, error } = await supabase
    .from('poupeja_accounts')
    .update(updateData)
    .eq('id', accountId)
    .select('*')
    .single();
  if (error) throw error;

  // If toggling to default, do it via RPC which ensures exclusivity atomically
  if (payload.is_default) {
    await setDefaultAccount(accountId);
  }

  return data as Account;
};

export const deleteAccount = async (accountId: string): Promise<boolean> => {
  const { error } = await supabase
    .from('poupeja_accounts')
    .delete()
    .eq('id', accountId);
  if (error) throw error;
  return true;
};
