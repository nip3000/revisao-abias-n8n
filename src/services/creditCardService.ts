import { supabase } from "@/integrations/supabase/client";
import { CreditCard, CreditCardBill, CreditCardPurchase, CreditCardPayment, CreditCardSummary } from "@/types/creditCards";

export const creditCardService = {
  // ========== CREDIT CARDS ==========
  async getAllCards(): Promise<CreditCard[]> {
    const { data, error } = await supabase
      .from('credit_cards')
      .select('*')
      .order('name');
    
    if (error) throw error;
    return (data || []) as CreditCard[];
  },

  async getCard(id: string): Promise<CreditCard | null> {
    const { data, error } = await supabase
      .from('credit_cards')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data as CreditCard;
  },

  async createCard(card: Omit<CreditCard, 'id' | 'created_at' | 'updated_at' | 'user_id' | 'available_limit' | 'used_limit'>): Promise<CreditCard> {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) throw new Error('Usuário não autenticado');

    const { data, error } = await supabase
      .from('credit_cards')
      .insert({
        ...card,
        user_id: user.id,
        available_limit: card.total_limit,
        used_limit: 0
      })
      .select()
      .single();
    
    if (error) throw error;
    return data as CreditCard;
  },

  async updateCard(id: string, updates: Partial<CreditCard>): Promise<CreditCard> {
    const { data, error } = await supabase
      .from('credit_cards')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data as CreditCard;
  },

  async deleteCard(id: string): Promise<void> {
    const { error } = await supabase
      .from('credit_cards')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  async getCardSummary(): Promise<CreditCardSummary> {
    const cards = await this.getAllCards();
    
    const summary: CreditCardSummary = {
      total_cards: cards.length,
      total_limit: cards.reduce((sum, card) => sum + card.total_limit, 0),
      available_limit: cards.reduce((sum, card) => sum + card.available_limit, 0),
      used_limit: cards.reduce((sum, card) => sum + card.used_limit, 0),
      overdue_amount: 0,
      cards
    };

    // Buscar próximo vencimento
    const { data: nextBill } = await supabase
      .from('credit_card_bills')
      .select('due_date')
      .in('card_id', cards.map(c => c.id))
      .in('status', ['closed', 'overdue'])
      .order('due_date')
      .limit(1);
    
    if (nextBill && nextBill.length > 0) {
      summary.next_due_date = nextBill[0].due_date;
    }

    // Buscar valor em atraso
    const { data: overdueBills } = await supabase
      .from('credit_card_bills')
      .select('remaining_amount')
      .in('card_id', cards.map(c => c.id))
      .eq('status', 'overdue');
    
    if (overdueBills) {
      summary.overdue_amount = overdueBills.reduce((sum, bill) => sum + bill.remaining_amount, 0);
    }

    return summary;
  },

  // ========== BILLS ==========
  async getBillsByCard(cardId: string): Promise<CreditCardBill[]> {
    const { data, error } = await supabase
      .from('credit_card_bills')
      .select('*')
      .eq('card_id', cardId)
      .order('reference_year', { ascending: false })
      .order('reference_month', { ascending: false });
    
    if (error) throw error;
    return (data || []) as CreditCardBill[];
  },

  async getBill(id: string): Promise<CreditCardBill | null> {
    const { data, error } = await supabase
      .from('credit_card_bills')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data as CreditCardBill;
  },

  async createBill(bill: Omit<CreditCardBill, 'id' | 'created_at' | 'updated_at' | 'total_amount' | 'paid_amount' | 'remaining_amount' | 'minimum_payment'>): Promise<CreditCardBill> {
    const { data, error } = await supabase
      .from('credit_card_bills')
      .insert(bill)
      .select()
      .single();
    
    if (error) throw error;
    return data as CreditCardBill;
  },

  async updateBill(id: string, updates: Partial<CreditCardBill>): Promise<CreditCardBill> {
    const { data, error } = await supabase
      .from('credit_card_bills')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data as CreditCardBill;
  },

  async deleteBill(id: string): Promise<void> {
    // First check if the bill has any payments - warn the user
    const { data: payments } = await supabase
      .from('credit_card_payments')
      .select('id')
      .eq('bill_id', id);
    
    if (payments && payments.length > 0) {
      throw new Error('Não é possível excluir uma fatura que possui pagamentos. Remova os pagamentos primeiro.');
    }

    // Check if the bill has any purchases - these will need to be reassigned or deleted
    const { data: purchases } = await supabase
      .from('credit_card_purchases')
      .select('id')
      .eq('bill_id', id);
    
    if (purchases && purchases.length > 0) {
      // Update purchases to remove bill_id reference
      await supabase
        .from('credit_card_purchases')
        .update({ bill_id: null })
        .eq('bill_id', id);
    }

    // Get card_id before deletion for limit updates
    const { data: bill } = await supabase
      .from('credit_card_bills')
      .select('card_id')
      .eq('id', id)
      .single();

    // Delete the bill
    const { error } = await supabase
      .from('credit_card_bills')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    // Update card limits after deletion
    if (bill) {
      await this.updateCardLimits(bill.card_id);
    }
  },

  async getOpenBillsByCard(cardId: string): Promise<CreditCardBill[]> {
    const { data, error } = await supabase
      .from('credit_card_bills')
      .select('*')
      .eq('card_id', cardId)
      .in('status', ['open', 'closed', 'overdue'])
      .order('due_date');
    
    if (error) throw error;
    return (data || []) as CreditCardBill[];
  },

  // ========== PURCHASES ==========
  async getPurchasesByBill(billId: string): Promise<CreditCardPurchase[]> {
    const { data, error } = await supabase
      .from('credit_card_purchases')
      .select('*')
      .eq('bill_id', billId)
      .order('purchase_date', { ascending: false });
    
    if (error) throw error;
    return (data || []) as CreditCardPurchase[];
  },

  async getPurchasesByCard(cardId: string): Promise<CreditCardPurchase[]> {
    const { data, error } = await supabase
      .from('credit_card_purchases')
      .select('*')
      .eq('card_id', cardId)
      .order('purchase_date', { ascending: false });
    
    if (error) throw error;
    return (data || []) as CreditCardPurchase[];
  },

  async createPurchase(purchase: Omit<CreditCardPurchase, 'id' | 'created_at' | 'updated_at'>): Promise<CreditCardPurchase> {
    // Primeiro, verificar o limite disponível do cartão
    const card = await this.getCard(purchase.card_id);
    if (!card) throw new Error('Cartão não encontrado');
    
    if (purchase.amount > card.available_limit) {
      throw new Error(`Limite insuficiente. Valor da compra (${purchase.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}) excede o limite disponível (${card.available_limit.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}).`);
    }

    const { data, error } = await supabase
      .from('credit_card_purchases')
      .insert(purchase)
      .select()
      .single();
    
    if (error) throw error;
    
    // Atualizar o limite usado do cartão
    await this.updateCardLimits(purchase.card_id);
    
    return data as CreditCardPurchase;
  },

  async updatePurchase(id: string, updates: Partial<CreditCardPurchase>): Promise<CreditCardPurchase> {
    // Buscar a compra original para validação de limite se o valor mudou
    const { data: originalPurchase } = await supabase
      .from('credit_card_purchases')
      .select('*')
      .eq('id', id)
      .single();
    
    if (originalPurchase && updates.amount && updates.amount !== originalPurchase.amount) {
      const card = await this.getCard(originalPurchase.card_id);
      if (!card) throw new Error('Cartão não encontrado');
      
      const amountDifference = updates.amount - originalPurchase.amount;
      if (amountDifference > 0 && amountDifference > card.available_limit) {
        throw new Error(`Limite insuficiente para o aumento. Diferença (${amountDifference.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}) excede o limite disponível (${card.available_limit.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}).`);
      }
    }

    const { data, error } = await supabase
      .from('credit_card_purchases')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    // Atualizar o limite usado do cartão
    if (originalPurchase) {
      await this.updateCardLimits(originalPurchase.card_id);
    }
    
    return data as CreditCardPurchase;
  },

  async deletePurchase(id: string): Promise<void> {
    // Buscar a compra para saber qual cartão atualizar
    const { data: purchase } = await supabase
      .from('credit_card_purchases')
      .select('card_id')
      .eq('id', id)
      .single();

    const { error } = await supabase
      .from('credit_card_purchases')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    // Atualizar o limite usado do cartão
    if (purchase) {
      await this.updateCardLimits(purchase.card_id);
    }
  },

  // ========== PAYMENTS ==========
  async getPaymentsByBill(billId: string): Promise<CreditCardPayment[]> {
    const { data, error } = await supabase
      .from('credit_card_payments')
      .select('*')
      .eq('bill_id', billId)
      .order('payment_date', { ascending: false });
    
    if (error) throw error;
    return (data || []) as CreditCardPayment[];
  },

  async createPayment(payment: Omit<CreditCardPayment, 'id' | 'created_at'>): Promise<CreditCardPayment> {
    const { data, error } = await supabase
      .from('credit_card_payments')
      .insert(payment)
      .select()
      .single();
    
    if (error) throw error;
    return data as CreditCardPayment;
  },

  async updatePayment(id: string, updates: Partial<CreditCardPayment>): Promise<CreditCardPayment> {
    const { data, error } = await supabase
      .from('credit_card_payments')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data as CreditCardPayment;
  },

  async deletePayment(id: string): Promise<void> {
    const { error } = await supabase
      .from('credit_card_payments')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  // ========== HELPER FUNCTIONS ==========
  async generateCurrentBill(cardId: string): Promise<CreditCardBill> {
    const card = await this.getCard(cardId);
    if (!card) throw new Error('Cartão não encontrado');

    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    // Calcular datas da fatura
    const openingDate = new Date(currentYear, currentMonth - 2, card.closing_day + 1);
    const closingDate = new Date(currentYear, currentMonth - 1, card.closing_day);
    const dueDate = new Date(currentYear, currentMonth - 1, card.due_day);

    // Se já passou do vencimento, calcular para o próximo mês
    if (now > dueDate) {
      const nextMonth = currentMonth === 12 ? 1 : currentMonth + 1;
      const nextYear = currentMonth === 12 ? currentYear + 1 : currentYear;
      
      const nextOpeningDate = new Date(nextYear, nextMonth - 2, card.closing_day + 1);
      const nextClosingDate = new Date(nextYear, nextMonth - 1, card.closing_day);
      const nextDueDate = new Date(nextYear, nextMonth - 1, card.due_day);

      return this.createBill({
        card_id: cardId,
        reference_month: nextMonth,
        reference_year: nextYear,
        opening_date: nextOpeningDate.toISOString().split('T')[0],
        closing_date: nextClosingDate.toISOString().split('T')[0],
        due_date: nextDueDate.toISOString().split('T')[0],
        status: 'open',
        interest_amount: 0,
        late_fee: 0
      });
    }

    return this.createBill({
      card_id: cardId,
      reference_month: currentMonth,
      reference_year: currentYear,
      opening_date: openingDate.toISOString().split('T')[0],
      closing_date: closingDate.toISOString().split('T')[0],
      due_date: dueDate.toISOString().split('T')[0],
      status: 'open',
      interest_amount: 0,
      late_fee: 0
    });
  },

  async getCurrentOrCreateBill(cardId: string): Promise<CreditCardBill> {
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    // Tentar buscar fatura atual
    const { data: existingBill } = await supabase
      .from('credit_card_bills')
      .select('*')
      .eq('card_id', cardId)
      .eq('reference_month', currentMonth)
      .eq('reference_year', currentYear)
      .single();

    if (existingBill) {
      return existingBill as CreditCardBill;
    }

    // Se não existe, criar nova fatura
    return this.generateCurrentBill(cardId);
  },

  // ========== CARD LIMITS UPDATE ==========
  async updateCardLimits(cardId: string): Promise<void> {
    // Calcular o total usado baseado nas compras
    const { data: purchases } = await supabase
      .from('credit_card_purchases')
      .select('amount')
      .eq('card_id', cardId);
    
    const totalUsed = purchases?.reduce((sum, purchase) => sum + purchase.amount, 0) || 0;
    
    // Buscar o limite total do cartão
    const card = await this.getCard(cardId);
    if (!card) return;
    
    const availableLimit = Math.max(0, card.total_limit - totalUsed);
    
    // Atualizar o cartão
    await supabase
      .from('credit_cards')
      .update({
        used_limit: totalUsed,
        available_limit: availableLimit
      })
      .eq('id', cardId);
  }
};