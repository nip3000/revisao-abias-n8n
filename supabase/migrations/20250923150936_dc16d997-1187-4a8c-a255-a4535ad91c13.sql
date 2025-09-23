-- Ativar o trigger para prevenir inserções diretas incorretas de transações com cartão de crédito
CREATE TRIGGER prevent_direct_credit_card_transactions_trigger
  BEFORE INSERT ON poupeja_transactions
  FOR EACH ROW
  EXECUTE FUNCTION prevent_direct_credit_card_transactions();