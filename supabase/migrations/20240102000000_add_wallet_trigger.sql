-- ============================================================================
-- Auto-create wallet for new users
-- ============================================================================

CREATE OR REPLACE FUNCTION create_wallet_for_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO Wallets (user_id, balance_wc, auto_topup_enabled, auto_topup_threshold_wc, auto_topup_amount_wc)
  VALUES (NEW.user_id, 0.00, TRUE, 50.00, 100.00);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_create_wallet_after_user_insert
AFTER INSERT ON Users
FOR EACH ROW
EXECUTE FUNCTION create_wallet_for_user();
