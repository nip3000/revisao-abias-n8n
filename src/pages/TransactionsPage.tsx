
import React, { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import SubscriptionGuard from '@/components/subscription/SubscriptionGuard';
import TransactionList from '@/components/common/TransactionList';
import TransactionForm from '@/components/common/TransactionForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, CheckSquare, Trash2 } from 'lucide-react';
import { useAppContext } from '@/contexts/AppContext';
import { Transaction } from '@/types';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { deleteMultipleTransactions } from '@/services/transactionService';
import { useToast } from '@/components/ui/use-toast';

const TransactionsPage = () => {
  const [formOpen, setFormOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [selectionMode, setSelectionMode] = useState(false);
  const { transactions, deleteTransaction, getTransactions } = useAppContext();
  const isMobile = useIsMobile();
  const { toast } = useToast();

  const handleAddTransaction = () => {
    setEditingTransaction(null);
    setFormOpen(true);
  };

  const handleEditTransaction = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setFormOpen(true);
  };

  const handleDeleteTransaction = (id: string) => {
    deleteTransaction(id);
  };

  const handleDeleteMultiple = async (ids: string[]) => {
    try {
      const success = await deleteMultipleTransactions(ids);
      
      if (success) {
        toast({
          title: "Sucesso",
          description: `${ids.length} transação(ões) excluída(s) com sucesso.`,
        });
        
        // Refresh transactions from the context
        await getTransactions();
      } else {
        toast({
          title: "Erro",
          description: "Não foi possível excluir as transações selecionadas.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error deleting multiple transactions:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao excluir as transações.",
        variant: "destructive",
      });
    }
  };

  const handleToggleSelectionMode = () => {
    setSelectionMode(!selectionMode);
  };

  return (
    <MainLayout>
      <SubscriptionGuard feature="movimentações ilimitadas">
        <div className="w-full px-4 py-4 md:py-8 pb-20 md:pb-8 min-h-0">
          {/* Desktop Add Button */}
          {!isMobile && (
            <div className="mb-6 flex items-center gap-2">
              <Button onClick={handleAddTransaction} size="lg">
                <Plus className="mr-2 h-4 w-4" />
                Adicionar Transação
              </Button>
              
              <Button 
                onClick={handleToggleSelectionMode} 
                variant="outline" 
                size="lg"
                className={cn(selectionMode && "bg-blue-50 border-blue-300")}
              >
                <CheckSquare className="mr-2 h-4 w-4" />
                {selectionMode ? "Cancelar Seleção" : "Selecionar Múltiplos"}
              </Button>
            </div>
          )}
          
          {/* Content Container */}
          <div className={cn(
            isMobile ? "space-y-4" : ""
          )}>
            {/* Header for Mobile */}
            {isMobile && (
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-xl font-semibold">Transações</h1>
                <Button 
                  onClick={handleToggleSelectionMode} 
                  variant="outline" 
                  size="sm"
                  className={cn(selectionMode && "bg-blue-50 border-blue-300")}
                >
                  <CheckSquare className="mr-1 h-4 w-4" />
                  {selectionMode ? "Cancelar" : "Selecionar"}
                </Button>
              </div>
            )}
            
            {/* Content */}
            {isMobile ? (
              <TransactionList 
                transactions={transactions}
                onEdit={handleEditTransaction}
                onDelete={handleDeleteTransaction}
                onDeleteMultiple={handleDeleteMultiple}
                selectionMode={selectionMode}
                onSelectionModeChange={setSelectionMode}
              />
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Transações Recentes</CardTitle>
                </CardHeader>
                <CardContent>
                  <TransactionList 
                    transactions={transactions}
                    onEdit={handleEditTransaction}
                    onDelete={handleDeleteTransaction}
                    onDeleteMultiple={handleDeleteMultiple}
                    selectionMode={selectionMode}
                    onSelectionModeChange={setSelectionMode}
                  />
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Mobile Floating Action Button */}
        {isMobile && (
          <div className="fixed bottom-20 right-4 z-50">
            <Button 
              onClick={handleAddTransaction}
              size="lg"
              className="h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-shadow bg-primary hover:bg-primary/90"
            >
              <Plus className="h-6 w-6" />
              <span className="sr-only">Adicionar Transação</span>
            </Button>
          </div>
        )}

        <TransactionForm
          open={formOpen}
          onOpenChange={setFormOpen}
          initialData={editingTransaction}
          mode={editingTransaction ? 'edit' : 'create'}
        />
      </SubscriptionGuard>
    </MainLayout>
  );
};

export default TransactionsPage;
