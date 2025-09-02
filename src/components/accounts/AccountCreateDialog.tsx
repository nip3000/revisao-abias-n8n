import React, { useEffect, useState } from 'react';
import { UseFormReturn, useForm } from 'react-hook-form';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useAccounts } from '@/hooks/useAccounts';
import { useToast } from '@/hooks/use-toast';
import { bankService, Bank } from '@/services/bankService';

interface AccountCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface FormValues {
  name: string;
  bank_id?: string;
  account_number?: string;
  agency?: string;
  type: 'checking' | 'savings' | 'cash' | 'credit_card' | string;
  is_default: boolean;
}

const AccountCreateDialog: React.FC<AccountCreateDialogProps> = ({ open, onOpenChange }) => {
  const { createAccount, isCreating } = useAccounts();
  const { toast } = useToast();
  const [banks, setBanks] = useState<Bank[]>([]);

  const form = useForm<FormValues>({
    defaultValues: {
      name: '',
      bank_id: '',
      account_number: '',
      agency: '',
      type: 'checking',
      is_default: false,
    },
  });

  useEffect(() => {
    const loadBanks = async () => {
      try {
        const data = await bankService.getBanks();
        setBanks(data);
      } catch (error) {
        console.error('Erro ao carregar bancos:', error);
      }
    };

    if (open) {
      loadBanks();
    }
  }, [open]);

  const onSubmit = async (values: FormValues) => {
    try {
      await createAccount({
        name: values.name.trim(),
        bank_id: values.bank_id || undefined,
        account_number: values.account_number?.trim() || undefined,
        agency: values.agency?.trim() || undefined,
        type: values.type,
        is_default: values.is_default,
      });
      toast({ title: 'Conta criada', description: 'Sua conta foi adicionada com sucesso.' });
      onOpenChange(false);
      form.reset();
    } catch (e: any) {
      toast({ title: 'Erro', description: e.message || 'Não foi possível criar a conta', variant: 'destructive' });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px] p-0 overflow-hidden">
        <DialogHeader className="bg-background p-6 border-b">
          <DialogTitle className="text-xl">Nova Conta</DialogTitle>
        </DialogHeader>
        <div className="p-6 space-y-4">
          <div className="space-y-2">
            <Label>Nome da Conta</Label>
            <Input placeholder="Ex: Carteira, Itaú - João" {...form.register('name', { required: true })} />
          </div>
          <div className="space-y-2">
            <Label>Banco</Label>
            <Select value={form.watch('bank_id')} onValueChange={(v) => form.setValue('bank_id', v)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o banco" />
              </SelectTrigger>
              <SelectContent className="z-[60] bg-popover">
                {banks.map((bank) => (
                  <SelectItem key={bank.id} value={bank.id}>
                    {bank.name} {bank.code && `(${bank.code})`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Número da Conta</Label>
              <Input placeholder="Ex: 12345-6" {...form.register('account_number')} />
            </div>
            <div className="space-y-2">
              <Label>Agência</Label>
              <Input placeholder="Ex: 1234" {...form.register('agency')} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Tipo de Conta</Label>
            <Select value={form.watch('type')} onValueChange={(v) => form.setValue('type', v)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent className="z-[60] bg-popover">
                <SelectItem value="checking">Conta Corrente</SelectItem>
                <SelectItem value="savings">Poupança</SelectItem>
                <SelectItem value="cash">Carteira</SelectItem>
                <SelectItem value="credit_card">Cartão de Crédito</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between rounded-md border p-3">
            <div>
              <Label className="!m-0">Conta Padrão</Label>
              <p className="text-xs text-muted-foreground">Será selecionada automaticamente nas transações.</p>
            </div>
            <Switch checked={form.watch('is_default')} onCheckedChange={(v) => form.setValue('is_default', v)} />
          </div>
        </div>
        <DialogFooter className="p-6 pt-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={form.handleSubmit(onSubmit)} disabled={isCreating}>Criar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AccountCreateDialog;
