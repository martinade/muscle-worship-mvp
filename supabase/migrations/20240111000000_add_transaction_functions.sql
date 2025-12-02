CREATE OR REPLACE FUNCTION process_wallet_transaction(
  p_user_id UUID,
  p_transaction_type VARCHAR(50),
  p_amount_wc DECIMAL(10, 2),
  p_description TEXT DEFAULT NULL,
  p_related_entity_type VARCHAR(50) DEFAULT NULL,
  p_related_entity_id VARCHAR(255) DEFAULT NULL
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
    related_entity_id
  ) VALUES (
    p_user_id,
    p_transaction_type,
    p_amount_wc,
    v_new_balance,
    p_description,
    p_related_entity_type,
    p_related_entity_id
  ) RETURNING transaction_id INTO v_transaction_id;

  UPDATE Wallets
  SET balance_wc = v_new_balance
  WHERE user_id = p_user_id;

  RETURN json_build_object(
    'transaction_id', v_transaction_id,
    'old_balance', v_current_balance,
    'new_balance', v_new_balance
  );
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION process_escrow_lock(
  p_user_id UUID,
  p_amount_wc DECIMAL(10, 2),
  p_booking_id VARCHAR(255)
) RETURNS JSON AS $$
DECLARE
  v_current_balance DECIMAL(10, 2);
  v_current_escrow DECIMAL(10, 2);
  v_new_balance DECIMAL(10, 2);
  v_new_escrow DECIMAL(10, 2);
  v_escrow_id UUID;
  v_transaction_id UUID;
BEGIN
  SELECT balance_wc, escrow_balance_wc INTO v_current_balance, v_current_escrow
  FROM Wallets
  WHERE user_id = p_user_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Wallet not found for user_id: %', p_user_id;
  END IF;

  IF v_current_balance < p_amount_wc THEN
    RAISE EXCEPTION 'Insufficient balance. Current: %, Required: %', v_current_balance, p_amount_wc;
  END IF;

  v_new_balance := v_current_balance - p_amount_wc;
  v_new_escrow := v_current_escrow + p_amount_wc;

  INSERT INTO EscrowTransactions (
    user_id,
    amount_wc,
    booking_id,
    status
  ) VALUES (
    p_user_id,
    p_amount_wc,
    p_booking_id,
    'locked'
  ) RETURNING escrow_id INTO v_escrow_id;

  INSERT INTO CoinTransactions (
    user_id,
    transaction_type,
    amount_wc,
    balance_after_wc,
    description,
    related_entity_type,
    related_entity_id
  ) VALUES (
    p_user_id,
    'escrow_lock',
    -p_amount_wc,
    v_new_balance,
    'Escrow locked for booking ' || p_booking_id,
    'booking',
    p_booking_id
  ) RETURNING transaction_id INTO v_transaction_id;

  UPDATE Wallets
  SET balance_wc = v_new_balance,
      escrow_balance_wc = v_new_escrow
  WHERE user_id = p_user_id;

  RETURN json_build_object(
    'escrow_id', v_escrow_id,
    'transaction_id', v_transaction_id,
    'new_balance_wc', v_new_balance,
    'escrow_balance_wc', v_new_escrow
  );
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION process_escrow_release(
  p_user_id UUID,
  p_amount_wc DECIMAL(10, 2),
  p_booking_id VARCHAR(255)
) RETURNS JSON AS $$
DECLARE
  v_escrow_id UUID;
  v_escrow_amount DECIMAL(10, 2);
  v_current_balance DECIMAL(10, 2);
  v_current_escrow DECIMAL(10, 2);
  v_new_balance DECIMAL(10, 2);
  v_new_escrow DECIMAL(10, 2);
  v_transaction_id UUID;
BEGIN
  SELECT escrow_id, amount_wc INTO v_escrow_id, v_escrow_amount
  FROM EscrowTransactions
  WHERE user_id = p_user_id
    AND booking_id = p_booking_id
    AND status = 'locked'
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'No locked escrow found for booking: %', p_booking_id;
  END IF;

  IF v_escrow_amount != p_amount_wc THEN
    RAISE EXCEPTION 'Escrow amount mismatch. Expected: %, Got: %', v_escrow_amount, p_amount_wc;
  END IF;

  SELECT balance_wc, escrow_balance_wc INTO v_current_balance, v_current_escrow
  FROM Wallets
  WHERE user_id = p_user_id
  FOR UPDATE;

  IF v_current_escrow < p_amount_wc THEN
    RAISE EXCEPTION 'Insufficient escrow balance. Current: %, Required: %', v_current_escrow, p_amount_wc;
  END IF;

  v_new_balance := v_current_balance + p_amount_wc;
  v_new_escrow := v_current_escrow - p_amount_wc;

  UPDATE EscrowTransactions
  SET status = 'released',
      released_at = NOW()
  WHERE escrow_id = v_escrow_id;

  INSERT INTO CoinTransactions (
    user_id,
    transaction_type,
    amount_wc,
    balance_after_wc,
    description,
    related_entity_type,
    related_entity_id
  ) VALUES (
    p_user_id,
    'escrow_release',
    p_amount_wc,
    v_new_balance,
    'Escrow released for booking ' || p_booking_id,
    'booking',
    p_booking_id
  ) RETURNING transaction_id INTO v_transaction_id;

  UPDATE Wallets
  SET balance_wc = v_new_balance,
      escrow_balance_wc = v_new_escrow
  WHERE user_id = p_user_id;

  RETURN json_build_object(
    'transaction_id', v_transaction_id,
    'new_balance_wc', v_new_balance,
    'escrow_balance_wc', v_new_escrow
  );
END;
$$ LANGUAGE plpgsql;
