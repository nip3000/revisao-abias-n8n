-- Fix credit card purchase processing for installments
-- Clear existing bill associations and regenerate them correctly

-- First, clear bill associations for all purchases that have installments
UPDATE credit_card_purchases 
SET bill_id = NULL 
WHERE installments > 1 AND is_installment = true;

-- Clear bill associations for installments
UPDATE credit_card_installments 
SET bill_id = NULL;

-- Now regenerate bills for all cards to properly distribute installments
DO $$
DECLARE
    card_rec RECORD;
BEGIN
    FOR card_rec IN SELECT id FROM credit_cards LOOP
        PERFORM auto_generate_credit_card_bills(card_rec.id);
    END LOOP;
END $$;