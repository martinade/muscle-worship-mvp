-- COMPREHENSIVE TEST SCRIPT FOR UPSERT AND TRIGGER FUNCTIONALITY
-- Run this entire script in Supabase SQL Editor to verify everything works

-- TEST 1: Verify UPSERT works (insert new user)
INSERT INTO Users (email, username, password_hash, role, date_of_birth, country, account_status)
VALUES ('test_new@example.com', 'newuser', 'hash_456', 'fan', '1995-05-15', 'Canada', 'active')
ON CONFLICT (email) DO UPDATE
SET username       = EXCLUDED.username,
    password_hash  = EXCLUDED.password_hash,
    role           = EXCLUDED.role,
    date_of_birth  = EXCLUDED.date_of_birth,
    country        = EXCLUDED.country,
    account_status = EXCLUDED.account_status;

-- TEST 2: Verify UPSERT works (update existing user)
INSERT INTO Users (email, username, password_hash, role, date_of_birth, country, account_status)
VALUES ('test@example.com', 'testuser_verified', 'dummy_hash_123', 'fan', '1990-01-01', 'USA', 'active')
ON CONFLICT (email) DO UPDATE
SET username       = EXCLUDED.username,
    password_hash  = EXCLUDED.password_hash,
    role           = EXCLUDED.role,
    date_of_birth  = EXCLUDED.date_of_birth,
    country        = EXCLUDED.country,
    account_status = EXCLUDED.account_status;

-- TEST 3: Run same UPSERT again (should not error)
INSERT INTO Users (email, username, password_hash, role, date_of_birth, country, account_status)
VALUES ('test@example.com', 'testuser_verified', 'dummy_hash_123', 'fan', '1990-01-01', 'USA', 'active')
ON CONFLICT (email) DO UPDATE
SET username       = EXCLUDED.username,
    password_hash  = EXCLUDED.password_hash,
    role           = EXCLUDED.role,
    date_of_birth  = EXCLUDED.date_of_birth,
    country        = EXCLUDED.country,
    account_status = EXCLUDED.account_status;

-- TEST 4: Verify both users exist with wallets (trigger working)
SELECT 
  u.user_id, 
  u.email, 
  u.username,
  u.role,
  u.account_status,
  w.wallet_id, 
  w.balance_wc, 
  w.auto_topup_enabled,
  CASE 
    WHEN w.wallet_id IS NOT NULL THEN '✅ Wallet Created'
    ELSE '❌ No Wallet'
  END as wallet_status
FROM Users u
LEFT JOIN Wallets w ON u.user_id = w.user_id
WHERE u.email IN ('test@example.com', 'test_new@example.com')
ORDER BY u.email;

-- TEST 5: Count total users and wallets (should match)
SELECT 
  (SELECT COUNT(*) FROM Users WHERE email LIKE '%@example.com') as total_test_users,
  (SELECT COUNT(*) FROM Wallets w 
   INNER JOIN Users u ON w.user_id = u.user_id 
   WHERE u.email LIKE '%@example.com') as total_test_wallets,
  CASE 
    WHEN (SELECT COUNT(*) FROM Users WHERE email LIKE '%@example.com') = 
         (SELECT COUNT(*) FROM Wallets w 
          INNER JOIN Users u ON w.user_id = u.user_id 
          WHERE u.email LIKE '%@example.com')
    THEN '✅ All users have wallets'
    ELSE '❌ Wallet count mismatch'
  END as validation_status;

-- TEST 6: Verify unique constraint is still enforced (this should succeed with UPSERT)
INSERT INTO Users (email, username, password_hash, role, date_of_birth, country, account_status)
VALUES ('test@example.com', 'testuser_final', 'dummy_hash_123', 'fan', '1990-01-01', 'USA', 'active')
ON CONFLICT (email) DO UPDATE
SET username = EXCLUDED.username;

-- FINAL VERIFICATION: Show final state
SELECT 
  '=== FINAL TEST RESULTS ===' as test_section,
  u.email, 
  u.username,
  u.created_at,
  w.wallet_id IS NOT NULL as has_wallet
FROM Users u
LEFT JOIN Wallets w ON u.user_id = w.user_id
WHERE u.email LIKE '%@example.com'
ORDER BY u.email;
