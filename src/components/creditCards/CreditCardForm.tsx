import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CreditCard, CreditCardBrand } from "@/types/creditCards";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { creditCardService } from "@/services/creditCardService";
import { formatCurrency, parseCurrency } from "@/lib/utils";

const creditCardSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  brand: z.string().min(1, "Bandeira é obrigatória"),
  last_four_digits: z.string().optional(),
  total_limit: z.number().min(0, "Limite deve ser positivo"),
  closing_day: z.number().min(1).max(31),
  due_day: z.number().min(1).max(31),
  interest_rate: z.number().min(0).max(100).default(0),
  annual_fee: z.number().min(0).default(0),
  is_active: z.boolean(),
  color: z.string().min(1, "Cor é obrigatória")
});

type CreditCardFormData = z.infer<typeof creditCardSchema>;

interface CreditCardFormProps {
  card?: CreditCard;
  onSuccess: () => void;
}

const CARD_BRANDS: CreditCardBrand[] = [
  'Visa', 'Mastercard', 'Elo', 'American Express', 'Hipercard', 'Diners', 'Discover', 'Other'
];

const CARD_COLORS = [
  { name: 'Azul', value: '#1976d2' },
  { name: 'Verde', value: '#388e3c' },
  { name: 'Vermelho', value: '#d32f2f' },
  { name: 'Roxo', value: '#7b1fa2' },
  { name: 'Laranja', value: '#f57c00' },
  { name: 'Rosa', value: '#c2185b' },
  { name: 'Cinza', value: '#616161' },
  { name: 'Dourado', value: '#f9a825' }
];

export function CreditCardForm({ card, onSuccess }: CreditCardFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [limitInput, setLimitInput] = useState(card?.total_limit?.toString() || "");
  const [annualFeeInput, setAnnualFeeInput] = useState(card?.annual_fee?.toString() || "");
  const { toast } = useToast();

  const form = useForm<CreditCardFormData>({
    resolver: zodResolver(creditCardSchema),
    defaultValues: {
      name: card?.name || "",
      brand: card?.brand || "",
      last_four_digits: card?.last_four_digits || "",
      total_limit: card?.total_limit || 0,
      closing_day: card?.closing_day || 5,
      due_day: card?.due_day || 10,
      interest_rate: card?.interest_rate || 0,
      annual_fee: card?.annual_fee || 0,
      is_active: card?.is_active ?? true,
      color: card?.color || '#1976d2'
    }
  });

  const onSubmit = async (data: CreditCardFormData) => {
    setIsLoading(true);
    try {
      if (card) {
        await creditCardService.updateCard(card.id, data);
        toast({
          title: "Cartão atualizado",
          description: "As informações do cartão foram atualizadas com sucesso."
        });
      } else {
        await creditCardService.createCard({
          name: data.name,
          brand: data.brand as CreditCardBrand,
          last_four_digits: data.last_four_digits,
          total_limit: data.total_limit,
          closing_day: data.closing_day,
          due_day: data.due_day,
          interest_rate: data.interest_rate,
          annual_fee: data.annual_fee,
          is_active: data.is_active,
          color: data.color
        });
        toast({
          title: "Cartão cadastrado",
          description: "O cartão foi cadastrado com sucesso."
        });
      }
      onSuccess();
    } catch (error) {
      toast({
        title: "Erro",
        description: card ? "Erro ao atualizar cartão." : "Erro ao cadastrar cartão.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome do Cartão</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Nubank Gold" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="brand"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bandeira</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {CARD_BRANDS.map((brand) => (
                      <SelectItem key={brand} value={brand}>{brand}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="last_four_digits"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Últimos 4 dígitos</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="1234" 
                    maxLength={4}
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="total_limit"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Limite Total</FormLabel>
              <FormControl>
                <Input
                  placeholder="R$ 0,00"
                  value={limitInput}
                  onChange={(e) => {
                    const value = e.target.value;
                    setLimitInput(value);
                    const numericValue = parseCurrency(value);
                    field.onChange(numericValue);
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="closing_day"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Dia de Fechamento</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    min="1" 
                    max="31" 
                    placeholder="5"
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="due_day"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Dia de Vencimento</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    min="1" 
                    max="31" 
                    placeholder="10"
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="interest_rate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Taxa de Juros (% ao mês)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    step="0.01"
                    min="0" 
                    max="100" 
                    placeholder="0.00"
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="annual_fee"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Anuidade</FormLabel>
                <FormControl>
                  <Input
                    placeholder="R$ 0,00"
                    value={annualFeeInput}
                    onChange={(e) => {
                      const value = e.target.value;
                      setAnnualFeeInput(value);
                      const numericValue = parseCurrency(value);
                      field.onChange(numericValue);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="color"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cor de Identificação</FormLabel>
              <FormControl>
                <div className="flex gap-2 flex-wrap">
                  {CARD_COLORS.map((color) => (
                    <button
                      key={color.value}
                      type="button"
                      className={`w-8 h-8 rounded-full border-2 ${
                        field.value === color.value ? 'border-primary' : 'border-border'
                      }`}
                      style={{ backgroundColor: color.value }}
                      onClick={() => field.onChange(color.value)}
                      title={color.name}
                    />
                  ))}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="is_active"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Cartão ativo</FormLabel>
              </div>
            </FormItem>
          )}
        />

        <div className="flex gap-2 pt-4">
          <Button type="submit" disabled={isLoading} className="flex-1">
            {isLoading ? "Salvando..." : card ? "Atualizar" : "Cadastrar"}
          </Button>
        </div>
      </form>
    </Form>
  );
}