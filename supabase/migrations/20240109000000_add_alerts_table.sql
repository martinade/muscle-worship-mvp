CREATE TABLE IF NOT EXISTS Alerts (
  alert_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES Users(user_id) ON DELETE CASCADE,
  alert_type VARCHAR(50) NOT NULL CHECK (alert_type IN ('low_balance', 'auto_topup', 'payment_failed', 'booking_reminder', 'system')),
  message TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'unread' CHECK (status IN ('unread', 'read', 'dismissed')),
  created_at TIMESTAMP DEFAULT NOW(),
  read_at TIMESTAMP
);

CREATE INDEX idx_alerts_user ON Alerts(user_id);
CREATE INDEX idx_alerts_status ON Alerts(status);
CREATE INDEX idx_alerts_type ON Alerts(alert_type);
CREATE INDEX idx_alerts_created ON Alerts(created_at DESC);

CREATE OR REPLACE FUNCTION check_low_balance_and_alert()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.balance_wc < 100 AND OLD.balance_wc >= 100 THEN
    INSERT INTO Alerts (user_id, alert_type, message, status)
    VALUES (
      NEW.user_id,
      'low_balance',
      'Your wallet balance is low: ' || NEW.balance_wc || ' WC',
      'unread'
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_check_low_balance
AFTER UPDATE OF balance_wc ON Wallets
FOR EACH ROW
EXECUTE FUNCTION check_low_balance_and_alert();
