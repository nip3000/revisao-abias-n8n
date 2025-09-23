-- Criar função para corrigir transações de cartão existentes que foram inseridas incorretamente
CREATE OR REPLACE FUNCTION public.fix_credit_card_transactions()
RETURNS TABLE(
  fixed_transactions INTEGER,
  created_purchases INTEGER,
  errors TEXT[]
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  transaction_record RECORD;
  purchase_id UUID;
  errors_array TEXT[] := '{}';
  fixed_count INTEGER := 0;
  created_count INTEGER := 0;
BEGIN
  -- Buscar transações que têm credit_card_id mas não deveriam estar em poupeja_transactions
  FOR transaction_record IN 
    SELECT t.*, c.user_id as card_user_id
    FROM poupeja_transactions t
    JOIN credit_cards c ON t.credit_card_id = c.id
    WHERE t.type = 'expense' 
    AND t.credit_card_id IS NOT NULL
    -- Verificar se não existe uma compra correspondente já criada
    AND NOT EXISTS (
      SELECT 1 FROM credit_card_purchases cp 
      WHERE cp.transaction_id = t.id
    )
  LOOP
    BEGIN
      -- Criar compra de cartão correspondente
      INSERT INTO credit_card_purchases (
        card_id,
        description,
        amount,
        purchase_date,
        installments,
        installment_amount,
        is_installment,
        category_id,
        transaction_id
      ) VALUES (
        transaction_record.credit_card_id,
        COALESCE(transaction_record.description, 'Compra migrada'),
        transaction_record.amount,
        transaction_record.date,
        1,
        transaction_record.amount,
        false,
        transaction_record.category_id,
        transaction_record.id
      ) RETURNING id INTO purchase_id;
      
      created_count := created_count + 1;
      
      -- Remover a transação da tabela de transações (já que agora é compra de cartão)
      DELETE FROM poupeja_transactions WHERE id = transaction_record.id;
      
      fixed_count := fixed_count + 1;
      
      -- Gerar faturas automaticamente para o cartão
      PERFORM auto_generate_credit_card_bills(transaction_record.credit_card_id);
      
    EXCEPTION
      WHEN OTHERS THEN
        errors_array := array_append(errors_array, 
          format('Erro ao processar transação %s: %s', transaction_record.id, SQLERRM));
    END;
  END LOOP;
  
  -- Recalcular limites de todos os cartões afetados
  UPDATE credit_cards 
  SET 
    used_limit = (
      SELECT COALESCE(SUM(remaining_amount), 0)
      FROM credit_card_bills 
      WHERE card_id = credit_cards.id
      AND status IN ('open', 'closed', 'overdue')
    ),
    updated_at = now()
  WHERE id IN (
    SELECT DISTINCT credit_card_id 
    FROM poupeja_transactions 
    WHERE credit_card_id IS NOT NULL
  );
  
  UPDATE credit_cards 
  SET available_limit = total_limit - used_limit;
  
  RETURN QUERY SELECT fixed_count, created_count, errors_array;
END;
$function$;

-- Criar trigger para prevenir inserções diretas com credit_card_id
CREATE OR REPLACE FUNCTION public.prevent_direct_credit_card_transactions()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $function$
BEGIN
  -- Se é uma transação de despesa com cartão de crédito, bloquear
  IF NEW.type = 'expense' AND NEW.credit_card_id IS NOT NULL THEN
    RAISE EXCEPTION 'Transações com cartão de crédito devem ser criadas através do serviço de transações, não diretamente na tabela. Use transactionService.addTransaction() ou crie uma compra de cartão em credit_card_purchases.';
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Aplicar o trigger (comentado por enquanto para não quebrar integrações existentes)
-- CREATE TRIGGER prevent_direct_credit_card_transactions_trigger
--   BEFORE INSERT ON poupeja_transactions
--   FOR EACH ROW
--   EXECUTE FUNCTION prevent_direct_credit_card_transactions();