import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Account } from '@/types/accounts';
import { getAccounts, createAccount, setDefaultAccount, deleteAccount, ensureDefaultAccount, updateAccount as svcUpdateAccount } from '@/services/accountService';

export const ACCOUNTS_QUERY_KEY = ['accounts'];

export const useAccounts = () => {
  const qc = useQueryClient();

  const query = useQuery<Account[]>({
    queryKey: ACCOUNTS_QUERY_KEY,
    queryFn: async () => {
      // Ensure there is a default
      await ensureDefaultAccount().catch(() => null);
      return getAccounts();
    }
  });

  const createMut = useMutation({
    mutationFn: createAccount,
    onSuccess: () => qc.invalidateQueries({ queryKey: ACCOUNTS_QUERY_KEY })
  });

  const setDefaultMut = useMutation({
    mutationFn: setDefaultAccount,
    onSuccess: () => qc.invalidateQueries({ queryKey: ACCOUNTS_QUERY_KEY })
  });

  const updateMut = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<Account> & { is_default?: boolean } }) =>
      svcUpdateAccount(id, {
        name: payload.name,
        bank_id: payload.bank_id ?? null,
        account_number: payload.account_number ?? null,
        agency: payload.agency ?? null,
        type: payload.type,
        is_default: payload.is_default,
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ACCOUNTS_QUERY_KEY })
  });

  const deleteMut = useMutation({
    mutationFn: deleteAccount,
    onSuccess: () => qc.invalidateQueries({ queryKey: ACCOUNTS_QUERY_KEY })
  });

  return {
    ...query,
    accounts: query.data || [],
    createAccount: createMut.mutateAsync,
    setDefaultAccount: setDefaultMut.mutateAsync,
    deleteAccount: deleteMut.mutateAsync,
    updateAccount: (id: string, payload: Partial<Account> & { is_default?: boolean }) => updateMut.mutateAsync({ id, payload }),
    isCreating: createMut.isPending,
    isSettingDefault: setDefaultMut.isPending,
    isDeleting: deleteMut.isPending,
    isUpdating: updateMut.isPending,
  };
};
