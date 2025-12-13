ALTER TABLE creatorprofiles 
ADD COLUMN IF NOT EXISTS kyc_submitted_at TIMESTAMP;
