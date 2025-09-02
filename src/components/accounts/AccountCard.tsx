import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CreditCard, Landmark, PiggyBank, Wallet, Star, Trash2, Pencil } from 'lucide-react';
import { Account } from '@/types/accounts';
import AccountEditDialog from './AccountEditDialog';
import { bankService, Bank } from '@/services/bankService';

interface AccountCardProps {
  account: Account;
  onDelete: (id: string) => void;
}

const typeMap: Record<string, { label: string; Icon: any }> = {
  checking: { label: 'Conta Corrente', Icon: Landmark },
  savings: { label: 'Poupança', Icon: PiggyBank },
  cash: { label: 'Carteira', Icon: Wallet },
  credit_card: { label: 'Cartão de Crédito', Icon: CreditCard },
};

const AccountCard: React.FC<AccountCardProps> = ({ account, onDelete }) => {
  const meta = typeMap[account.type] || { label: account.type, Icon: Landmark };
  const { Icon } = meta;
  const [openEdit, setOpenEdit] = useState(false);
  const [banks, setBanks] = useState<Bank[]>([]);

  useEffect(() => {
    const loadBanks = async () => {
      try {
        const data = await bankService.getBanks();
        setBanks(data);
      } catch (error) {
        console.error('Erro ao carregar bancos:', error);
      }
    };
    loadBanks();
  }, []);

  // Buscar informações do banco pelo ID
  const bankInfo = account.bank_id ? banks.find(bank => bank.id === account.bank_id) : null;

  return (
    <Card className="border overflow-hidden h-full shadow-sm hover:shadow transition-shadow">
      <CardContent className="p-4 space-y-3">
        {/* Header com ícone e nome */}
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-full bg-accent flex items-center justify-center flex-shrink-0">
            <Icon className="h-5 w-5 text-accent-foreground" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-base truncate">{account.name}</h3>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline">{meta.label}</Badge>
              {account.is_default && (
                <Badge variant="secondary" className="gap-1">
                  <Star className="h-3 w-3 fill-current" /> Padrão
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Informações do banco e conta */}
        <div className="space-y-2 text-sm">
          {bankInfo && (
            <div className="flex flex-col sm:flex-row sm:items-center gap-1">
              <span className="font-medium text-foreground">Banco:</span>
              <span className="text-muted-foreground">
                {bankInfo.name} {bankInfo.code && `(${bankInfo.code})`}
              </span>
            </div>
          )}
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {account.account_number && (
              <div className="flex flex-col">
                <span className="font-medium text-foreground">Nº da Conta:</span>
                <span className="text-muted-foreground">{account.account_number}</span>
              </div>
            )}
            {account.agency && (
              <div className="flex flex-col">
                <span className="font-medium text-foreground">Agência:</span>
                <span className="text-muted-foreground">{account.agency}</span>
              </div>
            )}
          </div>
        </div>

        {/* Botões de ação */}
        <div className="flex gap-2 pt-2 border-t">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => setOpenEdit(true)}
          >
            <Pencil className="w-4 h-4 mr-2" />
            Editar
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1"
            onClick={() => onDelete(account.id)}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Excluir
          </Button>
        </div>

        <AccountEditDialog open={openEdit} onOpenChange={setOpenEdit} account={account} />
      </CardContent>
    </Card>
  );
};

export default AccountCard;
