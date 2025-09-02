import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { ShoppingCart, Plus, Calendar, Edit, Trash2, MoreVertical, CheckSquare, Square } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { creditCardService } from "@/services/creditCardService";
import { formatCurrency } from "@/lib/utils";
import { CreditCardPurchase } from "@/types/creditCards";
import { CreditCardPurchaseForm } from "./CreditCardPurchaseForm";
import { cn } from "@/lib/utils";

interface CreditCardPurchasesListProps {
  purchases: CreditCardPurchase[];
  isLoading: boolean;
  cardId: string;
  availableLimit: number;
  onUpdate: () => void;
}

export function CreditCardPurchasesList({ purchases, isLoading, cardId, availableLimit, onUpdate }: CreditCardPurchasesListProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPurchase, setEditingPurchase] = useState<CreditCardPurchase | null>(null);
  const [deletingPurchase, setDeletingPurchase] = useState<CreditCardPurchase | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isDeletingMultiple, setIsDeletingMultiple] = useState(false);
  const { toast } = useToast();

  const handleFormSuccess = () => {
    setIsFormOpen(false);
    setEditingPurchase(null);
    onUpdate();
  };

  const handleEdit = (purchase: CreditCardPurchase) => {
    setEditingPurchase(purchase);
    setIsFormOpen(true);
  };

  const handleDelete = async () => {
    if (!deletingPurchase) return;
    
    setIsDeleting(true);
    try {
      await creditCardService.deletePurchase(deletingPurchase.id);
      toast({
        title: "Compra excluída",
        description: "A compra foi excluída com sucesso."
      });
      onUpdate();
    } catch (error: any) {
      toast({
        title: "Erro ao excluir compra",
        description: error.message || "Não foi possível excluir a compra.",
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
      setDeletingPurchase(null);
    }
  };

  const handleNewPurchase = () => {
    setEditingPurchase(null);
    setIsFormOpen(true);
  };

  // Funções de multiseleção
  const handleSelectPurchase = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds(prev => [...prev, id]);
    } else {
      setSelectedIds(prev => prev.filter(selectedId => selectedId !== id));
    }
  };

  const handleSelectAll = () => {
    const allIds = purchases.map(p => p.id);
    setSelectedIds(allIds);
  };

  const handleDeselectAll = () => {
    setSelectedIds([]);
  };

  const handleDeleteMultiple = async () => {
    if (selectedIds.length === 0) return;
    
    setIsDeletingMultiple(true);
    try {
      // Excluir todas as compras selecionadas
      await Promise.all(selectedIds.map(id => creditCardService.deletePurchase(id)));
      
      toast({
        title: "Compras excluídas",
        description: `${selectedIds.length} compra(s) foram excluídas com sucesso.`
      });
      
      setSelectedIds([]);
      setSelectionMode(false);
      onUpdate();
    } catch (error: any) {
      toast({
        title: "Erro ao excluir compras",
        description: error.message || "Não foi possível excluir algumas compras.",
        variant: "destructive"
      });
    } finally {
      setIsDeletingMultiple(false);
    }
  };

  const handleCancelSelection = () => {
    setSelectedIds([]);
    setSelectionMode(false);
  };

  const handleEnterSelectionMode = () => {
    setSelectionMode(true);
    setSelectedIds([]);
  };
  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Carregando compras...</div>
        </CardContent>
      </Card>
    );
  }

  if (!purchases.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Compras</span>
            <div className="flex items-center gap-2">
              {!selectionMode && (
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={handleEnterSelectionMode}
                >
                  <CheckSquare className="h-4 w-4 mr-2" />
                  Selecionar
                </Button>
              )}
              <Button size="sm" onClick={handleNewPurchase}>
                <Plus className="h-4 w-4 mr-2" />
                Nova Compra
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground">
            <ShoppingCart className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nenhuma compra encontrada</p>
            <p className="text-sm">As compras no cartão aparecerão aqui</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Compras</span>
            <div className="flex items-center gap-2">
              {!selectionMode && purchases.length > 0 && (
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={handleEnterSelectionMode}
                >
                  <CheckSquare className="h-4 w-4 mr-2" />
                  Selecionar
                </Button>
              )}
              <Button size="sm" onClick={handleNewPurchase}>
                <Plus className="h-4 w-4 mr-2" />
                Nova Compra
              </Button>
            </div>
          </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Barra de seleção múltipla */}
        {selectionMode && (
          <div className="flex items-center justify-between bg-blue-50 border border-blue-200 p-3 rounded-lg">
            <div className="flex items-center gap-2">
              <Checkbox
                checked={selectedIds.length === purchases.length && purchases.length > 0}
                onCheckedChange={(checked) => checked ? handleSelectAll() : handleDeselectAll()}
              />
              <span className="text-sm font-medium text-blue-900">
                {selectedIds.length} de {purchases.length} selecionado(s)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={selectedIds.length === purchases.length ? handleDeselectAll : handleSelectAll}
              >
                {selectedIds.length === purchases.length ? (
                  <>
                    <Square className="h-4 w-4 mr-1" />
                    Desmarcar Todos
                  </>
                ) : (
                  <>
                    <CheckSquare className="h-4 w-4 mr-1" />
                    Marcar Todos
                  </>
                )}
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={handleDeleteMultiple}
                disabled={selectedIds.length === 0 || isDeletingMultiple}
              >
                <Trash2 className="h-4 w-4 mr-1" />
                {isDeletingMultiple ? "Excluindo..." : `Excluir (${selectedIds.length})`}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleCancelSelection}
                disabled={isDeletingMultiple}
              >
                Cancelar
              </Button>
            </div>
          </div>
        )}
        
        {/* Lista de compras */}
        {purchases.map((purchase) => {
          const isSelected = selectedIds.includes(purchase.id);
          
          return (
            <div
              key={purchase.id}
              className={cn(
                "flex items-center justify-between p-4 border rounded-lg transition-colors",
                isSelected && "bg-blue-50 border-blue-200"
              )}
            >
              <div className="flex items-center gap-3 flex-1">
                {selectionMode && (
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={(checked) => handleSelectPurchase(purchase.id, checked as boolean)}
                  />
                )}
                <ShoppingCart className="h-5 w-5 text-muted-foreground" />
                <div className="flex-1">
                  <p className="font-medium">{purchase.description}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatCurrency(purchase.amount)}
                    {purchase.merchant && <span> • {purchase.merchant}</span>}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    <span>{new Date(purchase.purchase_date).toLocaleDateString()}</span>
                    {purchase.installments > 1 && (
                      <span>
                        • {purchase.installments}x de {formatCurrency(purchase.installment_amount)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {purchase.category_id && (
                  <Badge variant="outline">Categoria</Badge>
                )}
                
                {!selectionMode && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="z-50 bg-popover">
                      <DropdownMenuItem onClick={() => handleEdit(purchase)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => setDeletingPurchase(purchase)}
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </div>
          );
        })}
      </CardContent>

      {/* Dialog para nova/editar compra */}
      <Dialog open={isFormOpen} onOpenChange={(open) => {
        setIsFormOpen(open);
        if (!open) setEditingPurchase(null);
      }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingPurchase ? "Editar Compra" : "Nova Compra"}</DialogTitle>
          </DialogHeader>
          <CreditCardPurchaseForm
            cardId={cardId}
            editingPurchase={editingPurchase}
            availableLimit={availableLimit}
            onSuccess={handleFormSuccess}
            onCancel={() => {
              setIsFormOpen(false);
              setEditingPurchase(null);
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Dialog de confirmação para exclusão */}
      <AlertDialog open={!!deletingPurchase} onOpenChange={(open) => !open && setDeletingPurchase(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Compra</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a compra "{deletingPurchase?.description}"? 
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}