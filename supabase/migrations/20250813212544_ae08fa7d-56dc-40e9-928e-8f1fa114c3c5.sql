-- Clear and regenerate bills for installments with safe date handling
-- First, clear bill associations for all purchases that have installments
UPDATE credit_card_purchases 
SET bill_id = NULL 
WHERE installments > 1 AND is_installment = true;

-- Clear bill associations for installments
UPDATE credit_card_installments 
SET bill_id = NULL;

-- Now regenerate bills for all cards to properly distribute installments
SELECT auto_generate_credit_card_bills(id) FROM credit_cards;