-- Criação das tabelas para cartões de crédito

-- Tabela principal de cartões
CREATE TABLE credit_cards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name VARCHAR(100) NOT NULL,
  brand VARCHAR(50) NOT NULL,
  last_four_digits VARCHAR(4),
  total_limit DECIMAL(12,2) NOT NULL DEFAULT 0,
  available_limit DECIMAL(12,2) NOT NULL DEFAULT 0,
  used_limit DECIMAL(12,2) NOT NULL DEFAULT 0,
  closing_day INTEGER NOT NULL CHECK (closing_day >= 1 AND closing_day <= 31),
  due_day INTEGER NOT NULL CHECK (due_day >= 1 AND due_day <= 31),
  interest_rate DECIMAL(5,2) DEFAULT 0,
  annual_fee DECIMAL(10,2) DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  color VARCHAR(7) DEFAULT '#1976d2',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de faturas
CREATE TABLE credit_card_bills (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  card_id UUID REFERENCES credit_cards(id) ON DELETE CASCADE,
  reference_month INTEGER NOT NULL CHECK (reference_month >= 1 AND reference_month <= 12),
  reference_year INTEGER NOT NULL CHECK (reference_year >= 2020),
  opening_date DATE NOT NULL,
  closing_date DATE NOT NULL,
  due_date DATE NOT NULL,
  total_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  paid_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  remaining_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  minimum_payment DECIMAL(12,2) NOT NULL DEFAULT 0,
  interest_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  late_fee DECIMAL(12,2) NOT NULL DEFAULT 0,
  status VARCHAR(20) NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed', 'paid', 'overdue')),
  payment_date DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(card_id, reference_month, reference_year)
);

-- Tabela de compras
CREATE TABLE credit_card_purchases (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  card_id UUID REFERENCES credit_cards(id) ON DELETE CASCADE,
  bill_id UUID REFERENCES credit_card_bills(id) ON DELETE SET NULL,
  description VARCHAR(255) NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  purchase_date DATE NOT NULL,
  category_id UUID REFERENCES poupeja_categories(id),
  installments INTEGER NOT NULL DEFAULT 1 CHECK (installments >= 1 AND installments <= 60),
  installment_amount DECIMAL(12,2) NOT NULL,
  is_installment BOOLEAN DEFAULT false,
  merchant VARCHAR(255),
  transaction_id UUID REFERENCES poupeja_transactions(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de parcelas
CREATE TABLE credit_card_installments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  purchase_id UUID REFERENCES credit_card_purchases(id) ON DELETE CASCADE,
  installment_number INTEGER NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  due_date DATE NOT NULL,
  bill_id UUID REFERENCES credit_card_bills(id) ON DELETE SET NULL,
  is_paid BOOLEAN DEFAULT false,
  payment_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(purchase_id, installment_number)
);

-- Tabela de pagamentos
CREATE TABLE credit_card_payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  bill_id UUID REFERENCES credit_card_bills(id) ON DELETE CASCADE,
  amount DECIMAL(12,2) NOT NULL,
  payment_date DATE NOT NULL,
  payment_method VARCHAR(50) NOT NULL,
  transaction_id UUID REFERENCES poupeja_transactions(id),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE credit_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_card_bills ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_card_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_card_installments ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_card_payments ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Users can manage own credit cards" ON credit_cards
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own bills" ON credit_card_bills
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM credit_cards 
      WHERE credit_cards.id = credit_card_bills.card_id 
      AND credit_cards.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage own purchases" ON credit_card_purchases
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM credit_cards 
      WHERE credit_cards.id = credit_card_purchases.card_id 
      AND credit_cards.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage own installments" ON credit_card_installments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM credit_card_purchases 
      JOIN credit_cards ON credit_cards.id = credit_card_purchases.card_id
      WHERE credit_card_purchases.id = credit_card_installments.purchase_id 
      AND credit_cards.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage own payments" ON credit_card_payments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM credit_card_bills 
      JOIN credit_cards ON credit_cards.id = credit_card_bills.card_id
      WHERE credit_card_bills.id = credit_card_payments.bill_id 
      AND credit_cards.user_id = auth.uid()
    )
  );

-- Índices para performance
CREATE INDEX idx_credit_cards_user_id ON credit_cards(user_id);
CREATE INDEX idx_credit_card_bills_card_id ON credit_card_bills(card_id);
CREATE INDEX idx_credit_card_bills_status ON credit_card_bills(status);
CREATE INDEX idx_credit_card_bills_due_date ON credit_card_bills(due_date);
CREATE INDEX idx_credit_card_purchases_card_id ON credit_card_purchases(card_id);
CREATE INDEX idx_credit_card_purchases_bill_id ON credit_card_purchases(bill_id);
CREATE INDEX idx_credit_card_installments_purchase_id ON credit_card_installments(purchase_id);
CREATE INDEX idx_credit_card_installments_bill_id ON credit_card_installments(bill_id);
CREATE INDEX idx_credit_card_payments_bill_id ON credit_card_payments(bill_id);

-- Função para atualizar limite do cartão
CREATE OR REPLACE FUNCTION update_card_limits()
RETURNS TRIGGER AS $$
BEGIN
  -- Recalcular limite usado baseado em faturas abertas
  UPDATE credit_cards 
  SET 
    used_limit = (
      SELECT COALESCE(SUM(remaining_amount), 0)
      FROM credit_card_bills 
      WHERE card_id = COALESCE(NEW.card_id, OLD.card_id)
      AND status IN ('open', 'closed', 'overdue')
    ),
    updated_at = NOW()
  WHERE id = COALESCE(NEW.card_id, OLD.card_id);
  
  -- Atualizar limite disponível
  UPDATE credit_cards 
  SET available_limit = total_limit - used_limit
  WHERE id = COALESCE(NEW.card_id, OLD.card_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger para faturas
CREATE TRIGGER update_card_limits_on_bill_change
  AFTER INSERT OR UPDATE OR DELETE ON credit_card_bills
  FOR EACH ROW
  EXECUTE FUNCTION update_card_limits();

-- Função para gerar parcelas automaticamente
CREATE OR REPLACE FUNCTION generate_installments()
RETURNS TRIGGER AS $$
DECLARE
  installment_date DATE;
  bill_month INTEGER;
  bill_year INTEGER;
  target_bill_id UUID;
BEGIN
  -- Só gerar parcelas se for compra parcelada
  IF NEW.installments > 1 THEN
    FOR i IN 1..NEW.installments LOOP
      -- Calcular data da parcela (primeira parcela na compra, demais mês a mês)
      installment_date := NEW.purchase_date + INTERVAL '1 month' * (i - 1);
      
      -- Determinar mês/ano da fatura
      bill_month := EXTRACT(MONTH FROM installment_date)::INTEGER;
      bill_year := EXTRACT(YEAR FROM installment_date)::INTEGER;
      
      -- Buscar ou criar fatura correspondente
      SELECT id INTO target_bill_id
      FROM credit_card_bills 
      WHERE card_id = NEW.card_id 
      AND reference_month = bill_month 
      AND reference_year = bill_year;
      
      -- Inserir parcela
      INSERT INTO credit_card_installments (
        purchase_id,
        installment_number,
        amount,
        due_date,
        bill_id
      ) VALUES (
        NEW.id,
        i,
        NEW.installment_amount,
        installment_date,
        target_bill_id
      );
    END LOOP;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para compras
CREATE TRIGGER generate_installments_on_purchase
  AFTER INSERT ON credit_card_purchases
  FOR EACH ROW
  EXECUTE FUNCTION generate_installments();

-- Função para atualizar status da fatura automaticamente
CREATE OR REPLACE FUNCTION update_bill_status()
RETURNS TRIGGER AS $$
DECLARE
  bill_record RECORD;
BEGIN
  -- Buscar a fatura afetada
  SELECT * INTO bill_record 
  FROM credit_card_bills 
  WHERE id = COALESCE(NEW.bill_id, OLD.bill_id);
  
  IF bill_record.id IS NOT NULL THEN
    -- Atualizar valores da fatura
    UPDATE credit_card_bills 
    SET 
      total_amount = (
        SELECT COALESCE(SUM(amount), 0)
        FROM credit_card_purchases 
        WHERE bill_id = bill_record.id
      ) + (
        SELECT COALESCE(SUM(amount), 0)
        FROM credit_card_installments 
        WHERE bill_id = bill_record.id
      ),
      paid_amount = (
        SELECT COALESCE(SUM(amount), 0)
        FROM credit_card_payments 
        WHERE bill_id = bill_record.id
      ),
      updated_at = NOW()
    WHERE id = bill_record.id;
    
    -- Atualizar remaining_amount e status
    UPDATE credit_card_bills 
    SET 
      remaining_amount = total_amount - paid_amount,
      minimum_payment = GREATEST(total_amount * 0.15, 50.00),
      status = CASE 
        WHEN total_amount - paid_amount <= 0 THEN 'paid'
        WHEN due_date < CURRENT_DATE AND total_amount - paid_amount > 0 THEN 'overdue'
        WHEN closing_date < CURRENT_DATE THEN 'closed'
        ELSE 'open'
      END
    WHERE id = bill_record.id;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Triggers para pagamentos e compras
CREATE TRIGGER update_bill_status_on_payment
  AFTER INSERT OR UPDATE OR DELETE ON credit_card_payments
  FOR EACH ROW
  EXECUTE FUNCTION update_bill_status();

CREATE TRIGGER update_bill_status_on_purchase
  AFTER INSERT OR UPDATE OR DELETE ON credit_card_purchases
  FOR EACH ROW
  EXECUTE FUNCTION update_bill_status();

CREATE TRIGGER update_bill_status_on_installment
  AFTER INSERT OR UPDATE OR DELETE ON credit_card_installments
  FOR EACH ROW
  EXECUTE FUNCTION update_bill_status();

-- Trigger para updated_at nas tabelas
CREATE TRIGGER update_credit_cards_updated_at
  BEFORE UPDATE ON credit_cards
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_credit_card_bills_updated_at
  BEFORE UPDATE ON credit_card_bills
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_credit_card_purchases_updated_at
  BEFORE UPDATE ON credit_card_purchases
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();