-- Fix installment billing logic
-- Update auto_generate_credit_card_bills to properly handle installments

CREATE OR REPLACE FUNCTION public.auto_generate_credit_card_bills(card_id_param uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  purchase_record RECORD;
  installment_record RECORD;
  card_record RECORD;
  bill_opening_date DATE;
  bill_closing_date DATE;
  bill_due_date DATE;
  bill_month INTEGER;
  bill_year INTEGER;
  existing_bill_id UUID;
BEGIN
  -- Get card details
  SELECT * INTO card_record FROM credit_cards WHERE id = card_id_param;
  
  IF card_record IS NULL THEN
    RAISE EXCEPTION 'Card not found: %', card_id_param;
  END IF;
  
  -- First, process installments to create bills and associate them
  FOR installment_record IN 
    SELECT ci.*, cp.purchase_date, cp.card_id
    FROM credit_card_installments ci
    JOIN credit_card_purchases cp ON ci.purchase_id = cp.id
    WHERE cp.card_id = card_id_param AND ci.bill_id IS NULL
    ORDER BY ci.due_date
  LOOP
    -- Calculate which bill period this installment belongs to
    bill_month := EXTRACT(MONTH FROM installment_record.due_date)::INTEGER;
    bill_year := EXTRACT(YEAR FROM installment_record.due_date)::INTEGER;
    
    -- Check if bill already exists for this period
    SELECT id INTO existing_bill_id
    FROM credit_card_bills 
    WHERE card_id = card_id_param 
    AND reference_month = bill_month 
    AND reference_year = bill_year;
    
    -- If no bill exists, create one
    IF existing_bill_id IS NULL THEN
      -- Calculate bill dates
      bill_closing_date := make_date(bill_year, bill_month, card_record.closing_day);
      bill_due_date := make_date(bill_year, bill_month, card_record.due_day);
      
      -- If due day is before closing day, due date is next month
      IF card_record.due_day <= card_record.closing_day THEN
        IF bill_month = 12 THEN
          bill_due_date := make_date(bill_year + 1, 1, card_record.due_day);
        ELSE
          bill_due_date := make_date(bill_year, bill_month + 1, card_record.due_day);
        END IF;
      END IF;
      
      -- Opening date is day after previous closing
      bill_opening_date := bill_closing_date - INTERVAL '1 month' + INTERVAL '1 day';
      
      -- Create the bill
      INSERT INTO credit_card_bills (
        card_id,
        reference_month,
        reference_year,
        opening_date,
        closing_date,
        due_date,
        status,
        total_amount,
        paid_amount,
        remaining_amount,
        minimum_payment,
        interest_amount,
        late_fee
      ) VALUES (
        card_id_param,
        bill_month,
        bill_year,
        bill_opening_date,
        bill_closing_date,
        bill_due_date,
        CASE 
          WHEN bill_closing_date > CURRENT_DATE THEN 'open'
          WHEN bill_due_date >= CURRENT_DATE THEN 'closed'
          ELSE 'overdue'
        END,
        0, -- Will be calculated by trigger
        0,
        0,
        0,
        0,
        0
      ) RETURNING id INTO existing_bill_id;
    END IF;
    
    -- Assign installment to bill
    UPDATE credit_card_installments 
    SET bill_id = existing_bill_id 
    WHERE id = installment_record.id;
  END LOOP;
  
  -- Process single purchases (non-installment) that don't have a bill assigned
  FOR purchase_record IN 
    SELECT * FROM credit_card_purchases 
    WHERE card_id = card_id_param 
    AND bill_id IS NULL 
    AND (installments <= 1 OR is_installment = false)
    ORDER BY purchase_date
  LOOP
    -- Calculate which bill period this purchase belongs to
    -- If purchase is before closing day, it goes to current month
    -- If purchase is after closing day, it goes to next month
    
    IF EXTRACT(DAY FROM purchase_record.purchase_date) <= card_record.closing_day THEN
      bill_month := EXTRACT(MONTH FROM purchase_record.purchase_date)::INTEGER;
      bill_year := EXTRACT(YEAR FROM purchase_record.purchase_date)::INTEGER;
    ELSE
      -- Purchase after closing day goes to next month's bill
      IF EXTRACT(MONTH FROM purchase_record.purchase_date) = 12 THEN
        bill_month := 1;
        bill_year := EXTRACT(YEAR FROM purchase_record.purchase_date)::INTEGER + 1;
      ELSE
        bill_month := EXTRACT(MONTH FROM purchase_record.purchase_date)::INTEGER + 1;
        bill_year := EXTRACT(YEAR FROM purchase_record.purchase_date)::INTEGER;
      END IF;
    END IF;
    
    -- Check if bill already exists for this period
    SELECT id INTO existing_bill_id
    FROM credit_card_bills 
    WHERE card_id = card_id_param 
    AND reference_month = bill_month 
    AND reference_year = bill_year;
    
    -- If no bill exists, create one
    IF existing_bill_id IS NULL THEN
      -- Calculate bill dates
      bill_closing_date := make_date(bill_year, bill_month, card_record.closing_day);
      bill_due_date := make_date(bill_year, bill_month, card_record.due_day);
      
      -- If due day is before closing day, due date is next month
      IF card_record.due_day <= card_record.closing_day THEN
        IF bill_month = 12 THEN
          bill_due_date := make_date(bill_year + 1, 1, card_record.due_day);
        ELSE
          bill_due_date := make_date(bill_year, bill_month + 1, card_record.due_day);
        END IF;
      END IF;
      
      -- Opening date is day after previous closing
      bill_opening_date := bill_closing_date - INTERVAL '1 month' + INTERVAL '1 day';
      
      -- Create the bill
      INSERT INTO credit_card_bills (
        card_id,
        reference_month,
        reference_year,
        opening_date,
        closing_date,
        due_date,
        status,
        total_amount,
        paid_amount,
        remaining_amount,
        minimum_payment,
        interest_amount,
        late_fee
      ) VALUES (
        card_id_param,
        bill_month,
        bill_year,
        bill_opening_date,
        bill_closing_date,
        bill_due_date,
        CASE 
          WHEN bill_closing_date > CURRENT_DATE THEN 'open'
          WHEN bill_due_date >= CURRENT_DATE THEN 'closed'
          ELSE 'overdue'
        END,
        0, -- Will be calculated by trigger
        0,
        0,
        0,
        0,
        0
      ) RETURNING id INTO existing_bill_id;
    END IF;
    
    -- Assign purchase to bill
    UPDATE credit_card_purchases 
    SET bill_id = existing_bill_id 
    WHERE id = purchase_record.id;
  END LOOP;
  
  -- Update all bill totals for this card
  -- For bills with installments, sum only installment amounts, not full purchase amounts
  UPDATE credit_card_bills 
  SET 
    total_amount = (
      -- Sum from single purchases (non-installment)
      SELECT COALESCE(SUM(cp.amount), 0)
      FROM credit_card_purchases cp
      WHERE cp.bill_id = credit_card_bills.id
      AND (cp.installments <= 1 OR cp.is_installment = false)
    ) + (
      -- Sum from installments
      SELECT COALESCE(SUM(ci.amount), 0)
      FROM credit_card_installments ci
      WHERE ci.bill_id = credit_card_bills.id
    ),
    remaining_amount = total_amount - paid_amount,
    minimum_payment = GREATEST(total_amount * 0.15, 50.00)
  WHERE card_id = card_id_param;
  
END;
$function$;