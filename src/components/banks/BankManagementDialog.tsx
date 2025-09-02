import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { BankForm } from "./BankForm";
import { bankService, Bank } from "@/services/bankService";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

interface BankManagementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const BankManagementDialog = ({ open, onOpenChange }: BankManagementDialogProps) => {
  const [banks, setBanks] = useState<Bank[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingBank, setEditingBank] = useState<Bank | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [deleteBank, setDeleteBank] = useState<Bank | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const loadBanks = async () => {
    try {
      setLoading(true);
      const data = await bankService.getBanks();
      setBanks(data);
    } catch (error) {
      toast.error("Erro ao carregar bancos");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      loadBanks();
    }
  }, [open]);

  const handleSubmit = async (data: { name: string; code?: string }) => {
    try {
      setSubmitting(true);
      if (editingBank) {
        await bankService.updateBank(editingBank.id, data);
        toast.success("Banco atualizado com sucesso");
      } else {
        await bankService.createBank(data);
        toast.success("Banco criado com sucesso");
      }
      await loadBanks();
      setShowForm(false);
      setEditingBank(null);
    } catch (error) {
      toast.error("Erro ao salvar banco");
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteBank) return;
    
    try {
      await bankService.deleteBank(deleteBank.id);
      toast.success("Banco excluído com sucesso");
      await loadBanks();
      setDeleteBank(null);
    } catch (error) {
      toast.error("Erro ao excluir banco");
      console.error(error);
    }
  };

  const handleEdit = (bank: Bank) => {
    setEditingBank(bank);
    setShowForm(true);
  };

  const handleNew = () => {
    setEditingBank(null);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingBank(null);
  };

  if (showForm) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingBank ? 'Editar Banco' : 'Novo Banco'}
            </DialogTitle>
          </DialogHeader>
          <BankForm
            bank={editingBank}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isSubmitting={submitting}
          />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Gerenciar Bancos</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <Button onClick={handleNew} className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              Novo Banco
            </Button>

            {loading ? (
              <div className="text-center py-8">Carregando...</div>
            ) : banks.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Nenhum banco cadastrado
              </div>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {banks.map((bank) => (
                  <div
                    key={bank.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{bank.name}</p>
                      {bank.code && (
                        <p className="text-sm text-muted-foreground">
                          Código: {bank.code}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(bank)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setDeleteBank(bank)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteBank} onOpenChange={() => setDeleteBank(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o banco "{deleteBank?.name}"?
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};