import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/utils";
import { creditCardService } from "@/services/creditCardService";
import { addTransaction } from "@/services/transactionService";
import { CreditCardBill } from "@/types/creditCards";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const paymentSchema = z.object({
  amount: z.number().min(0.01, "Valor deve ser maior que zero"),
  payment_date: z.string().min(1, "Data é obrigatória"),
  payment_method: z.string().min(1, "Método de pagamento é obrigatório"),
  notes: z.string().optional(),
  create_transaction: z.boolean().default(true)
});

type PaymentFormData = z.infer<typeof paymentSchema>;

interface CreditCardPaymentFormProps {
  bill: CreditCardBill;
  onSuccess: () => void;
  onCancel: () => void;
}

export function CreditCardPaymentForm({ bill, onSuccess, onCancel }: CreditCardPaymentFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors }
  } = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      amount: bill.remaining_amount,
      payment_date: new Date().toISOString().split('T')[0],
      payment_method: 'pix',
      notes: '',
      create_transaction: true
    }
  });

  const watchedAmount = watch('amount');
  const watchedCreateTransaction = watch('create_transaction');

  const onSubmit = async (data: PaymentFormData) => {
    setIsLoading(true);

    try {
      // Registrar pagamento da fatura
      await creditCardService.createPayment({
        bill_id: bill.id,
        amount: data.amount,
        payment_date: data.payment_date,
        payment_method: data.payment_method,
        notes: data.notes || undefined,
        transaction_id: undefined
      });

      // Se selecionado, criar transação no painel financeiro
      if (data.create_transaction) {
        await addTransaction({
          type: 'expense',
          amount: data.amount,
          description: `Pagamento fatura cartão - ${bill.reference_month}/${bill.reference_year}`,
          date: data.payment_date,
          category: 'Outros', // Categoria padrão para pagamentos de cartão
          accountId: null
        });
      }

      toast({
        title: "Pagamento registrado",
        description: `Pagamento de ${formatCurrency(data.amount)} registrado com sucesso.`
      });

      onSuccess();
    } catch (error) {
      console.error("Erro ao registrar pagamento:", error);
      toast({
        title: "Erro ao registrar pagamento",
        description: "Não foi possível registrar o pagamento da fatura.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const suggestedAmounts = [
    { label: "Valor mínimo", value: bill.minimum_payment },
    { label: "Valor total", value: bill.remaining_amount },
    { label: "50% do total", value: bill.remaining_amount * 0.5 }
  ].filter(item => item.value > 0);

  return (
    <div className="space-y-4">
      {/* Informações da fatura */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">
            Fatura {bill.reference_month}/{bill.reference_year}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Valor total:</span>
            <span className="font-medium">{formatCurrency(bill.total_amount)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Já pago:</span>
            <span className="font-medium">{formatCurrency(bill.paid_amount)}</span>
          </div>
          <div className="flex justify-between border-t pt-2">
            <span className="text-muted-foreground">Valor em aberto:</span>
            <span className="font-semibold text-destructive">{formatCurrency(bill.remaining_amount)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Vencimento:</span>
            <span className="font-medium">{new Date(bill.due_date).toLocaleDateString('pt-BR')}</span>
          </div>
        </CardContent>
      </Card>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Valores sugeridos */}
        {suggestedAmounts.length > 0 && (
          <div className="space-y-2">
            <Label className="text-sm font-medium">Valores sugeridos:</Label>
            <div className="flex flex-wrap gap-2">
              {suggestedAmounts.map((suggestion, index) => (
                <Button
                  key={index}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setValue('amount', suggestion.value)}
                  className="text-xs"
                >
                  {suggestion.label}: {formatCurrency(suggestion.value)}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Valor do pagamento */}
        <div className="space-y-2">
          <Label htmlFor="amount">Valor do pagamento</Label>
          <Input
            id="amount"
            type="number"
            step="0.01"
            min="0.01"
            max={bill.remaining_amount}
            placeholder="0,00"
            {...register("amount", { 
              valueAsNumber: true,
              setValueAs: (value) => parseFloat(value) || 0
            })}
          />
          {errors.amount && (
            <span className="text-sm text-destructive">{errors.amount.message}</span>
          )}
          {watchedAmount > bill.remaining_amount && (
            <span className="text-sm text-amber-600">
              ⚠️ Valor maior que o saldo devedor
            </span>
          )}
        </div>

        {/* Data do pagamento */}
        <div className="space-y-2">
          <Label htmlFor="payment_date">Data do pagamento</Label>
          <Input
            id="payment_date"
            type="date"
            {...register("payment_date")}
          />
          {errors.payment_date && (
            <span className="text-sm text-destructive">{errors.payment_date.message}</span>
          )}
        </div>

        {/* Método de pagamento */}
        <div className="space-y-2">
          <Label htmlFor="payment_method">Método de pagamento</Label>
          <Select onValueChange={(value) => setValue('payment_method', value)} defaultValue="pix">
            <SelectTrigger>
              <SelectValue placeholder="Selecione o método" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pix">PIX</SelectItem>
              <SelectItem value="ted">TED</SelectItem>
              <SelectItem value="doc">DOC</SelectItem>
              <SelectItem value="debito_automatico">Débito Automático</SelectItem>
              <SelectItem value="dinheiro">Dinheiro</SelectItem>
              <SelectItem value="boleto">Boleto</SelectItem>
              <SelectItem value="outros">Outros</SelectItem>
            </SelectContent>
          </Select>
          {errors.payment_method && (
            <span className="text-sm text-destructive">{errors.payment_method.message}</span>
          )}
        </div>

        {/* Opção de criar transação */}
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="create_transaction"
            {...register("create_transaction")}
          />
          <Label htmlFor="create_transaction" className="text-sm">
            Registrar no painel financeiro como despesa
          </Label>
        </div>

        {/* Observações */}
        <div className="space-y-2">
          <Label htmlFor="notes">Observações (opcional)</Label>
          <Textarea
            id="notes"
            placeholder="Observações sobre o pagamento..."
            {...register("notes")}
          />
        </div>

        {/* Botões */}
        <div className="flex gap-2 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={isLoading}
            className="flex-1"
          >
            {isLoading ? "Registrando..." : `Pagar ${formatCurrency(watchedAmount || 0)}`}
          </Button>
        </div>
      </form>
    </div>
  );
}