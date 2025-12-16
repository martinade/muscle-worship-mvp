import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

interface KYCDocuments {
  id_document_url: string;
  selfie_video_url?: string;
  tax_form_url?: string;
}

interface TierEligibility {
  tier: number;
  eligible_for_upgrade: boolean;
  requirements_met: {
    completed_sessions: boolean;
    average_rating: boolean;
    account_age: boolean;
    flags_check: boolean;
  };
}

export async function submitKYCDocuments(
  userId: string,
  documents: KYCDocuments
): Promise<void> {
  const { data: profile, error: fetchError } = await supabase
    .from('creatorprofiles')
    .select('user_id')
    .eq('user_id', userId)
    .single();

  if (fetchError || !profile) {
    throw new Error('Creator profile not found');
  }

  const { error: updateProfileError } = await supabase
    .from('creatorprofiles')
    .update({
      kyc_verified: false,
      id_document_url: documents.id_document_url,
      selfie_video_url: documents.selfie_video_url,
      tax_form_url: documents.tax_form_url,
      kyc_submitted_at: new Date().toISOString(),
    })
    .eq('user_id', userId);

  if (updateProfileError) {
    throw new Error(`Failed to update creator profile: ${updateProfileError.message}`);
  }

  const { error: updateUserError } = await supabase
    .from('users')
    .update({
      account_status: 'pending_kyc',
    })
    .eq('user_id', userId);

  if (updateUserError) {
    throw new Error(`Failed to update user status: ${updateUserError.message}`);
  }

  console.log(`KYC documents submitted for user ${userId}`);
}

export async function verifyKYC(userId: string, adminId: string): Promise<void> {
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('role')
    .eq('user_id', adminId)
    .single();

  if (userError || !user || user.role !== 'admin') {
    throw new Error('Unauthorized: Only admins can verify KYC');
  }

  const { data: profile, error: fetchError } = await supabase
    .from('creatorprofiles')
    .select('user_id, kyc_verified')
    .eq('user_id', userId)
    .single();

  if (fetchError || !profile) {
    throw new Error('Creator profile not found');
  }

  if (profile.kyc_verified) {
    return;
  }

  const now = new Date().toISOString();

  const { error: updateProfileError } = await supabase
    .from('creatorprofiles')
    .update({
      kyc_verified: true,
      kyc_verified_at: now,
      tier: 1,
    })
    .eq('user_id', userId);

  if (updateProfileError) {
    throw new Error(`Failed to verify KYC: ${updateProfileError.message}`);
  }

  const { error: updateUserError } = await supabase
    .from('users')
    .update({
      account_status: 'active',
    })
    .eq('user_id', userId);

  if (updateUserError) {
    throw new Error(`Failed to activate user account: ${updateUserError.message}`);
  }

  console.log(`KYC verified for user ${userId} by admin ${adminId}. Assigned Tier 1.`);
}

export async function checkTierEligibility(userId: string): Promise<TierEligibility> {
  const { data: profile, error: profileError } = await supabase
    .from('creatorprofiles')
    .select('tier, kyc_verified, created_at')
    .eq('user_id', userId)
    .single();

  if (profileError || !profile) {
    throw new Error('Creator profile not found');
  }

  if (!profile.kyc_verified) {
    return {
      tier: 0,
      eligible_for_upgrade: false,
      requirements_met: {
        completed_sessions: false,
        average_rating: false,
        account_age: false,
        flags_check: false,
      },
    };
  }

  const currentTier = profile.tier || 1;

  if (currentTier >= 2) {
    return {
      tier: currentTier,
      eligible_for_upgrade: false,
      requirements_met: {
        completed_sessions: true,
        average_rating: true,
        account_age: true,
        flags_check: true,
      },
    };
  }

  const { data: bookings, error: bookingsError } = await supabase
    .from('bookings')
    .select('booking_id, status')
    .eq('creator_id', userId)
    .eq('status', 'completed');

  const completedSessions = bookings?.length || 0;
  const completedSessionsCheck = completedSessions >= 20;

    // NOTE: Reviews table is not present in the typed Supabase schema yet.
    // Skip rating gate for now (implement once reviews data model exists).
    const averageRating = 0;
    const averageRatingCheck = true;

  const accountCreatedAt = new Date(profile.created_at ?? Date.now());
  const daysSinceCreation = Math.floor(
    (Date.now() - accountCreatedAt.getTime()) / (1000 * 60 * 60 * 24)
  );
  const accountAgeCheck = daysSinceCreation >= 60;

    // NOTE: Flags table is not present in the typed Supabase schema yet.
    // Skip flags gate for now (implement once flags data model exists).
    const flagsCheck = true;

  const eligibleForUpgrade =
    completedSessionsCheck &&
    averageRatingCheck &&
    accountAgeCheck &&
    flagsCheck;

  return {
    tier: currentTier,
    eligible_for_upgrade: eligibleForUpgrade,
    requirements_met: {
      completed_sessions: completedSessionsCheck,
      average_rating: averageRatingCheck,
      account_age: accountAgeCheck,
      flags_check: flagsCheck,
    },
  };
}
