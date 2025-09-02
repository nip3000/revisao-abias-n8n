
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import TransactionList from '@/components/common/TransactionList';
import AccountMovementReport from '@/components/dashboard/AccountMovementReport';
import CreditCardMovementReport from '@/components/dashboard/CreditCardMovementReport';
import UpcomingExpensesAlert from '@/components/dashboard/UpcomingExpensesAlert';
import GoalNavigation from '@/components/common/GoalNavigation';
import DashboardCharts from '@/components/dashboard/DashboardCharts';
import { usePreferences } from '@/contexts/PreferencesContext';
import { Goal, ScheduledTransaction } from '@/types';
import { motion } from 'framer-motion';
import AccountsSummary from '@/components/dashboard/AccountsSummary';

interface DashboardContentProps {
  filteredTransactions: any[];
  goals: Goal[];
  scheduledTransactions: ScheduledTransaction[];
  currentGoalIndex: number;
  currentMonth: Date;
  hideValues: boolean;
  onGoalChange: (index: number) => void;
  onEditTransaction: (transaction: any) => void;
  onDeleteTransaction: (id: string) => void;
  onMarkScheduledAsPaid: (transaction: ScheduledTransaction) => void;
}

const DashboardContent: React.FC<DashboardContentProps> = ({
  filteredTransactions,
  goals,
  scheduledTransactions,
  currentGoalIndex,
  currentMonth,
  hideValues,
  onGoalChange,
  onEditTransaction,
  onDeleteTransaction,
  onMarkScheduledAsPaid
}) => {
  const { t } = usePreferences();

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.3
      }
    }
  };

  return (
    <>
      {/* Alerta de despesas próximas */}
      <motion.div variants={itemVariants}>
        <UpcomingExpensesAlert 
          scheduledTransactions={scheduledTransactions} 
          onMarkAsPaid={onMarkScheduledAsPaid}
        />
      </motion.div>
      
      {/* Progresso das metas */}
      <motion.div variants={itemVariants}>
        <GoalNavigation goals={goals} currentGoalIndex={currentGoalIndex} onGoalChange={onGoalChange} />
      </motion.div>

      {/* Resumo por contas */}
      <motion.div variants={itemVariants}>
        <AccountsSummary transactions={filteredTransactions} hideValues={hideValues} />
      </motion.div>

      {/* Seção de gráficos */}
      <motion.div variants={itemVariants}>
        <DashboardCharts 
          currentMonth={currentMonth} 
          hideValues={hideValues}
          monthTransactions={filteredTransactions}
        />
      </motion.div>

      {/* Relatório de Movimentação de Cartões de Crédito */}
      <motion.div variants={itemVariants}>
        <CreditCardMovementReport 
          currentMonth={currentMonth}
          hideValues={hideValues}
        />
      </motion.div>

      {/* Relatório de Movimentação por Conta */}
      <motion.div variants={itemVariants}>
        <AccountMovementReport 
          transactions={filteredTransactions}
          currentMonth={currentMonth}
          hideValues={hideValues}
        />
      </motion.div>

      {/* Transações recentes */}
      <motion.div variants={itemVariants}>
        <Card className="shadow-lg border-0">
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold">{t('transactions.recent')}</h3>
              <Button variant="outline" asChild>
                <Link to="/transactions">{t('common.viewAll')}</Link>
              </Button>
            </div>
            <TransactionList 
              transactions={filteredTransactions.slice(0, 5)} 
              onEdit={onEditTransaction} 
              onDelete={onDeleteTransaction} 
              hideValues={hideValues} 
            />
            {filteredTransactions.length > 5 && (
              <div className="mt-6 text-center">
                <Button variant="outline" asChild>
                  <Link to="/transactions">{t('common.viewAll')}</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </>
  );
};

export default DashboardContent;
