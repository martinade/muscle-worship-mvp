-- Upsert test user (insert or update if exists)
INSERT INTO Users (email, username, password_hash, role, date_of_birth, country, account_status)
VALUES ('test@example.com', 'testuser', 'dummy_hash_123', 'fan', '1990-01-01', 'USA', 'active')
ON CONFLICT (email) DO UPDATE
SET username       = EXCLUDED.username,
    password_hash  = EXCLUDED.password_hash,
    role           = EXCLUDED.role,
    date_of_birth  = EXCLUDED.date_of_birth,
    country        = EXCLUDED.country,
    account_status = EXCLUDED.account_status;

-- Verify wallet was auto-created
SELECT 
  u.user_id, 
  u.email, 
  u.username,
  w.wallet_id, 
  w.balance_wc, 
  w.auto_topup_enabled
FROM Users u
LEFT JOIN Wallets w ON u.user_id = w.user_id
WHERE u.email = 'test@example.com';
