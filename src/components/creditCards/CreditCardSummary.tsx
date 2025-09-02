import { CreditCardSummary as Summary } from "@/types/creditCards";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CreditCard, AlertTriangle, Calendar, TrendingUp } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface CreditCardSummaryProps {
  summary?: Summary;
  isLoading: boolean;
}

export function CreditCardSummary({ summary, isLoading }: CreditCardSummaryProps) {
  if (isLoading || !summary) {
    return null;
  }

  const limitUsagePercentage = summary.total_limit > 0 
    ? (summary.used_limit / summary.total_limit) * 100 
    : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total de Cartões</CardTitle>
          <CreditCard className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{summary.total_cards}</div>
          <p className="text-xs text-muted-foreground">
            cartões ativos
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Limite Total</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(summary.total_limit)}</div>
          <p className="text-xs text-muted-foreground">
            disponível: {formatCurrency(summary.available_limit)}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Limite Utilizado</CardTitle>
          <div className={`h-4 w-4 rounded-full ${
            limitUsagePercentage > 80 ? 'bg-destructive' : 
            limitUsagePercentage > 60 ? 'bg-warning' : 'bg-primary'
          }`} />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(summary.used_limit)}</div>
          <p className="text-xs text-muted-foreground">
            {limitUsagePercentage.toFixed(1)}% do limite
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Valor em Atraso</CardTitle>
          <AlertTriangle className={`h-4 w-4 ${
            summary.overdue_amount > 0 ? 'text-destructive' : 'text-muted-foreground'
          }`} />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${
            summary.overdue_amount > 0 ? 'text-destructive' : 'text-foreground'
          }`}>
            {formatCurrency(summary.overdue_amount)}
          </div>
          {summary.next_due_date ? (
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              próximo venc.: {new Date(summary.next_due_date).toLocaleDateString('pt-BR')}
            </p>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}