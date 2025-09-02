import React, { useEffect } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { useAccounts } from '@/hooks/useAccounts';
import { TransactionFormValues } from '@/schemas/transactionSchema';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface AccountSelectorProps {
  form: UseFormReturn<TransactionFormValues>;
}

const AccountSelector: React.FC<AccountSelectorProps> = ({ form }) => {
  const { accounts, isLoading } = useAccounts();

  // Set default account when available
  useEffect(() => {
    const current = form.getValues('accountId');
    if (!current && accounts.length > 0) {
      const def = accounts.find(a => a.is_default) || accounts[0];
      form.setValue('accountId', def.id, { shouldValidate: true });
    }
  }, [accounts]);

  return (
    <div className="space-y-2">
      <Label htmlFor="account">Conta</Label>
      <Select
        value={form.watch('accountId') || ''}
        onValueChange={(val) => form.setValue('accountId', val, { shouldValidate: true })}
        disabled={isLoading}
      >
        <SelectTrigger id="account">
          <SelectValue placeholder={isLoading ? 'Carregando...' : 'Selecione a conta'} />
        </SelectTrigger>
        <SelectContent className="z-[60] bg-popover">
          {accounts.map(acc => (
            <SelectItem key={acc.id} value={acc.id}>
              {acc.name}{acc.bank_name ? ` • ${acc.bank_name}` : ''}{acc.is_default ? ' • Padrão' : ''}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default AccountSelector;
