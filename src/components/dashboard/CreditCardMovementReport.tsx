import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { creditCardService } from '@/services/creditCardService';
import { motion } from 'framer-motion';
import { formatCurrency } from '@/utils/transactionUtils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Receipt, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

interface CreditCardMovementReportProps {
  currentMonth: Date;
  hideValues: boolean;
}

interface CreditCardSummary {
  id: string;
  name: string;
  brand: string;
  color: string;
  lastPurchase: string;
  purchaseCount: number;
  totalSpent: number;
  pendingAmount: number;
  availableLimit: number;
  usedLimit: number;
  totalLimit: number;
}

const CreditCardMovementReport: React.FC<CreditCardMovementReportProps> = ({
  currentMonth,
  hideValues
}) => {
  const { data: cards = [], isLoading: cardsLoading } = useQuery({
    queryKey: ['credit-cards'],
    queryFn: creditCardService.getAllCards
  });

  const currentMonthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
  const currentMonthEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);

  const cardSummaries = useMemo(async () => {
    const summaries: CreditCardSummary[] = [];
    
    for (const card of cards) {
      if (!card.is_active) continue;
      
      // Buscar compras do mês atual
      const purchases = await creditCardService.getPurchasesByCard(card.id);
      const monthPurchases = purchases.filter(purchase => {
        const purchaseDate = new Date(purchase.purchase_date);
        return purchaseDate >= currentMonthStart && purchaseDate <= currentMonthEnd;
      });

      // Buscar faturas em aberto
      const bills = await creditCardService.getOpenBillsByCard(card.id);
      const pendingAmount = bills.reduce((sum, bill) => sum + bill.remaining_amount, 0);

      const totalSpent = monthPurchases.reduce((sum, purchase) => sum + purchase.amount, 0);
      const lastPurchase = monthPurchases.length > 0 
        ? monthPurchases.sort((a, b) => new Date(b.purchase_date).getTime() - new Date(a.purchase_date).getTime())[0].purchase_date
        : '';

      summaries.push({
        id: card.id,
        name: card.name,
        brand: card.brand,
        color: card.color,
        lastPurchase,
        purchaseCount: monthPurchases.length,
        totalSpent,
        pendingAmount,
        availableLimit: card.available_limit,
        usedLimit: card.used_limit,
        totalLimit: card.total_limit
      });
    }
    
    return summaries.sort((a, b) => b.totalSpent - a.totalSpent);
  }, [cards, currentMonth]);

  const [cardSummariesData, setCardSummariesData] = React.useState<CreditCardSummary[]>([]);

  React.useEffect(() => {
    if (cards.length > 0) {
      cardSummaries.then(setCardSummariesData);
    }
  }, [cardSummaries, cards]);

  const totals = useMemo(() => ({
    totalSpent: cardSummariesData.reduce((sum, card) => sum + card.totalSpent, 0),
    totalPending: cardSummariesData.reduce((sum, card) => sum + card.pendingAmount, 0),
    totalLimit: cardSummariesData.reduce((sum, card) => sum + card.totalLimit, 0),
    totalAvailable: cardSummariesData.reduce((sum, card) => sum + card.availableLimit, 0),
    purchaseCount: cardSummariesData.reduce((sum, card) => sum + card.purchaseCount, 0)
  }), [cardSummariesData]);

  const monthName = format(currentMonth, 'MMMM', { locale: ptBR });

  const formatValue = (value: number) => {
    if (hideValues) return '***';
    return formatCurrency(value, 'BRL');
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'Sem compras';
    return format(new Date(dateStr), 'dd \'de\' MMM. \'de\' yyyy', { locale: ptBR });
  };

  const getLimitStatus = (used: number, total: number) => {
    const percentage = (used / total) * 100;
    if (percentage >= 80) return 'destructive';
    if (percentage >= 60) return 'default';
    return 'secondary';
  };

  if (cardsLoading || cardSummariesData.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="shadow-lg border-0">
        <CardHeader className="pb-4">
          <div className="flex justify-between items-center">
            <CardTitle className="text-xl font-semibold flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Movimentação dos Cartões - {monthName}
            </CardTitle>
            <Button variant="outline" size="sm" asChild>
              <Link to="/credit-cards">Ver Detalhes</Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="text-left p-4 font-medium text-muted-foreground">Cartão</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Última Compra</th>
                  <th className="text-center p-4 font-medium text-muted-foreground">Compras</th>
                  <th className="text-right p-4 font-medium text-muted-foreground">Gasto no Mês</th>
                  <th className="text-right p-4 font-medium text-muted-foreground">Valor em Aberto</th>
                  <th className="text-right p-4 font-medium text-muted-foreground">Limite Disponível</th>
                </tr>
              </thead>
              <tbody>
                {cardSummariesData.map((card) => (
                  <tr 
                    key={card.id}
                    className="border-b border-border/30 hover:bg-muted/50 transition-colors"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: card.color }}
                        />
                        <div>
                          <div className="font-medium">{card.name}</div>
                          <div className="text-xs text-muted-foreground">{card.brand}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-muted-foreground text-sm">
                      {formatDate(card.lastPurchase)}
                    </td>
                    <td className="p-4 text-center">
                      <Badge variant="outline">
                        {card.purchaseCount}
                      </Badge>
                    </td>
                    <td className="p-4 text-right">
                      <span className="font-medium text-blue-600">
                        {formatValue(card.totalSpent)}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <span className="font-medium text-orange-600">
                        <Receipt className="inline h-4 w-4 mr-1" />
                        {formatValue(card.pendingAmount)}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="text-right">
                        <span className="font-medium text-green-600">
                          {formatValue(card.availableLimit)}
                        </span>
                        <div className="text-xs text-muted-foreground mt-1">
                          <Badge variant={getLimitStatus(card.usedLimit, card.totalLimit)} className="text-xs">
                            {Math.round((card.usedLimit / card.totalLimit) * 100)}% usado
                          </Badge>
                        </div>
                      </div>
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
                    <Badge variant="outline" className="font-bold">
                      {totals.purchaseCount}
                    </Badge>
                  </td>
                  <td className="p-4 text-right">
                    <span className="text-blue-600 font-bold">
                      {formatValue(totals.totalSpent)}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <span className="text-orange-600 font-bold">
                      {formatValue(totals.totalPending)}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <span className="text-green-600 font-bold">
                      {formatValue(totals.totalAvailable)}
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

export default CreditCardMovementReport;