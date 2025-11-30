-- ============================================================================
-- FIX MISSING CASCADE DELETES
-- Critical: Add ON DELETE CASCADE to all foreign keys referencing Users
-- ============================================================================

-- ChatSessions: fan_id and creator_id
ALTER TABLE ChatSessions
DROP CONSTRAINT IF EXISTS chatsessions_fan_id_fkey,
DROP CONSTRAINT IF EXISTS chatsessions_creator_id_fkey;

ALTER TABLE ChatSessions
ADD CONSTRAINT chatsessions_fan_id_fkey 
  FOREIGN KEY (fan_id) REFERENCES Users(user_id) ON DELETE CASCADE,
ADD CONSTRAINT chatsessions_creator_id_fkey 
  FOREIGN KEY (creator_id) REFERENCES Users(user_id) ON DELETE CASCADE;

-- ChatMessages: sender_id
ALTER TABLE ChatMessages
DROP CONSTRAINT IF EXISTS chatmessages_sender_id_fkey;

ALTER TABLE ChatMessages
ADD CONSTRAINT chatmessages_sender_id_fkey 
  FOREIGN KEY (sender_id) REFERENCES Users(user_id) ON DELETE CASCADE;

-- PaidMedia: creator_id and fan_id
ALTER TABLE PaidMedia
DROP CONSTRAINT IF EXISTS paidmedia_creator_id_fkey,
DROP CONSTRAINT IF EXISTS paidmedia_fan_id_fkey;

ALTER TABLE PaidMedia
ADD CONSTRAINT paidmedia_creator_id_fkey 
  FOREIGN KEY (creator_id) REFERENCES Users(user_id) ON DELETE CASCADE,
ADD CONSTRAINT paidmedia_fan_id_fkey 
  FOREIGN KEY (fan_id) REFERENCES Users(user_id) ON DELETE CASCADE;

-- WebcamSessions: creator_id and primary_fan_id
ALTER TABLE WebcamSessions
DROP CONSTRAINT IF EXISTS webcamsessions_creator_id_fkey,
DROP CONSTRAINT IF EXISTS webcamsessions_primary_fan_id_fkey;

ALTER TABLE WebcamSessions
ADD CONSTRAINT webcamsessions_creator_id_fkey 
  FOREIGN KEY (creator_id) REFERENCES Users(user_id) ON DELETE CASCADE,
ADD CONSTRAINT webcamsessions_primary_fan_id_fkey 
  FOREIGN KEY (primary_fan_id) REFERENCES Users(user_id) ON DELETE CASCADE;

-- CommunityPosts: creator_id
ALTER TABLE CommunityPosts
DROP CONSTRAINT IF EXISTS communityposts_creator_id_fkey;

ALTER TABLE CommunityPosts
ADD CONSTRAINT communityposts_creator_id_fkey 
  FOREIGN KEY (creator_id) REFERENCES Users(user_id) ON DELETE CASCADE;

-- Bookings: fan_id and creator_id
ALTER TABLE Bookings
DROP CONSTRAINT IF EXISTS bookings_fan_id_fkey,
DROP CONSTRAINT IF EXISTS bookings_creator_id_fkey;

ALTER TABLE Bookings
ADD CONSTRAINT bookings_fan_id_fkey 
  FOREIGN KEY (fan_id) REFERENCES Users(user_id) ON DELETE CASCADE,
ADD CONSTRAINT bookings_creator_id_fkey 
  FOREIGN KEY (creator_id) REFERENCES Users(user_id) ON DELETE CASCADE;

-- Flags: resolved_by (nullable, so SET NULL is more appropriate)
ALTER TABLE Flags
DROP CONSTRAINT IF EXISTS flags_resolved_by_fkey;

ALTER TABLE Flags
ADD CONSTRAINT flags_resolved_by_fkey 
  FOREIGN KEY (resolved_by) REFERENCES Users(user_id) ON DELETE SET NULL;
