import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Trash2, Receipt, Calendar } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { CreditCardBill, CreditCardPayment } from "@/types/creditCards";
import { creditCardService } from "@/services/creditCardService";
import { useToast } from "@/hooks/use-toast";

interface BillPaymentsListProps {
  bill: CreditCardBill;
  onUpdate: () => void;
}

export function BillPaymentsList({ bill, onUpdate }: BillPaymentsListProps) {
  const [payments, setPayments] = useState<CreditCardPayment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedPaymentForDeletion, setSelectedPaymentForDeletion] = useState<CreditCardPayment | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadPayments();
  }, [bill.id]);

  const loadPayments = async () => {
    try {
      setIsLoading(true);
      const billPayments = await creditCardService.getPaymentsByBill(bill.id);
      setPayments(billPayments);
    } catch (error) {
      console.error('Erro ao carregar pagamentos:', error);
      toast({
        title: "Erro ao carregar pagamentos",
        description: "Não foi possível carregar os pagamentos desta fatura.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeletePayment = (payment: CreditCardPayment) => {
    setSelectedPaymentForDeletion(payment);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeletePayment = async () => {
    if (!selectedPaymentForDeletion) return;
    
    setIsDeleting(true);
    try {
      await creditCardService.deletePayment(selectedPaymentForDeletion.id);
      
      toast({
        title: "Pagamento excluído",
        description: `Pagamento de ${formatCurrency(selectedPaymentForDeletion.amount)} foi excluído com sucesso.`,
      });
      
      await loadPayments();
      onUpdate();
    } catch (error: any) {
      toast({
        title: "Erro ao excluir pagamento",
        description: error.message || "Ocorreu um erro ao tentar excluir o pagamento.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
      setSelectedPaymentForDeletion(null);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Carregando pagamentos...</div>
        </CardContent>
      </Card>
    );
  }

  if (payments.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Pagamentos da Fatura
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-8">
            <Receipt className="h-12 w-12 mx-auto mb-4 opacity-30" />
            <p className="font-medium">Nenhum pagamento encontrado</p>
            <p className="text-sm">Esta fatura não possui pagamentos registrados</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Receipt className="h-5 w-5" />
              Pagamentos da Fatura
            </div>
            <span className="text-sm font-normal text-muted-foreground">
              {payments.length} pagamento{payments.length !== 1 ? 's' : ''}
            </span>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-3">
          {payments.map((payment) => (
            <div key={payment.id} className="p-4 border rounded-lg bg-background">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium text-lg text-primary">
                      {formatCurrency(payment.amount)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Data: {new Date(payment.payment_date).toLocaleDateString('pt-BR')}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Método: {payment.payment_method}
                    </p>
                    {payment.notes && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Obs: {payment.notes}
                      </p>
                    )}
                  </div>
                </div>
                
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDeletePayment(payment)}
                  className="gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  Excluir
                </Button>
              </div>
            </div>
          ))}
          
          {/* Resumo dos pagamentos */}
          <div className="mt-4 p-3 bg-primary/10 border border-primary/20 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-primary">
                Total pago:
              </span>
              <span className="font-semibold text-primary">
                {formatCurrency(payments.reduce((sum, payment) => sum + payment.amount, 0))}
              </span>
            </div>
          </div>
          
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-sm text-amber-800">
              <strong>💡 Dica:</strong> Para excluir esta fatura, você precisa remover todos os pagamentos primeiro.
              Clique em "Excluir" ao lado de cada pagamento para removê-los.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Dialog de confirmação para exclusão de pagamento */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão do Pagamento</AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <p>
                Você está prestes a excluir o pagamento de{" "}
                <strong>
                  {selectedPaymentForDeletion && formatCurrency(selectedPaymentForDeletion.amount)}
                </strong>
                {selectedPaymentForDeletion && (
                  <span>
                    {" "}realizado em{" "}
                    <strong>
                      {new Date(selectedPaymentForDeletion.payment_date).toLocaleDateString('pt-BR')}
                    </strong>
                  </span>
                )}.
              </p>
              
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                <p className="text-sm font-medium text-destructive">⚠️ ATENÇÃO</p>
                <ul className="text-sm text-destructive/80 mt-2 space-y-1">
                  <li>• Esta ação é irreversível</li>
                  <li>• O valor pago será removido da fatura</li>
                  <li>• O saldo em aberto da fatura será recalculado</li>
                  <li>• Os limites do cartão podem ser afetados</li>
                </ul>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeletePayment}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Excluindo..." : "Excluir Pagamento"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}