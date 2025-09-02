import { useState } from "react";
import { CreditCard } from "@/types/creditCards";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { MoreHorizontal, Eye, Edit, Trash2, Calendar, DollarSign } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { formatCurrency, cn } from "@/lib/utils";
import { creditCardService } from "@/services/creditCardService";
import { useToast } from "@/hooks/use-toast";
import { CreditCardForm } from "./CreditCardForm";
import { CreditCardDetails } from "./CreditCardDetails";

interface CreditCardsListProps {
  cards: CreditCard[];
  isLoading: boolean;
  onUpdate: () => void;
}

export function CreditCardsList({ cards, isLoading, onUpdate }: CreditCardsListProps) {
  const [selectedCard, setSelectedCard] = useState<CreditCard | null>(null);
  const [editingCard, setEditingCard] = useState<CreditCard | null>(null);
  const [deletingCard, setDeletingCard] = useState<CreditCard | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const { toast } = useToast();

  const handleView = (card: CreditCard) => {
    setSelectedCard(card);
    setIsDetailsOpen(true);
  };

  const handleEdit = (card: CreditCard) => {
    setEditingCard(card);
    setIsEditOpen(true);
  };

  const handleDelete = (card: CreditCard) => {
    setDeletingCard(card);
    setIsDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (!deletingCard) return;

    try {
      await creditCardService.deleteCard(deletingCard.id);
      toast({
        title: "Cartão excluído",
        description: "O cartão foi excluído com sucesso."
      });
      onUpdate();
    } catch (error) {
      toast({
        title: "Erro ao excluir",
        description: "Não foi possível excluir o cartão.",
        variant: "destructive"
      });
    } finally {
      setIsDeleteOpen(false);
      setDeletingCard(null);
    }
  };

  const handleUpdateSuccess = () => {
    setIsEditOpen(false);
    setEditingCard(null);
    onUpdate();
  };

  const getBrandColor = (brand: string) => {
    const colors: Record<string, string> = {
      'Visa': '#1A1F71',
      'Mastercard': '#EB001B',
      'Elo': '#FFE500',
      'American Express': '#006FCF',
      'Hipercard': '#FF6900',
      'Diners': '#004B87'
    };
    return colors[brand] || '#6B7280';
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 1 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-8 w-20" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (cards.length === 0) {
    return (
      <Card className="text-center py-12">
        <CardContent>
          <div className="text-muted-foreground">
            <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-semibold mb-2">Nenhum cartão cadastrado</h3>
            <p>Cadastre seu primeiro cartão de crédito para começar.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((card) => {
          const limitUsage = card.total_limit > 0 ? (card.used_limit / card.total_limit) * 100 : 0;
          
          return (
            <Card key={card.id} className="relative group">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: card.color }}
                    />
                    <div>
                      <CardTitle className="text-lg">{card.name}</CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <span 
                          className="text-sm font-medium"
                          style={{ color: getBrandColor(card.brand) }}
                        >
                          {card.brand}
                        </span>
                        {card.last_four_digits && (
                          <span className="text-sm text-muted-foreground">
                            •••• {card.last_four_digits}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleView(card)}>
                        <Eye className="h-4 w-4 mr-2" />
                        Ver detalhes
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleEdit(card)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleDelete(card)}
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <Badge variant={card.is_active ? "default" : "secondary"}>
                    {card.is_active ? "Ativo" : "Inativo"}
                  </Badge>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    <span>Venc. dia {card.due_day}</span>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Limite usado</span>
                    <span className="font-medium">
                      {formatCurrency(card.used_limit)} / {formatCurrency(card.total_limit)}
                    </span>
                  </div>
                  <Progress 
                    value={limitUsage} 
                    className={cn(
                      "h-2",
                      limitUsage > 80 && "data-[state=complete]:bg-destructive",
                      limitUsage > 60 && limitUsage <= 80 && "data-[state=complete]:bg-warning"
                    )}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>{limitUsage.toFixed(1)}% utilizado</span>
                    <span>Disponível: {formatCurrency(card.available_limit)}</span>
                  </div>
                </div>

                {card.annual_fee && card.annual_fee > 0 ? (
                  <div className="text-xs text-muted-foreground">
                    Anuidade: {formatCurrency(card.annual_fee)}
                  </div>
                ) : null}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Dialogs */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalhes do Cartão</DialogTitle>
          </DialogHeader>
          {selectedCard && (
            <CreditCardDetails 
              card={selectedCard} 
              onUpdate={onUpdate}
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Cartão</DialogTitle>
          </DialogHeader>
          {editingCard && (
            <CreditCardForm 
              card={editingCard}
              onSuccess={handleUpdateSuccess}
            />
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o cartão "{deletingCard?.name}"? 
              Esta ação não pode ser desfeita e todos os dados relacionados serão perdidos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}