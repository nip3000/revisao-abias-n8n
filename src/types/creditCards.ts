export interface CreditCard {
  id: string;
  user_id: string;
  name: string;
  brand: string;
  last_four_digits?: string;
  total_limit: number;
  available_limit: number;
  used_limit: number;
  closing_day: number;
  due_day: number;
  interest_rate?: number;
  annual_fee?: number;
  is_active: boolean;
  color: string;
  created_at: string;
  updated_at: string;
}

export interface CreditCardBill {
  id: string;
  card_id: string;
  reference_month: number;
  reference_year: number;
  opening_date: string;
  closing_date: string;
  due_date: string;
  total_amount: number;
  paid_amount: number;
  remaining_amount: number;
  minimum_payment: number;
  interest_amount: number;
  late_fee: number;
  status: 'open' | 'closed' | 'paid' | 'overdue';
  payment_date?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface CreditCardPurchase {
  id: string;
  card_id: string;
  bill_id?: string;
  description: string;
  amount: number;
  purchase_date: string;
  category_id?: string;
  installments: number;
  installment_amount: number;
  is_installment: boolean;
  merchant?: string;
  transaction_id?: string;
  created_at: string;
  updated_at: string;
}

export interface CreditCardInstallment {
  id: string;
  purchase_id: string;
  installment_number: number;
  amount: number;
  due_date: string;
  bill_id?: string;
  is_paid: boolean;
  payment_date?: string;
  created_at: string;
}

export interface CreditCardPayment {
  id: string;
  bill_id: string;
  amount: number;
  payment_date: string;
  payment_method: string;
  transaction_id?: string;
  notes?: string;
  created_at: string;
}

export interface CreditCardSummary {
  total_cards: number;
  total_limit: number;
  available_limit: number;
  used_limit: number;
  overdue_amount: number;
  next_due_date?: string;
  cards: CreditCard[];
}

export type CreditCardBrand = 
  | 'Visa' 
  | 'Mastercard' 
  | 'Elo' 
  | 'American Express' 
  | 'Hipercard' 
  | 'Diners' 
  | 'Discover' 
  | 'Other';

export type PaymentMethod = 
  | 'PIX' 
  | 'TED' 
  | 'DOC' 
  | 'Débito Automático' 
  | 'Boleto' 
  | 'Transferência' 
  | 'Dinheiro' 
  | 'Other';