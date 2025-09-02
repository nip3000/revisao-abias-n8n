import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { usePreferences } from '@/contexts/PreferencesContext';
import { useAccounts } from '@/hooks/useAccounts';
import { formatCurrency } from '@/utils/transactionUtils';
import { Transaction } from '@/types';
interface AccountsSummaryProps {
  transactions: Transaction[];
  hideValues: boolean;
}
const AccountsSummary: React.FC<AccountsSummaryProps> = ({
  transactions,
  hideValues
}) => {
  const {
    currency
  } = usePreferences();
  const {
    accounts
  } = useAccounts();
  const balances = React.useMemo(() => {
    const map = new Map<string, {
      name: string;
      amount: number;
    }>();

    // Criar mapa de contas para busca rápida
    const accountsMap = new Map(accounts.map(acc => [acc.id, acc.name]));

    // Buscar conta de cartão de crédito
    const creditCardAccount = accounts.find(acc => acc.type === 'credit_card');
    for (const t of transactions) {
      const accountId = (t as any).accountId || (t as any).account_id;
      let accountName = (t as any).accountName || (t as any).account?.name || accountsMap.get(accountId);

      // Se não tem conta definida, analisar o tipo de transação
      if (!accountId && !accountName) {
        const description = t.description?.toLowerCase() || '';
        if (description.includes('fatura') && description.includes('cartão')) {
          // Pagamentos de fatura: mostrar como "Pagamento Cartão"
          accountName = 'Pagamento Cartão';
        } else if (description.includes('cartão') || (t as any).creditCardId) {
          // Compras no cartão: mostrar como "Gastos no Cartão"
          accountName = 'Gastos no Cartão';
        } else {
          accountName = 'Conta Principal';
        }
      }

      // Se é conta de cartão de crédito, classificar melhor
      if (accountName === creditCardAccount?.name) {
        const description = t.description?.toLowerCase() || '';
        if (t.type === 'expense' && description.includes('fatura')) {
          accountName = 'Pagamento Cartão';
        } else if (t.type === 'expense') {
          accountName = 'Gastos no Cartão';
        }
      }
      const key = accountId || accountName;
      const delta = t.type === 'income' ? t.amount : -t.amount;
      const curr = map.get(key) || {
        name: accountName || 'Conta Principal',
        amount: 0
      };
      curr.amount += delta;
      curr.name = accountName || 'Conta Principal';
      map.set(key, curr);
    }
    return Array.from(map.values()).sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount)).slice(0, 6);
  }, [transactions, accounts]);
  if (balances.length === 0) return null;
  const renderHidden = () => '******';
  return <Card className="shadow-lg border-0">
      
    </Card>;
};
export default AccountsSummary;