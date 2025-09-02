import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Bank } from "@/services/bankService";

interface BankFormProps {
  bank?: Bank | null;
  onSubmit: (data: { name: string; code?: string }) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export const BankForm = ({ bank, onSubmit, onCancel, isSubmitting }: BankFormProps) => {
  const [name, setName] = useState(bank?.name || "");
  const [code, setCode] = useState(bank?.code || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    
    onSubmit({
      name: name.trim(),
      code: code.trim() || undefined
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="bankName">Nome do Banco *</Label>
        <Input
          id="bankName"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ex: Banco do Brasil, Nubank"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="bankCode">Código do Banco</Label>
        <Input
          id="bankCode"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Ex: 001, 260"
          maxLength={10}
        />
      </div>

      <div className="flex gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={!name.trim() || isSubmitting}>
          {bank ? 'Atualizar' : 'Criar'}
        </Button>
      </div>
    </form>
  );
};