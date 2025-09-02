import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreditCardPurchase } from "@/types/creditCards";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { creditCardService } from "@/services/creditCardService";
import { Loader2 } from "lucide-react";

const purchaseSchema = z.object({
  description: z.string().min(1, "Descrição é obrigatória"),
  amount: z.number().min(0.01, "Valor deve ser maior que zero"),
  purchase_date: z.string().min(1, "Data é obrigatória"),
  category_id: z.string().optional(),
  merchant: z.string().optional(),
  installments: z.number().min(1).max(60),
  is_installment: z.boolean()
});

type PurchaseFormData = z.infer<typeof purchaseSchema>;

interface CreditCardPurchaseFormProps {
  cardId: string;
  onSuccess: () => void;
  onCancel: () => void;
  editingPurchase?: CreditCardPurchase | null;
  availableLimit?: number;
}

export function CreditCardPurchaseForm({ cardId, onSuccess, onCancel, editingPurchase, availableLimit = 0 }: CreditCardPurchaseFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const isEditing = !!editingPurchase;

  const form = useForm<PurchaseFormData>({
    resolver: zodResolver(purchaseSchema),
    defaultValues: {
      description: editingPurchase?.description || "",
      amount: editingPurchase?.amount || 0,
      purchase_date: editingPurchase?.purchase_date || new Date().toISOString().split('T')[0],
      installments: editingPurchase?.installments || 1,
      is_installment: editingPurchase?.is_installment || false,
      merchant: editingPurchase?.merchant || "",
      category_id: editingPurchase?.category_id || undefined
    }
  });

  const watchInstallments = form.watch("installments");
  const watchAmount = form.watch("amount");
  const watchIsInstallment = form.watch("is_installment");

  const handleSubmit = async (data: PurchaseFormData) => {
    // Validar limite disponível apenas para novas compras ou se o valor aumentou
    const currentPurchaseAmount = editingPurchase?.amount || 0;
    const amountDifference = data.amount - currentPurchaseAmount;
    
    if (!isEditing || amountDifference > 0) {
      const requiredLimit = isEditing ? amountDifference : data.amount;
      if (requiredLimit > availableLimit) {
        toast({
          title: "Limite insuficiente",
          description: `O valor da compra (${data.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}) excede o limite disponível (${availableLimit.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}). Ajuste o valor para continuar.`,
          variant: "destructive"
        });
        return;
      }
    }

    setIsLoading(true);
    try {
      const installmentAmount = data.is_installment && data.installments > 1 
        ? data.amount / data.installments 
        : data.amount;

      if (isEditing) {
        await creditCardService.updatePurchase(editingPurchase.id, {
          description: data.description,
          amount: data.amount,
          purchase_date: data.purchase_date,
          category_id: data.category_id || null,
          merchant: data.merchant || null,
          installments: data.is_installment ? data.installments : 1,
          installment_amount: installmentAmount,
          is_installment: data.is_installment
        });

        toast({
          title: "Compra atualizada",
          description: "A compra foi atualizada com sucesso."
        });
      } else {
        await creditCardService.createPurchase({
          card_id: cardId,
          description: data.description,
          amount: data.amount,
          purchase_date: data.purchase_date,
          category_id: data.category_id || null,
          merchant: data.merchant || null,
          installments: data.is_installment ? data.installments : 1,
          installment_amount: installmentAmount,
          is_installment: data.is_installment,
          bill_id: null,
          transaction_id: null
        });

        toast({
          title: "Compra registrada",
          description: "A compra foi registrada com sucesso no cartão."
        });
      }

      onSuccess();
    } catch (error: any) {
      toast({
        title: isEditing ? "Erro ao atualizar compra" : "Erro ao registrar compra",
        description: error.message || "Não foi possível processar a compra.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>{isEditing ? "Editar Compra" : "Nova Compra"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="description">Descrição</Label>
            <Input
              id="description"
              placeholder="Descrição da compra"
              {...form.register("description")}
            />
            {form.formState.errors.description && (
              <p className="text-sm text-destructive mt-1">
                {form.formState.errors.description.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="amount">Valor</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              placeholder="0,00"
              {...form.register("amount", { valueAsNumber: true })}
            />
            {availableLimit > 0 && !isEditing && (
              <p className="text-xs text-muted-foreground mt-1">
                Limite disponível: {availableLimit.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </p>
            )}
            {form.formState.errors.amount && (
              <p className="text-sm text-destructive mt-1">
                {form.formState.errors.amount.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="purchase_date">Data da Compra</Label>
            <Input
              id="purchase_date"
              type="date"
              {...form.register("purchase_date")}
            />
            {form.formState.errors.purchase_date && (
              <p className="text-sm text-destructive mt-1">
                {form.formState.errors.purchase_date.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="merchant">Estabelecimento (Opcional)</Label>
            <Input
              id="merchant"
              placeholder="Nome do estabelecimento"
              {...form.register("merchant")}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="is_installment"
              checked={watchIsInstallment}
              onCheckedChange={(checked) => form.setValue("is_installment", checked as boolean)}
            />
            <Label htmlFor="is_installment">Compra parcelada</Label>
          </div>

          {watchIsInstallment && (
            <div>
              <Label htmlFor="installments">Número de Parcelas</Label>
              <Select
                value={watchInstallments.toString()}
                onValueChange={(value) => form.setValue("installments", parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 24 }, (_, i) => i + 1).map((num) => (
                    <SelectItem key={num} value={num.toString()}>
                      {num}x de R$ {watchAmount > 0 ? (watchAmount / num).toFixed(2) : "0,00"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {isEditing ? "Atualizar Compra" : "Salvar Compra"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}