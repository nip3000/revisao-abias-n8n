-- Create function to recalculate credit card limits based on purchases
CREATE OR REPLACE FUNCTION update_credit_card_limits(card_id_param UUID)
RETURNS void AS $$
DECLARE
  total_purchases NUMERIC := 0;
  card_total_limit NUMERIC := 0;
BEGIN
  -- Get total limit for the card
  SELECT total_limit INTO card_total_limit
  FROM credit_cards
  WHERE id = card_id_param;
  
  -- Calculate total amount from purchases that are not paid yet
  SELECT COALESCE(SUM(amount), 0) INTO total_purchases
  FROM credit_card_purchases
  WHERE card_id = card_id_param;
  
  -- Update card limits
  UPDATE credit_cards
  SET 
    used_limit = total_purchases,
    available_limit = card_total_limit - total_purchases,
    updated_at = now()
  WHERE id = card_id_param;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update card limits when purchases change
CREATE OR REPLACE FUNCTION trigger_update_credit_card_limits()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    PERFORM update_credit_card_limits(OLD.card_id);
    RETURN OLD;
  ELSE
    PERFORM update_credit_card_limits(NEW.card_id);
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for purchases
DROP TRIGGER IF EXISTS trigger_credit_card_purchase_insert ON credit_card_purchases;
DROP TRIGGER IF EXISTS trigger_credit_card_purchase_update ON credit_card_purchases;
DROP TRIGGER IF EXISTS trigger_credit_card_purchase_delete ON credit_card_purchases;

CREATE TRIGGER trigger_credit_card_purchase_insert
  AFTER INSERT ON credit_card_purchases
  FOR EACH ROW
  EXECUTE FUNCTION trigger_update_credit_card_limits();

CREATE TRIGGER trigger_credit_card_purchase_update
  AFTER UPDATE ON credit_card_purchases
  FOR EACH ROW
  EXECUTE FUNCTION trigger_update_credit_card_limits();

CREATE TRIGGER trigger_credit_card_purchase_delete
  AFTER DELETE ON credit_card_purchases
  FOR EACH ROW
  EXECUTE FUNCTION trigger_update_credit_card_limits();

-- Update existing cards to have correct limits
UPDATE credit_cards
SET 
  used_limit = COALESCE((
    SELECT SUM(amount) 
    FROM credit_card_purchases 
    WHERE card_id = credit_cards.id
  ), 0),
  available_limit = total_limit - COALESCE((
    SELECT SUM(amount) 
    FROM credit_card_purchases 
    WHERE card_id = credit_cards.id
  ), 0);