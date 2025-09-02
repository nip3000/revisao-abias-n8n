export interface Account {
  id: string;
  user_id?: string;
  name: string;
  bank_id?: string | null;
  bank_name?: string | null; // deprecated, manter para compatibilidade
  account_number?: string | null;
  agency?: string | null;
  type: 'checking' | 'savings' | 'cash' | 'credit_card' | string;
  is_default: boolean;
  created_at?: string;
  updated_at?: string;
}
