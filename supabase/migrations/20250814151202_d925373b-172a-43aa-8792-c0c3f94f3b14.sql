-- Corrigir a função update_credit_card_limits para calcular baseado no remaining_amount das faturas
CREATE OR REPLACE FUNCTION public.update_credit_card_limits(card_id_param uuid)
RETURNS void
LANGUAGE plpgsql
AS $function$
DECLARE
  total_remaining NUMERIC := 0;
  card_total_limit NUMERIC := 0;
BEGIN
  -- Get total limit for the card
  SELECT total_limit INTO card_total_limit
  FROM credit_cards
  WHERE id = card_id_param;
  
  -- Calculate total remaining amount from bills that are not paid (open, closed, overdue)
  SELECT COALESCE(SUM(remaining_amount), 0) INTO total_remaining
  FROM credit_card_bills
  WHERE card_id = card_id_param
  AND status IN ('open', 'closed', 'overdue');
  
  -- Update card limits
  UPDATE credit_cards
  SET 
    used_limit = total_remaining,
    available_limit = card_total_limit - total_remaining,
    updated_at = now()
  WHERE id = card_id_param;
END;
$function$;

-- Atualizar os limites de todos os cartões para corrigir valores incorretos
DO $$ 
DECLARE
    card_rec RECORD;
BEGIN
    FOR card_rec IN SELECT id FROM credit_cards LOOP
        PERFORM update_credit_card_limits(card_rec.id);
    END LOOP;
END $$;