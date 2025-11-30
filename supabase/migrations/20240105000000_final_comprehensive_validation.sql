-- ============================================================================
-- FINAL COMPREHENSIVE DATABASE VALIDATION TEST
-- Tests: Schema integrity, triggers, cascades, constraints, indexes
-- ============================================================================

-- SECTION 1: CLEAN SLATE - Remove all test data
DELETE FROM Users WHERE email LIKE '%test%@example.com';

-- SECTION 2: TEST USER CREATION + WALLET AUTO-CREATION
INSERT INTO Users (email, username, password_hash, role, date_of_birth, country)
VALUES 
  ('test_fan@example.com', 'testfan', 'hash123', 'fan', '1990-01-01', 'USA'),
  ('test_creator@example.com', 'testcreator', 'hash456', 'creator', '1985-05-15', 'UK');

-- SECTION 3: VERIFY WALLETS AUTO-CREATED
SELECT 
  'TEST 1: Wallet Auto-Creation' as test_name,
  COUNT(*) as wallets_created,
  CASE 
    WHEN COUNT(*) = 2 THEN '✅ PASS'
    ELSE '❌ FAIL'
  END as status
FROM Wallets w
INNER JOIN Users u ON w.user_id = u.user_id
WHERE u.email LIKE '%test%@example.com';

-- SECTION 4: TEST CREATOR PROFILE CASCADE
INSERT INTO CreatorProfiles (user_id, tier, kyc_verified)
SELECT user_id, 1, FALSE 
FROM Users 
WHERE email = 'test_creator@example.com';

-- SECTION 5: TEST FAN PROFILE CASCADE
INSERT INTO FanProfiles (user_id, total_bookings)
SELECT user_id, 0
FROM Users 
WHERE email = 'test_fan@example.com';

-- SECTION 6: TEST COMMUNITY CASCADE
INSERT INTO Communities (creator_id, name, description, subscription_price_wc)
SELECT user_id, 'Test Community', 'Test Description', 10.00
FROM Users 
WHERE email = 'test_creator@example.com';

-- SECTION 7: TEST COMMUNITY POST CASCADE
INSERT INTO CommunityPosts (community_id, creator_id, post_type, content_text)
SELECT 
  c.community_id,
  c.creator_id,
  'text',
  'Test post content'
FROM Communities c
INNER JOIN Users u ON c.creator_id = u.user_id
WHERE u.email = 'test_creator@example.com';

-- SECTION 8: TEST CHAT SESSION CASCADE
INSERT INTO ChatSessions (fan_id, creator_id, status)
SELECT 
  (SELECT user_id FROM Users WHERE email = 'test_fan@example.com'),
  (SELECT user_id FROM Users WHERE email = 'test_creator@example.com'),
  'active';

-- SECTION 9: TEST CHAT MESSAGE CASCADE
INSERT INTO ChatMessages (session_id, sender_id, message_type, message_text)
SELECT 
  cs.session_id,
  cs.fan_id,
  'text',
  'Test message'
FROM ChatSessions cs
INNER JOIN Users u ON cs.fan_id = u.user_id
WHERE u.email = 'test_fan@example.com';

-- SECTION 10: TEST COIN TRANSACTION CASCADE
INSERT INTO CoinTransactions (user_id, transaction_type, amount_wc, balance_after_wc)
SELECT user_id, 'top_up', 100.00, 100.00
FROM Users 
WHERE email = 'test_fan@example.com';

-- SECTION 11: TEST BOOKING CASCADE
INSERT INTO Bookings (fan_id, creator_id, booking_type, booking_date, start_time, duration_minutes, total_fee_wc, deposit_wc, balance_wc)
SELECT 
  (SELECT user_id FROM Users WHERE email = 'test_fan@example.com'),
  (SELECT user_id FROM Users WHERE email = 'test_creator@example.com'),
  'video_call',
  CURRENT_DATE + INTERVAL '7 days',
  '14:00:00',
  60,
  100.00,
  50.00,
  50.00;

-- SECTION 12: TEST FLAG CASCADE
INSERT INTO Flags (user_id, flag_type, reason)
SELECT user_id, 'yellow', 'Test flag'
FROM Users 
WHERE email = 'test_fan@example.com';

-- SECTION 13: VERIFY ALL RELATIONSHIPS EXIST
SELECT 
  'TEST 2: All Relationships Created' as test_name,
  (SELECT COUNT(*) FROM Users WHERE email LIKE '%test%@example.com') as users,
  (SELECT COUNT(*) FROM Wallets w INNER JOIN Users u ON w.user_id = u.user_id WHERE u.email LIKE '%test%@example.com') as wallets,
  (SELECT COUNT(*) FROM CreatorProfiles cp INNER JOIN Users u ON cp.user_id = u.user_id WHERE u.email = 'test_creator@example.com') as creator_profiles,
  (SELECT COUNT(*) FROM FanProfiles fp INNER JOIN Users u ON fp.user_id = u.user_id WHERE u.email = 'test_fan@example.com') as fan_profiles,
  (SELECT COUNT(*) FROM Communities c INNER JOIN Users u ON c.creator_id = u.user_id WHERE u.email = 'test_creator@example.com') as communities,
  (SELECT COUNT(*) FROM CommunityPosts cp INNER JOIN Users u ON cp.creator_id = u.user_id WHERE u.email = 'test_creator@example.com') as posts,
  (SELECT COUNT(*) FROM ChatSessions cs INNER JOIN Users u ON cs.fan_id = u.user_id WHERE u.email = 'test_fan@example.com') as chat_sessions,
  (SELECT COUNT(*) FROM ChatMessages cm INNER JOIN ChatSessions cs ON cm.session_id = cs.session_id INNER JOIN Users u ON cs.fan_id = u.user_id WHERE u.email = 'test_fan@example.com') as chat_messages,
  (SELECT COUNT(*) FROM CoinTransactions ct INNER JOIN Users u ON ct.user_id = u.user_id WHERE u.email = 'test_fan@example.com') as transactions,
  (SELECT COUNT(*) FROM Bookings b INNER JOIN Users u ON b.fan_id = u.user_id WHERE u.email = 'test_fan@example.com') as bookings,
  (SELECT COUNT(*) FROM Flags f INNER JOIN Users u ON f.user_id = u.user_id WHERE u.email = 'test_fan@example.com') as flags;

-- SECTION 14: TEST CASCADE DELETE ON FAN
DELETE FROM Users WHERE email = 'test_fan@example.com';

-- SECTION 15: VERIFY FAN CASCADE WORKED
SELECT 
  'TEST 3: Fan Cascade Delete' as test_name,
  (SELECT COUNT(*) FROM Users WHERE email = 'test_fan@example.com') as remaining_users,
  (SELECT COUNT(*) FROM Wallets w WHERE w.user_id = (SELECT user_id FROM Users WHERE email = 'test_fan@example.com')) as remaining_wallets,
  (SELECT COUNT(*) FROM FanProfiles fp WHERE fp.user_id = (SELECT user_id FROM Users WHERE email = 'test_fan@example.com')) as remaining_fan_profiles,
  (SELECT COUNT(*) FROM CoinTransactions ct WHERE ct.user_id = (SELECT user_id FROM Users WHERE email = 'test_fan@example.com')) as remaining_transactions,
  (SELECT COUNT(*) FROM Flags f WHERE f.user_id = (SELECT user_id FROM Users WHERE email = 'test_fan@example.com')) as remaining_flags,
  CASE 
    WHEN (SELECT COUNT(*) FROM Users WHERE email = 'test_fan@example.com') = 0 
     AND (SELECT COUNT(*) FROM Wallets w INNER JOIN Users u ON w.user_id = u.user_id WHERE u.email = 'test_fan@example.com') = 0
    THEN '✅ PASS - All fan data deleted'
    ELSE '❌ FAIL - Orphaned data exists'
  END as status;

-- SECTION 16: TEST CASCADE DELETE ON CREATOR
DELETE FROM Users WHERE email = 'test_creator@example.com';

-- SECTION 17: VERIFY CREATOR CASCADE WORKED
SELECT 
  'TEST 4: Creator Cascade Delete' as test_name,
  (SELECT COUNT(*) FROM Users WHERE email = 'test_creator@example.com') as remaining_users,
  (SELECT COUNT(*) FROM Wallets w INNER JOIN Users u ON w.user_id = u.user_id WHERE u.email = 'test_creator@example.com') as remaining_wallets,
  (SELECT COUNT(*) FROM CreatorProfiles cp INNER JOIN Users u ON cp.user_id = u.user_id WHERE u.email = 'test_creator@example.com') as remaining_creator_profiles,
  (SELECT COUNT(*) FROM Communities c INNER JOIN Users u ON c.creator_id = u.user_id WHERE u.email = 'test_creator@example.com') as remaining_communities,
  (SELECT COUNT(*) FROM CommunityPosts cp INNER JOIN Communities c ON cp.community_id = c.community_id INNER JOIN Users u ON c.creator_id = u.user_id WHERE u.email = 'test_creator@example.com') as remaining_posts,
  CASE 
    WHEN (SELECT COUNT(*) FROM Users WHERE email = 'test_creator@example.com') = 0 
     AND (SELECT COUNT(*) FROM Communities c INNER JOIN Users u ON c.creator_id = u.user_id WHERE u.email = 'test_creator@example.com') = 0
    THEN '✅ PASS - All creator data deleted'
    ELSE '❌ FAIL - Orphaned data exists'
  END as status;

-- SECTION 18: TEST CONSTRAINT VALIDATIONS
INSERT INTO Users (email, username, password_hash, role, date_of_birth, country)
VALUES ('test_constraints@example.com', 'testconstraints', 'hash789', 'fan', '1992-03-20', 'Canada');

-- Test wallet balance constraint (should fail if negative)
DO $$
BEGIN
  UPDATE Wallets 
  SET balance_wc = -10.00 
  WHERE user_id = (SELECT user_id FROM Users WHERE email = 'test_constraints@example.com');
  RAISE EXCEPTION 'TEST 5: Balance Constraint - ❌ FAIL - Negative balance allowed';
EXCEPTION
  WHEN check_violation THEN
    RAISE NOTICE 'TEST 5: Balance Constraint - ✅ PASS - Negative balance blocked';
END $$;

-- Test role constraint (should fail with invalid role)
DO $$
BEGIN
  INSERT INTO Users (email, username, password_hash, role, date_of_birth, country)
  VALUES ('test_invalid_role@example.com', 'invalidrole', 'hash999', 'superuser', '1990-01-01', 'USA');
  RAISE EXCEPTION 'TEST 6: Role Constraint - ❌ FAIL - Invalid role allowed';
EXCEPTION
  WHEN check_violation THEN
    RAISE NOTICE 'TEST 6: Role Constraint - ✅ PASS - Invalid role blocked';
END $$;

-- Test account status constraint
DO $$
BEGIN
  UPDATE Users 
  SET account_status = 'suspended'
  WHERE email = 'test_constraints@example.com';
  RAISE EXCEPTION 'TEST 7: Status Constraint - ❌ FAIL - Invalid status allowed';
EXCEPTION
  WHEN check_violation THEN
    RAISE NOTICE 'TEST 7: Status Constraint - ✅ PASS - Invalid status blocked';
END $$;

-- SECTION 19: TEST UNIQUE CONSTRAINTS
DO $$
BEGIN
  INSERT INTO Users (email, username, password_hash, role, date_of_birth, country)
  VALUES ('test_constraints@example.com', 'duplicate_email', 'hash000', 'fan', '1990-01-01', 'USA');
  RAISE EXCEPTION 'TEST 8: Email Unique Constraint - ❌ FAIL - Duplicate email allowed';
EXCEPTION
  WHEN unique_violation THEN
    RAISE NOTICE 'TEST 8: Email Unique Constraint - ✅ PASS - Duplicate email blocked';
END $$;

-- SECTION 20: VERIFY INDEXES EXIST
SELECT 
  'TEST 9: Index Verification' as test_name,
  COUNT(*) as total_indexes,
  CASE 
    WHEN COUNT(*) >= 30 THEN '✅ PASS - All indexes exist'
    ELSE '❌ FAIL - Missing indexes'
  END as status
FROM pg_indexes 
WHERE schemaname = 'public' 
AND tablename IN (
  'users', 'wallets', 'cointransactions', 'creatorprofiles', 
  'fanprofiles', 'chatsessions', 'chatmessages', 'paidmedia',
  'webcamsessions', 'communities', 'communityposts', 'communitysubscriptions',
  'availabilityslots', 'bookings', 'flags'
);

-- SECTION 21: CLEANUP TEST DATA
DELETE FROM Users WHERE email LIKE '%test%@example.com';

-- SECTION 22: FINAL VERIFICATION - NO ORPHANED DATA
SELECT 
  'TEST 10: Final Cleanup Verification' as test_name,
  (SELECT COUNT(*) FROM Users WHERE email LIKE '%test%@example.com') as remaining_users,
  (SELECT COUNT(*) FROM Wallets w WHERE NOT EXISTS (SELECT 1 FROM Users u WHERE u.user_id = w.user_id)) as orphaned_wallets,
  (SELECT COUNT(*) FROM CreatorProfiles cp WHERE NOT EXISTS (SELECT 1 FROM Users u WHERE u.user_id = cp.user_id)) as orphaned_creator_profiles,
  (SELECT COUNT(*) FROM FanProfiles fp WHERE NOT EXISTS (SELECT 1 FROM Users u WHERE u.user_id = fp.user_id)) as orphaned_fan_profiles,
  (SELECT COUNT(*) FROM Communities c WHERE NOT EXISTS (SELECT 1 FROM Users u WHERE u.user_id = c.creator_id)) as orphaned_communities,
  (SELECT COUNT(*) FROM CoinTransactions ct WHERE NOT EXISTS (SELECT 1 FROM Users u WHERE u.user_id = ct.user_id)) as orphaned_transactions,
  CASE 
    WHEN (SELECT COUNT(*) FROM Wallets w WHERE NOT EXISTS (SELECT 1 FROM Users u WHERE u.user_id = w.user_id)) = 0
     AND (SELECT COUNT(*) FROM CreatorProfiles cp WHERE NOT EXISTS (SELECT 1 FROM Users u WHERE u.user_id = cp.user_id)) = 0
     AND (SELECT COUNT(*) FROM FanProfiles fp WHERE NOT EXISTS (SELECT 1 FROM Users u WHERE u.user_id = fp.user_id)) = 0
    THEN '✅ PASS - No orphaned data'
    ELSE '❌ FAIL - Orphaned data found'
  END as status;

-- SECTION 23: SUMMARY REPORT
SELECT 
  '=== FINAL DATABASE VALIDATION SUMMARY ===' as report_title,
  'All 10 critical tests completed' as test_coverage,
  'Check results above for pass/fail status' as instructions;
