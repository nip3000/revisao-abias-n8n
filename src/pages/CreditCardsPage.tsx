import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import MainLayout from "@/components/layout/MainLayout";
import { creditCardService } from "@/services/creditCardService";
import { CreditCardsList } from "@/components/creditCards/CreditCardsList";
import { CreditCardForm } from "@/components/creditCards/CreditCardForm";
import { CreditCardSummary } from "@/components/creditCards/CreditCardSummary";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export default function CreditCardsPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);

  const { data: cards, isLoading, refetch } = useQuery({
    queryKey: ['credit-cards'],
    queryFn: creditCardService.getAllCards
  });

  const { data: summary, isLoading: isSummaryLoading } = useQuery({
    queryKey: ['credit-cards-summary'],
    queryFn: creditCardService.getCardSummary
  });

  const handleCardCreated = () => {
    setIsFormOpen(false);
    refetch();
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Cartões de Crédito</h1>
            <p className="text-muted-foreground">
              Gerencie seus cartões, faturas e compras
            </p>
          </div>
          
          <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Novo Cartão
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Cadastrar Cartão de Crédito</DialogTitle>
              </DialogHeader>
              <CreditCardForm onSuccess={handleCardCreated} />
            </DialogContent>
          </Dialog>
        </div>

        {/* Resumo dos cartões */}
        {summary && !isSummaryLoading ? (
          <CreditCardSummary 
            summary={summary} 
            isLoading={isSummaryLoading} 
          />
        ) : null}

        {/* Lista de cartões */}
        <CreditCardsList 
          cards={cards || []} 
          isLoading={isLoading}
          onUpdate={refetch}
        />
      </div>
    </MainLayout>
  );
}