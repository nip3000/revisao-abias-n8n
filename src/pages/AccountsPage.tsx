import React, { useMemo, useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAccounts } from '@/hooks/useAccounts';
import { Plus, Filter, Building2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import AccountCreateDialog from '@/components/accounts/AccountCreateDialog';
import AccountCard from '@/components/accounts/AccountCard';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BankManagementDialog } from '@/components/banks/BankManagementDialog';

const AccountsPage: React.FC = () => {
  const { accounts, isLoading, setDefaultAccount, deleteAccount } = useAccounts();
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'checking' | 'savings' | 'cash' | 'credit_card'>('all');
  const [sort, setSort] = useState<'recent' | 'name_asc'>('recent');
  const [openCreate, setOpenCreate] = useState(false);
  const [openBanks, setOpenBanks] = useState(false);

  React.useEffect(() => {
    document.title = 'Contas | Saldo Positivo';
    // SEO meta
    const desc = 'Gerencie suas contas: crie, defina padrão e exclua contas bancárias.';
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'description');
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', desc);
    // Canonical
    let link = document.querySelector('link[rel="canonical"]');
    if (!link) {
      link = document.createElement('link');
      link.setAttribute('rel', 'canonical');
      document.head.appendChild(link);
    }
    link.setAttribute('href', window.location.origin + '/accounts');
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    let list = accounts.filter(a =>
      a.name.toLowerCase().includes(q) || (a.bank_name || '').toLowerCase().includes(q)
    );
    if (typeFilter !== 'all') list = list.filter(a => (a.type || '') === typeFilter);
    if (sort === 'name_asc') list = [...list].sort((a, b) => a.name.localeCompare(b.name));
    else list = [...list].sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''));
    return list;
  }, [accounts, search, typeFilter, sort]);

  const handleDelete = async (id: string) => {
    try {
      await deleteAccount(id);
      toast({ title: 'Conta removida', description: 'A conta foi excluída.' });
    } catch (e: any) {
      toast({ title: 'Erro', description: e.message || 'Não foi possível excluir a conta', variant: 'destructive' });
    }
  };

  return (
    <MainLayout>
      <div className="w-full px-4 py-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Contas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Barra de filtros */}
            <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center">
              <div className="flex items-center gap-2 text-sm text-muted-foreground"><Filter className="h-4 w-4" /> Filtros:</div>
              <div className="flex-1">
                <Input placeholder="Buscar contas..." value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
              <div className="min-w-[160px]">
                <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as any)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent className="z-[60] bg-popover">
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="checking">Conta Corrente</SelectItem>
                    <SelectItem value="savings">Poupança</SelectItem>
                    <SelectItem value="cash">Carteira</SelectItem>
                    <SelectItem value="credit_card">Cartão de Crédito</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="min-w-[180px]">
                <Select value={sort} onValueChange={(v) => setSort(v as any)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Ordenação" />
                  </SelectTrigger>
                  <SelectContent className="z-[60] bg-popover">
                    <SelectItem value="recent">Mais recentes</SelectItem>
                    <SelectItem value="name_asc">Nome A-Z</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="text-sm text-muted-foreground whitespace-nowrap">{accounts.length} contas</div>
              <div className="flex gap-2 ml-auto">
                <Button variant="outline" onClick={() => setOpenBanks(true)}>
                  <Building2 className="w-4 h-4 mr-2" /> Bancos
                </Button>
                <Button onClick={() => setOpenCreate(true)}>
                  <Plus className="w-4 h-4 mr-2" /> Nova Conta
                </Button>
              </div>
            </div>

            {/* Listagem */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {isLoading ? (
                <p>Carregando...</p>
              ) : filtered.length === 0 ? (
                <p className="text-muted-foreground">Nenhuma conta encontrada.</p>
              ) : (
                filtered.map(acc => (
                  <AccountCard key={acc.id} account={acc} onDelete={handleDelete} />
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      <AccountCreateDialog open={openCreate} onOpenChange={setOpenCreate} />
      <BankManagementDialog open={openBanks} onOpenChange={setOpenBanks} />
    </MainLayout>
  );
};

export default AccountsPage;
