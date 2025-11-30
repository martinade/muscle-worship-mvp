-- Module 0: Database Foundation - Complete Schema
-- Muscle Worship Platform - 15 Core Tables

-- ============================================================================
-- TABLE 1: Users
-- Purpose: All users (fans AND creators) - shared fields
-- ============================================================================
CREATE TABLE Users (
  user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('fan', 'creator', 'admin')),
  date_of_birth DATE NOT NULL,
  country VARCHAR(100) NOT NULL,
  city VARCHAR(100),
  timezone VARCHAR(50) DEFAULT 'UTC',
  account_status VARCHAR(20) DEFAULT 'active' CHECK (account_status IN ('active', 'dormant', 'banned')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_users_email ON Users(email);
CREATE INDEX idx_users_role ON Users(role);
CREATE INDEX idx_users_status ON Users(account_status);

-- ============================================================================
-- TABLE 2: Wallets
-- Purpose: Track Worship Coin balance for each user
-- ============================================================================
CREATE TABLE Wallets (
  wallet_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES Users(user_id) ON DELETE CASCADE,
  balance_wc DECIMAL(10, 2) DEFAULT 0.00 NOT NULL CHECK (balance_wc >= 0),
  auto_topup_enabled BOOLEAN DEFAULT TRUE,
  auto_topup_threshold_wc DECIMAL(10, 2) DEFAULT 50.00,
  auto_topup_amount_wc DECIMAL(10, 2) DEFAULT 100.00,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_wallets_user ON Wallets(user_id);
CREATE INDEX idx_wallets_balance ON Wallets(balance_wc);

-- ============================================================================
-- TABLE 3: CoinTransactions (CRITICAL - Ledger System)
-- Purpose: Append-only log of every WC movement
-- ============================================================================
CREATE TABLE CoinTransactions (
  transaction_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES Users(user_id) ON DELETE CASCADE,
  transaction_type VARCHAR(50) NOT NULL CHECK (transaction_type IN (
    'top_up', 'debit', 'credit', 'refund', 'penalty', 
    'escrow_lock', 'escrow_release', 'commission_earned', 'payout'
  )),
  amount_wc DECIMAL(10, 2) NOT NULL,
  balance_after_wc DECIMAL(10, 2) NOT NULL,
  related_entity_type VARCHAR(50),
  related_entity_id UUID,
  description TEXT,
  payment_reference VARCHAR(255),
  platform_fee_wc DECIMAL(10, 2) DEFAULT 0.00,
  creator_earnings_wc DECIMAL(10, 2) DEFAULT 0.00,
  commission_rate DECIMAL(5, 4) DEFAULT 0.20,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_transactions_user ON CoinTransactions(user_id);
CREATE INDEX idx_transactions_type ON CoinTransactions(transaction_type);
CREATE INDEX idx_transactions_date ON CoinTransactions(created_at DESC);
CREATE INDEX idx_transactions_related ON CoinTransactions(related_entity_type, related_entity_id);

-- ============================================================================
-- TABLE 4: CreatorProfiles
-- Purpose: Creator-specific information and settings
-- ============================================================================
CREATE TABLE CreatorProfiles (
  profile_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES Users(user_id) ON DELETE CASCADE,
  
  -- Tier & Verification
  tier INTEGER DEFAULT 1 CHECK (tier IN (1, 2)),
  kyc_verified BOOLEAN DEFAULT FALSE,
  kyc_verified_at TIMESTAMP,
  selfie_video_url TEXT,
  
  -- Tax Documents
  tax_form_type VARCHAR(20),
  tax_form_url TEXT,
  tax_id_last_four VARCHAR(4),
  
  -- Physical Stats
  gender VARCHAR(50),
  orientation VARCHAR(50),
  height_cm INTEGER,
  weight_kg DECIMAL(5, 2),
  body_fat_percentage DECIMAL(4, 2),
  
  -- Optional Stats
  shoe_size VARCHAR(20),
  division VARCHAR(50),
  specialties TEXT[],
  best_body_parts TEXT[],
  max_bench_kg DECIMAL(6, 2),
  max_squat_kg DECIMAL(6, 2),
  max_deadlift_kg DECIMAL(6, 2),
  competition_history TEXT,
  
  -- Pricing (per minute/hour in WC)
  text_chat_rate_wc DECIMAL(10, 2),
  webcam_rate_per_min_wc DECIMAL(10, 2),
  video_call_rate_per_hour_wc DECIMAL(10, 2),
  inperson_rate_per_hour_wc DECIMAL(10, 2),
  community_subscription_wc DECIMAL(10, 2),
  
  -- Services Offered
  services_offered TEXT[] DEFAULT ARRAY['text_chat', 'community'],
  
  -- Stats & Reputation
  total_sessions_completed INTEGER DEFAULT 0,
  average_rating DECIMAL(3, 2) DEFAULT 0.00,
  total_reviews INTEGER DEFAULT 0,
  
  -- Media
  profile_photos TEXT[],
  promo_videos TEXT[],
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_creator_user ON CreatorProfiles(user_id);
CREATE INDEX idx_creator_tier ON CreatorProfiles(tier);
CREATE INDEX idx_creator_rating ON CreatorProfiles(average_rating DESC);
CREATE INDEX idx_creator_verified ON CreatorProfiles(kyc_verified);

-- ============================================================================
-- TABLE 5: FanProfiles
-- Purpose: Fan-specific information
-- ============================================================================
CREATE TABLE FanProfiles (
  profile_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES Users(user_id) ON DELETE CASCADE,
  
  -- Preferences
  preferred_gender TEXT[],
  preferred_body_types TEXT[],
  preferred_specialties TEXT[],
  
  -- Reputation
  total_bookings INTEGER DEFAULT 0,
  no_show_count INTEGER DEFAULT 0,
  late_cancellation_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_fan_user ON FanProfiles(user_id);

-- ============================================================================
-- TABLE 6: ChatSessions
-- Purpose: Track 1:1 conversations between fan and creator
-- ============================================================================
CREATE TABLE ChatSessions (
  session_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fan_id UUID NOT NULL REFERENCES Users(user_id),
  creator_id UUID NOT NULL REFERENCES Users(user_id),
  started_at TIMESTAMP DEFAULT NOW(),
  ended_at TIMESTAMP,
  total_cost_wc DECIMAL(10, 2) DEFAULT 0.00,
  free_media_used INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'ended')),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_chat_fan ON ChatSessions(fan_id);
CREATE INDEX idx_chat_creator ON ChatSessions(creator_id);
CREATE INDEX idx_chat_status ON ChatSessions(status);

-- ============================================================================
-- TABLE 7: ChatMessages
-- Purpose: Individual messages within chat sessions
-- ============================================================================
CREATE TABLE ChatMessages (
  message_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES ChatSessions(session_id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES Users(user_id),
  message_type VARCHAR(20) DEFAULT 'text' CHECK (message_type IN ('text', 'paid_media', 'system')),
  message_text TEXT,
  media_url TEXT,
  cost_wc DECIMAL(10, 2) DEFAULT 0.00,
  is_flagged BOOLEAN DEFAULT FALSE,
  flag_reason TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_messages_session ON ChatMessages(session_id);
CREATE INDEX idx_messages_sender ON ChatMessages(sender_id);
CREATE INDEX idx_messages_flagged ON ChatMessages(is_flagged);

-- ============================================================================
-- TABLE 8: PaidMedia
-- Purpose: Track paid photos/videos sold via chat
-- ============================================================================
CREATE TABLE PaidMedia (
  media_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL REFERENCES Users(user_id),
  fan_id UUID NOT NULL REFERENCES Users(user_id),
  session_id UUID REFERENCES ChatSessions(session_id),
  media_type VARCHAR(20) CHECK (media_type IN ('photo', 'video')),
  media_url TEXT NOT NULL,
  price_wc DECIMAL(10, 2) NOT NULL,
  is_free BOOLEAN DEFAULT FALSE,
  purchased_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_paid_media_creator ON PaidMedia(creator_id);
CREATE INDEX idx_paid_media_fan ON PaidMedia(fan_id);

-- ============================================================================
-- TABLE 9: WebcamSessions
-- Purpose: Live webcam sessions (public/private)
-- ============================================================================
CREATE TABLE WebcamSessions (
  session_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL REFERENCES Users(user_id),
  room_type VARCHAR(20) CHECK (room_type IN ('private_1on1', 'private_voyeur', 'public')),
  primary_fan_id UUID REFERENCES Users(user_id),
  started_at TIMESTAMP DEFAULT NOW(),
  ended_at TIMESTAMP,
  duration_minutes INTEGER,
  rate_per_min_wc DECIMAL(10, 2),
  total_cost_wc DECIMAL(10, 2),
  voyeur_count INTEGER DEFAULT 0,
  agora_channel_id VARCHAR(255),
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'ended')),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_webcam_creator ON WebcamSessions(creator_id);
CREATE INDEX idx_webcam_fan ON WebcamSessions(primary_fan_id);

-- ============================================================================
-- TABLE 10: Communities
-- Purpose: Creator subscription communities
-- ============================================================================
CREATE TABLE Communities (
  community_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID UNIQUE NOT NULL REFERENCES Users(user_id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  subscription_price_wc DECIMAL(10, 2) NOT NULL,
  total_subscribers INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_community_creator ON Communities(creator_id);

-- ============================================================================
-- TABLE 11: CommunityPosts
-- Purpose: Content posted in communities
-- ============================================================================
CREATE TABLE CommunityPosts (
  post_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id UUID NOT NULL REFERENCES Communities(community_id) ON DELETE CASCADE,
  creator_id UUID NOT NULL REFERENCES Users(user_id),
  post_type VARCHAR(20) CHECK (post_type IN ('text', 'photo', 'video', 'poll', 'audio')),
  content_text TEXT,
  media_urls TEXT[],
  poll_options JSONB,
  scheduled_for TIMESTAMP,
  expires_at TIMESTAMP,
  is_paid BOOLEAN DEFAULT FALSE,
  pay_amount_wc DECIMAL(10, 2),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_posts_community ON CommunityPosts(community_id);
CREATE INDEX idx_posts_creator ON CommunityPosts(creator_id);
CREATE INDEX idx_posts_scheduled ON CommunityPosts(scheduled_for);

-- ============================================================================
-- TABLE 12: CommunitySubscriptions
-- Purpose: Fan subscriptions to creator communities
-- ============================================================================
CREATE TABLE CommunitySubscriptions (
  subscription_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id UUID NOT NULL REFERENCES Communities(community_id) ON DELETE CASCADE,
  fan_id UUID NOT NULL REFERENCES Users(user_id) ON DELETE CASCADE,
  subscribed_at TIMESTAMP DEFAULT NOW(),
  next_renewal_date DATE NOT NULL,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired')),
  UNIQUE(community_id, fan_id)
);

CREATE INDEX idx_subs_community ON CommunitySubscriptions(community_id);
CREATE INDEX idx_subs_fan ON CommunitySubscriptions(fan_id);
CREATE INDEX idx_subs_renewal ON CommunitySubscriptions(next_renewal_date);

-- ============================================================================
-- TABLE 13: AvailabilitySlots
-- Purpose: Creator calendar for bookings
-- ============================================================================
CREATE TABLE AvailabilitySlots (
  slot_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL REFERENCES Users(user_id) ON DELETE CASCADE,
  slot_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  slot_type VARCHAR(20) CHECK (slot_type IN ('video_call', 'in_person', 'general')),
  is_blocked BOOLEAN DEFAULT FALSE,
  is_recurring BOOLEAN DEFAULT FALSE,
  recurrence_pattern VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_slots_creator ON AvailabilitySlots(creator_id);
CREATE INDEX idx_slots_date ON AvailabilitySlots(slot_date);
CREATE INDEX idx_slots_type ON AvailabilitySlots(slot_type);

-- ============================================================================
-- TABLE 14: Bookings
-- Purpose: Video calls AND in-person sessions
-- ============================================================================
CREATE TABLE Bookings (
  booking_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fan_id UUID NOT NULL REFERENCES Users(user_id),
  creator_id UUID NOT NULL REFERENCES Users(user_id),
  booking_type VARCHAR(20) CHECK (booking_type IN ('video_call', 'in_person')),
  
  -- Scheduling
  booking_date DATE NOT NULL,
  start_time TIME NOT NULL,
  duration_minutes INTEGER NOT NULL,
  
  -- Location (for in-person)
  location_city VARCHAR(100),
  location_country VARCHAR(100),
  
  -- Financial
  total_fee_wc DECIMAL(10, 2) NOT NULL,
  deposit_wc DECIMAL(10, 2) NOT NULL,
  balance_wc DECIMAL(10, 2) NOT NULL,
  service_fee_wc DECIMAL(10, 2) DEFAULT 0.00,
  escrow_amount_wc DECIMAL(10, 2) DEFAULT 0.00,
  
  -- Status
  status VARCHAR(30) DEFAULT 'pending' CHECK (status IN (
    'pending', 'confirmed', 'deposit_paid', 'balance_paid', 
    'in_progress', 'completed', 'cancelled', 'disputed'
  )),
  
  -- Logistics (in-person only)
  ai_estimate_wc DECIMAL(10, 2),
  final_quote_wc DECIMAL(10, 2),
  travel_bookings JSONB,
  
  -- Reschedule tracking
  reschedule_count INTEGER DEFAULT 0,
  reschedule_reason TEXT,
  is_legitimate_reason BOOLEAN,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_bookings_fan ON Bookings(fan_id);
CREATE INDEX idx_bookings_creator ON Bookings(creator_id);
CREATE INDEX idx_bookings_type ON Bookings(booking_type);
CREATE INDEX idx_bookings_status ON Bookings(status);
CREATE INDEX idx_bookings_date ON Bookings(booking_date);

-- ============================================================================
-- TABLE 15: Flags
-- Purpose: Track yellow/red flags for penalties
-- ============================================================================
CREATE TABLE Flags (
  flag_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES Users(user_id) ON DELETE CASCADE,
  flag_type VARCHAR(20) CHECK (flag_type IN ('yellow', 'red')),
  flag_count INTEGER DEFAULT 1,
  reason TEXT NOT NULL,
  related_booking_id UUID REFERENCES Bookings(booking_id),
  is_resolved BOOLEAN DEFAULT FALSE,
  resolved_by UUID REFERENCES Users(user_id),
  resolved_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_flags_user ON Flags(user_id);
CREATE INDEX idx_flags_type ON Flags(flag_type);
CREATE INDEX idx_flags_resolved ON Flags(is_resolved);
