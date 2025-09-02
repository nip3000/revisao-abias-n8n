import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { CreditCard } from "@/types/creditCards";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { formatCurrency } from "@/lib/utils";
import { creditCardService } from "@/services/creditCardService";
import { CreditCardBillsList } from "./CreditCardBillsList";
import { CreditCardPurchasesList } from "./CreditCardPurchasesList";

interface CreditCardDetailsProps {
  card: CreditCard;
  onUpdate: () => void;
}

export function CreditCardDetails({ card, onUpdate }: CreditCardDetailsProps) {
  const { data: bills, isLoading: billsLoading, refetch: refetchBills } = useQuery({
    queryKey: ['credit-card-bills', card.id],
    queryFn: () => creditCardService.getBillsByCard(card.id)
  });

  const { data: purchases, isLoading: purchasesLoading, refetch: refetchPurchases } = useQuery({
    queryKey: ['credit-card-purchases', card.id],
    queryFn: () => creditCardService.getPurchasesByCard(card.id)
  });

  const limitUsage = card.total_limit > 0 ? (card.used_limit / card.total_limit) * 100 : 0;

  const handleUpdate = () => {
    onUpdate();
    refetchBills();
    refetchPurchases();
  };

  return (
    <div className="space-y-6">
      {/* Informações gerais do cartão */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div 
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: card.color }}
              />
              <div>
                <CardTitle className="text-xl">{card.name}</CardTitle>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <span>{card.brand}</span>
                  {card.last_four_digits && (
                    <span>•••• {card.last_four_digits}</span>
                  )}
                </div>
              </div>
            </div>
            <Badge variant={card.is_active ? "default" : "secondary"}>
              {card.is_active ? "Ativo" : "Inativo"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Fechamento</span>
              <p className="font-medium">Dia {card.closing_day}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Vencimento</span>
              <p className="font-medium">Dia {card.due_day}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Taxa de Juros</span>
              <p className="font-medium">{card.interest_rate || 0}% a.m.</p>
            </div>
            <div>
              <span className="text-muted-foreground">Anuidade</span>
              <p className="font-medium">{formatCurrency(card.annual_fee || 0)}</p>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted-foreground">Limite utilizado</span>
              <span className="font-medium">
                {formatCurrency(card.used_limit)} / {formatCurrency(card.total_limit)}
              </span>
            </div>
            <Progress value={limitUsage} className="h-3" />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>{limitUsage.toFixed(1)}% utilizado</span>
              <span>Disponível: {formatCurrency(card.available_limit)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs para faturas e compras */}
      <Tabs defaultValue="bills" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="bills">Faturas</TabsTrigger>
          <TabsTrigger value="purchases">Compras</TabsTrigger>
        </TabsList>
        
        <TabsContent value="bills" className="space-y-4">
          <CreditCardBillsList
            bills={bills || []}
            isLoading={billsLoading}
            cardId={card.id}
            onUpdate={handleUpdate}
          />
        </TabsContent>
        
        <TabsContent value="purchases" className="space-y-4">
          <CreditCardPurchasesList
            purchases={purchases || []}
            isLoading={purchasesLoading}
            cardId={card.id}
            availableLimit={card.available_limit}
            onUpdate={handleUpdate}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}