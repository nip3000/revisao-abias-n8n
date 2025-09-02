import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CreditCard } from "lucide-react";
import { creditCardService } from "@/services/creditCardService";
import { UseFormReturn } from "react-hook-form";
import { useAccounts } from "@/hooks/useAccounts";

interface CreditCardSelectorProps {
  form: UseFormReturn<any>;
  disabled?: boolean;
}

export function CreditCardSelector({ form, disabled }: CreditCardSelectorProps) {
  const { data: creditCards, isLoading } = useQuery({
    queryKey: ['credit-cards'],
    queryFn: creditCardService.getAllCards
  });

  const { accounts } = useAccounts();

  const activeCreditCards = creditCards?.filter(card => card.is_active) || [];

  return (
    <FormField
      control={form.control}
      name="creditCardId"
      render={({ field }) => (
        <FormItem>
          <FormLabel className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Cartão de Crédito (Opcional)
          </FormLabel>
          <Select 
            onValueChange={(value) => {
              const creditCardId = value === 'none' ? undefined : value;
              field.onChange(creditCardId);
              
              // Automaticamente selecionar conta "Cartão de Crédito" quando um cartão for escolhido
              if (creditCardId) {
                const creditCardAccount = accounts.find(account => account.type === 'credit_card');
                if (creditCardAccount) {
                  form.setValue('accountId', creditCardAccount.id, { shouldValidate: true });
                }
              }
            }} 
            value={field.value || 'none'}
            disabled={disabled || isLoading}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um cartão ou deixe vazio para despesa à vista" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectItem value="none">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-gray-400" />
                  <span>Nenhum cartão de crédito</span>
                </div>
              </SelectItem>
              {activeCreditCards.map((card) => (
                <SelectItem key={card.id} value={card.id}>
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: card.color }}
                    />
                    <span>{card.name}</span>
                    <span className="text-xs text-muted-foreground">
                      ({card.brand} •••• {card.last_four_digits})
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage />
          {field.value && field.value !== 'none' && (
            <p className="text-xs text-muted-foreground">
              💳 Esta despesa será lançada na fatura do cartão, não no fluxo de caixa imediato.
            </p>
          )}
        </FormItem>
      )}
    />
  );
}