import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { usePreferences } from '@/contexts/PreferencesContext';
import { useAccounts } from '@/hooks/useAccounts';
import { motion } from 'framer-motion';
import { formatCurrency } from '@/utils/transactionUtils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Transaction {
  id: string;
  amount: number;
  type: 'income' | 'expense';
  date: string;
  accountId?: string;
  account_id?: string;
  accountName?: string;
  account?: {
    id: string;
    name: string;
    type: string;
  };
}

interface AccountMovementReportProps {
  transactions: Transaction[];
  currentMonth: Date;
  hideValues: boolean;
}

interface AccountSummary {
  id: string;
  name: string;
  color: string;
  lastTransaction: string;
  transactionCount: number;
  income: number;
  expense: number;
  balance: number;
}

const AccountMovementReport: React.FC<AccountMovementReportProps> = ({
  transactions,
  currentMonth,
  hideValues
}) => {
  const { t } = usePreferences();
  const { accounts } = useAccounts();

  // Cores predefinidas para as contas
  const accountColors = [
    '#EF4444', // vermelho
    '#10B981', // verde
    '#3B82F6', // azul
    '#F59E0B', // amarelo
    '#8B5CF6', // roxo
    '#EC4899', // rosa
    '#F97316', // laranja
    '#6B7280', // cinza
  ];

  const accountSummaries = useMemo(() => {
    const accountMap = new Map<string, AccountSummary>();
    
    // Criar mapa de contas para busca rápida
    const accountsMap = new Map(accounts.map(acc => [acc.id, acc.name]));
    
    transactions.forEach((transaction, index) => {
      const accountId = transaction.accountId || transaction.account_id || 'default';
      const accountName = transaction.accountName || 
                         transaction.account?.name ||
                         accountsMap.get(accountId) || 
                         'Conta Principal';
      
      if (!accountMap.has(accountId)) {
        accountMap.set(accountId, {
          id: accountId,
          name: accountName,
          color: accountColors[accountMap.size % accountColors.length],
          lastTransaction: transaction.date,
          transactionCount: 0,
          income: 0,
          expense: 0,
          balance: 0
        });
      }

      const summary = accountMap.get(accountId)!;
      summary.transactionCount++;
      
      // Atualizar última transação (mais recente)
      if (new Date(transaction.date) > new Date(summary.lastTransaction)) {
        summary.lastTransaction = transaction.date;
      }

      if (transaction.type === 'income') {
        summary.income += transaction.amount;
      } else {
        summary.expense += transaction.amount;
      }
      
      summary.balance = summary.income - summary.expense;
    });

    return Array.from(accountMap.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [transactions, accounts]);

  const totals = useMemo(() => ({
    income: accountSummaries.reduce((sum, acc) => sum + acc.income, 0),
    expense: accountSummaries.reduce((sum, acc) => sum + acc.expense, 0),
    balance: accountSummaries.reduce((sum, acc) => sum + acc.balance, 0),
    transactionCount: accountSummaries.reduce((sum, acc) => sum + acc.transactionCount, 0)
  }), [accountSummaries]);

  const monthName = format(currentMonth, 'MMMM', { locale: ptBR });

  const formatValue = (value: number) => {
    if (hideValues) return '***';
    return formatCurrency(value, 'BRL');
  };

  const formatDate = (dateStr: string) => {
    return format(new Date(dateStr), 'dd \'de\' MMM. \'de\' yyyy', { locale: ptBR });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="shadow-lg border-0">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-semibold">
            Movimentação por Conta - {monthName}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="text-left p-4 font-medium text-muted-foreground">Conta</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Última Transação</th>
                  <th className="text-center p-4 font-medium text-muted-foreground">Qtd. Transações</th>
                  <th className="text-right p-4 font-medium text-muted-foreground">Receitas</th>
                  <th className="text-right p-4 font-medium text-muted-foreground">Despesas</th>
                  <th className="text-right p-4 font-medium text-muted-foreground">Saldo</th>
                </tr>
              </thead>
              <tbody>
                {accountSummaries.map((account, index) => (
                  <tr 
                    key={account.id}
                    className="border-b border-border/30 hover:bg-muted/50 transition-colors"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: account.color }}
                        />
                        <span className="font-medium">{account.name}</span>
                      </div>
                    </td>
                    <td className="p-4 text-muted-foreground">
                      {formatDate(account.lastTransaction)}
                    </td>
                    <td className="p-4 text-center text-muted-foreground">
                      {account.transactionCount}
                    </td>
                    <td className="p-4 text-right">
                      <span className="text-green-600 font-medium">
                        ↑ {formatValue(account.income)}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <span className="text-red-600 font-medium">
                        ↓ {formatValue(account.expense)}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <span 
                        className={`font-medium ${
                          account.balance >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        {formatValue(account.balance)}
                      </span>
                    </td>
                  </tr>
                ))}
                
                {/* Linha de total */}
                <tr className="border-t-2 border-border bg-muted/30 font-semibold">
                  <td className="p-4">
                    <span className="font-bold">Total Geral</span>
                  </td>
                  <td className="p-4"></td>
                  <td className="p-4 text-center">
                    {totals.transactionCount}
                  </td>
                  <td className="p-4 text-right">
                    <span className="text-green-600 font-bold">
                      {formatValue(totals.income)}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <span className="text-red-600 font-bold">
                      {formatValue(totals.expense)}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <span 
                      className={`font-bold ${
                        totals.balance >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {formatValue(totals.balance)}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default AccountMovementReport;