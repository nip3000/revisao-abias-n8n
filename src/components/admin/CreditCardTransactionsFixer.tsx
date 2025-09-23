import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { AlertTriangle, CheckCircle, RefreshCw, CreditCard, Wrench } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TransactionData {
  id: string;
  description: string;
  amount: number;
  date: string;
  credit_card_id: string;
  credit_cards: {
    name: string;
    user_id: string;
  };
}

interface FixResult {
  fixed_transactions: number;
  created_purchases: number;
  errors: string[];
}

const CreditCardTransactionsFixer: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [transactionsToFix, setTransactionsToFix] = useState<TransactionData[]>([]);
  const [fixResult, setFixResult] = useState<FixResult | null>(null);
  const { toast } = useToast();

  const checkProblematicTransactions = async () => {
    setIsChecking(true);
    try {
      const { data, error } = await supabase.functions.invoke('fix-credit-card-transactions', {
        method: 'GET'
      });

      if (error) throw error;

      setTransactionsToFix(data.transactions || []);
    } catch (error: any) {
      console.error('Error checking transactions:', error);
      toast({
        variant: "destructive",
        title: "Erro ao verificar transações",
        description: error.message || 'Erro desconhecido'
      });
    } finally {
      setIsChecking(false);
    }
  };

  const executeFixTransactions = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('fix-credit-card-transactions', {
        body: { action: 'fix' }
      });

      if (error) throw error;

      setFixResult(data.result);
      
      // Atualizar a lista após a correção
      await checkProblematicTransactions();

      toast({
        title: "Correção executada com sucesso!",
        description: `${data.result.fixed_transactions} transações corrigidas, ${data.result.created_purchases} compras criadas.`
      });

    } catch (error: any) {
      console.error('Error fixing transactions:', error);
      toast({
        variant: "destructive",
        title: "Erro ao executar correção",
        description: error.message || 'Erro desconhecido'
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkProblematicTransactions();
  }, []);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wrench className="h-5 w-5" />
            Correção de Transações de Cartão de Crédito
          </CardTitle>
          <CardDescription>
            Ferramenta para corrigir transações que foram inseridas incorretamente na tabela de transações
            ao invés de serem criadas como compras de cartão de crédito.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Button 
              onClick={checkProblematicTransactions}
              disabled={isChecking}
              variant="outline"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isChecking ? 'animate-spin' : ''}`} />
              Verificar Transações
            </Button>
            
            {transactionsToFix.length > 0 && (
              <Button 
                onClick={executeFixTransactions}
                disabled={isLoading}
                variant="default"
              >
                {isLoading ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <CheckCircle className="h-4 w-4 mr-2" />
                )}
                Corrigir {transactionsToFix.length} Transações
              </Button>
            )}
          </div>

          {/* Status das Transações */}
          {!isChecking && (
            <Alert className={transactionsToFix.length > 0 ? "border-yellow-500" : "border-green-500"}>
              {transactionsToFix.length > 0 ? (
                <AlertTriangle className="h-4 w-4" />
              ) : (
                <CheckCircle className="h-4 w-4" />
              )}
              <AlertDescription>
                {transactionsToFix.length === 0 ? (
                  "✅ Nenhuma transação problemática encontrada. Todas as transações de cartão estão corretas."
                ) : (
                  <>
                    ⚠️ Encontradas <strong>{transactionsToFix.length} transações</strong> que precisam ser corrigidas.
                    <br />
                    Essas transações estão impactando o limite do cartão mas não aparecendo nas faturas.
                  </>
                )}
              </AlertDescription>
            </Alert>
          )}

          {/* Lista de Transações Problemáticas */}
          {transactionsToFix.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Transações que serão corrigidas:</h4>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {transactionsToFix.map((transaction) => (
                  <div 
                    key={transaction.id}
                    className="flex items-center justify-between p-3 bg-muted rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4 text-blue-500" />
                        <span className="font-medium">{transaction.description}</span>
                        <Badge variant="outline">{transaction.credit_cards.name}</Badge>
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        {new Date(transaction.date).toLocaleDateString('pt-BR')}
                      </div>
                    </div>
                    <div className="font-bold text-red-600">
                      -R$ {transaction.amount.toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Resultado da Última Correção */}
          {fixResult && (
            <Alert className="border-green-500">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Última correção executada:</strong>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>{fixResult.fixed_transactions} transações removidas da tabela de transações</li>
                  <li>{fixResult.created_purchases} compras de cartão criadas</li>
                  <li>Faturas e limites recalculados automaticamente</li>
                  {fixResult.errors.length > 0 && (
                    <li className="text-red-600">
                      {fixResult.errors.length} erros encontrados - verifique os logs
                    </li>
                  )}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {/* Instruções */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">ℹ️ Como funciona a correção:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>1. Identifica transações de despesa com <code>credit_card_id</code></li>
              <li>2. Cria compras correspondentes na tabela <code>credit_card_purchases</code></li>
              <li>3. Remove as transações incorretas da tabela <code>poupeja_transactions</code></li>
              <li>4. Gera faturas automaticamente para os cartões afetados</li>
              <li>5. Recalcula os limites dos cartões baseado nas faturas</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreditCardTransactionsFixer;