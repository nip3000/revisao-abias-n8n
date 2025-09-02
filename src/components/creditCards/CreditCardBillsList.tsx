import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Calendar, DollarSign, CreditCard, ChevronLeft, ChevronRight, Trash2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { CreditCardBill } from "@/types/creditCards";
import { CreditCardPaymentForm } from "./CreditCardPaymentForm";
import { BillPaymentsList } from "./BillPaymentsList";
import { creditCardService } from "@/services/creditCardService";
import { useToast } from "@/hooks/use-toast";

interface CreditCardBillsListProps {
  bills: CreditCardBill[];
  isLoading: boolean;
  cardId: string;
  onUpdate: () => void;
}

export function CreditCardBillsList({ bills, isLoading, cardId, onUpdate }: CreditCardBillsListProps) {
  const [isPaymentFormOpen, setIsPaymentFormOpen] = useState(false);
  const [selectedBillForPayment, setSelectedBillForPayment] = useState<CreditCardBill | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedBillForDeletion, setSelectedBillForDeletion] = useState<CreditCardBill | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();
  
  // Calendar-style navigation state
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());

  // Get bills organized by date (most recent first)
  const sortedBills = bills.sort((a, b) => {
    const dateA = new Date(a.reference_year, a.reference_month - 1);
    const dateB = new Date(b.reference_year, b.reference_month - 1);
    return dateB.getTime() - dateA.getTime(); // Most recent first
  });

  // Filter bills for the selected month/year
  const currentMonthBill = bills.find(bill => 
    bill.reference_month === selectedMonth && bill.reference_year === selectedYear
  );

  // Get bills with outstanding balance
  const billsWithBalance = bills.filter(bill => bill.remaining_amount > 0);

  // Find the most urgent unpaid bill
  const mostUrgentBill = billsWithBalance.sort((a, b) => {
    const dateA = new Date(a.due_date);
    const dateB = new Date(b.due_date);
    return dateA.getTime() - dateB.getTime();
  })[0];

  // Navigation functions
  const navigateToPreviousMonth = () => {
    if (selectedMonth === 1) {
      setSelectedMonth(12);
      setSelectedYear(selectedYear - 1);
    } else {
      setSelectedMonth(selectedMonth - 1);
    }
  };

  const navigateToNextMonth = () => {
    if (selectedMonth === 12) {
      setSelectedMonth(1);
      setSelectedYear(selectedYear + 1);
    } else {
      setSelectedMonth(selectedMonth + 1);
    }
  };

  const handlePayBill = (bill: CreditCardBill) => {
    setSelectedBillForPayment(bill);
    setIsPaymentFormOpen(true);
  };

  const handlePaymentSuccess = () => {
    setIsPaymentFormOpen(false);
    setSelectedBillForPayment(null);
    onUpdate();
  };

  const handleDeleteBill = (bill: CreditCardBill) => {
    setSelectedBillForDeletion(bill);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteBill = async () => {
    if (!selectedBillForDeletion) return;
    
    setIsDeleting(true);
    try {
      await creditCardService.deleteBill(selectedBillForDeletion.id);
      
      toast({
        title: "Fatura excluída",
        description: `A fatura de ${formatBillMonthYear(selectedBillForDeletion.reference_month, selectedBillForDeletion.reference_year)} foi excluída com sucesso.`,
      });
      
      onUpdate();
    } catch (error: any) {
      toast({
        title: "Erro ao excluir fatura",
        description: error.message || "Ocorreu um erro ao tentar excluir a fatura.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
      setSelectedBillForDeletion(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'default';
      case 'overdue':
        return 'destructive';
      case 'closed':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'paid':
        return 'Paga';
      case 'overdue':
        return 'Vencida';
      case 'closed':
        return 'Fechada';
      case 'open':
        return 'Aberta';
      default:
        return 'Pendente';
    }
  };

  const getMonthName = (month: number) => {
    const months = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    return months[month - 1];
  };

  const formatBillMonthYear = (month: number, year: number) => {
    return `${getMonthName(month)} de ${year}`;
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Carregando faturas...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Faturas</span>
          {mostUrgentBill && (
            <Button 
              size="sm" 
              onClick={() => handlePayBill(mostUrgentBill)}
              className="gap-2"
            >
              <CreditCard className="h-4 w-4" />
              Pagar Fatura
            </Button>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Month Navigation */}
        <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
          <Button
            variant="outline"
            size="sm"
            onClick={navigateToPreviousMonth}
            className="gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Anterior
          </Button>
          
          <h2 className="text-xl font-semibold text-center">
            {formatBillMonthYear(selectedMonth, selectedYear)}
          </h2>
          
          <Button
            variant="outline"
            size="sm"
            onClick={navigateToNextMonth}
            className="gap-2"
          >
            Próximo
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Current Month Bill Display */}
        {currentMonthBill ? (
          <div className="p-6 border rounded-lg bg-primary/5 border-primary/20">
            {/* Cabeçalho da fatura com status */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-xl">
                {formatBillMonthYear(currentMonthBill.reference_month, currentMonthBill.reference_year)}
              </h3>
              <Badge variant={getStatusColor(currentMonthBill.status)} className="text-sm">
                {getStatusText(currentMonthBill.status)}
              </Badge>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {/* Valores principais */}
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium text-2xl text-primary">
                      {formatCurrency(currentMonthBill.total_amount)}
                    </p>
                    <p className="text-sm text-muted-foreground">Valor total da fatura</p>
                  </div>
                </div>
                
                {currentMonthBill.remaining_amount > 0 && (
                  <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                    <p className="font-medium text-destructive text-lg">
                      {formatCurrency(currentMonthBill.remaining_amount)}
                    </p>
                    <p className="text-sm text-destructive/80">Valor em aberto</p>
                  </div>
                )}
              </div>

              {/* Datas e informações */}
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Vencimento</p>
                  <p className="font-medium">
                    {new Date(currentMonthBill.due_date).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm text-muted-foreground">Fechamento</p>
                  <p className="font-medium">
                    {new Date(currentMonthBill.closing_date).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                
                {currentMonthBill.minimum_payment > 0 && (
                  <div>
                    <p className="text-sm text-muted-foreground">Pagamento mínimo</p>
                    <p className="font-medium text-amber-600">
                      {formatCurrency(currentMonthBill.minimum_payment)}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Ações da fatura */}
            <div className="mt-4 pt-4 border-t space-y-3">
              {currentMonthBill.remaining_amount > 0 && (
                <Button 
                  onClick={() => handlePayBill(currentMonthBill)}
                  className="w-full gap-2"
                >
                  <CreditCard className="h-4 w-4" />
                  Pagar Fatura
                </Button>
              )}
              
              <Button 
                variant="destructive"
                size="sm"
                onClick={() => handleDeleteBill(currentMonthBill)}
                className="gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Excluir Fatura
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center text-muted-foreground py-12">
            <DollarSign className="h-16 w-16 mx-auto mb-4 opacity-30" />
            <p className="font-medium text-lg">Nenhuma fatura para este mês</p>
            <p className="text-sm">
              Use os botões de navegação para ver outras faturas ou faça compras para gerar uma nova fatura
            </p>
          </div>
        )}

        {/* Lista de pagamentos da fatura atual */}
        {currentMonthBill && (
          <BillPaymentsList 
            bill={currentMonthBill} 
            onUpdate={onUpdate}
          />
        )}

        {/* Resumo geral - apenas se há faturas em aberto */}
        {bills.some(bill => bill.remaining_amount > 0) && (
          <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <h4 className="font-medium text-amber-800 mb-2">Resumo Geral - Valores em Aberto</h4>
            <div className="space-y-1">
              {bills
                .filter(bill => bill.remaining_amount > 0)
                .map(bill => (
                  <div key={bill.id} className="flex justify-between text-sm">
                    <span className="text-amber-700">
                      {formatBillMonthYear(bill.reference_month, bill.reference_year)}
                    </span>
                    <span className="font-medium text-amber-800">
                      {formatCurrency(bill.remaining_amount)}
                    </span>
                  </div>
                ))}
              <div className="border-t border-amber-300 pt-1 mt-2">
                <div className="flex justify-between font-medium text-amber-900">
                  <span>Total em aberto:</span>
                  <span>
                    {formatCurrency(
                      bills.reduce((sum, bill) => sum + bill.remaining_amount, 0)
                    )}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>

      {/* Dialog para pagamento de fatura */}
      <Dialog open={isPaymentFormOpen} onOpenChange={setIsPaymentFormOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Pagar Fatura</DialogTitle>
          </DialogHeader>
          {selectedBillForPayment && (
            <CreditCardPaymentForm
              bill={selectedBillForPayment}
              onSuccess={handlePaymentSuccess}
              onCancel={() => setIsPaymentFormOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog de confirmação para exclusão de fatura */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão da Fatura</AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <p>
                Você está prestes a excluir a fatura de{" "}
                <strong>
                  {selectedBillForDeletion && 
                    formatBillMonthYear(selectedBillForDeletion.reference_month, selectedBillForDeletion.reference_year)
                  }
                </strong>.
              </p>
              
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                <p className="text-sm font-medium text-destructive">⚠️ ATENÇÃO</p>
                <ul className="text-sm text-destructive/80 mt-2 space-y-1">
                  <li>• Esta ação é irreversível</li>
                  <li>• Todas as compras serão desvinculadas desta fatura</li>
                  <li>• Pagamentos existentes impedem a exclusão</li>
                  <li>• Os limites do cartão serão recalculados</li>
                </ul>
              </div>
              
              {selectedBillForDeletion && selectedBillForDeletion.total_amount > 0 && (
                <p className="text-sm">
                  Valor da fatura: <strong>{formatCurrency(selectedBillForDeletion.total_amount)}</strong>
                </p>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteBill}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Excluindo..." : "Excluir Fatura"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}