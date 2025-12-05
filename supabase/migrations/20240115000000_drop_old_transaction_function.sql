-- Drop the old version with VARCHAR parameter
DROP FUNCTION IF EXISTS process_wallet_transaction(UUID, VARCHAR, DECIMAL, TEXT, VARCHAR, VARCHAR);
DROP FUNCTION IF EXISTS process_wallet_transaction(UUID, VARCHAR, DECIMAL, TEXT, VARCHAR, UUID);

-- Recreate with payment_reference parameter for idempotency
CREATE OR REPLACE FUNCTION process_wallet_transaction(
  p_user_id UUID,
  p_transaction_type VARCHAR(50),
  p_amount_wc DECIMAL(10, 2),
  p_description TEXT DEFAULT NULL,
  p_related_entity_type VARCHAR(50) DEFAULT NULL,
  p_related_entity_id UUID DEFAULT NULL,
  p_payment_reference VARCHAR(255) DEFAULT NULL
) RETURNS JSON AS $$
DECLARE
  v_current_balance DECIMAL(10, 2);
  v_new_balance DECIMAL(10, 2);
  v_transaction_id UUID;
BEGIN
  SELECT balance_wc INTO v_current_balance
  FROM Wallets
  WHERE user_id = p_user_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Wallet not found for user_id: %', p_user_id;
  END IF;

  v_new_balance := v_current_balance + p_amount_wc;

  IF v_new_balance < 0 THEN
    RAISE EXCEPTION 'Insufficient funds. Current balance: %, Required: %', v_current_balance, ABS(p_amount_wc);
  END IF;

  INSERT INTO CoinTransactions (
    user_id,
    transaction_type,
    amount_wc,
    balance_after_wc,
    description,
    related_entity_type,
    related_entity_id,
    payment_reference
  ) VALUES (
    p_user_id,
    p_transaction_type,
    p_amount_wc,
    v_new_balance,
    p_description,
    p_related_entity_type,
    p_related_entity_id,
    p_payment_reference
  ) RETURNING transaction_id INTO v_transaction_id;

  UPDATE Wallets
  SET balance_wc = v_new_balance
  WHERE user_id = p_user_id;

  RETURN json_build_object(
    'transaction_id', v_transaction_id,
    'new_balance', v_new_balance
  );
END;
$$ LANGUAGE plpgsql;
