ALTER TABLE Wallets ADD COLUMN IF NOT EXISTS escrow_balance_wc DECIMAL(10, 2) DEFAULT 0.00 NOT NULL CHECK (escrow_balance_wc >= 0);

CREATE INDEX IF NOT EXISTS idx_wallets_escrow_balance ON Wallets(escrow_balance_wc);

CREATE TABLE IF NOT EXISTS EscrowTransactions (
  escrow_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES Users(user_id) ON DELETE CASCADE,
  amount_wc DECIMAL(10, 2) NOT NULL CHECK (amount_wc > 0),
  booking_id VARCHAR(255) NOT NULL,
  status VARCHAR(20) NOT NULL CHECK (status IN ('locked', 'released', 'refunded')) DEFAULT 'locked',
  locked_at TIMESTAMP DEFAULT NOW(),
  released_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_escrow_user ON EscrowTransactions(user_id);
CREATE INDEX IF NOT EXISTS idx_escrow_booking ON EscrowTransactions(booking_id);
CREATE INDEX IF NOT EXISTS idx_escrow_status ON EscrowTransactions(status);
