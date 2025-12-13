import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';
import { verifyAccessToken } from '@/lib/auth/tokenUtils';
import { checkTierEligibility } from '@/lib/kyc/kycUtils';

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or invalid authorization header' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyAccessToken(token);

    if (!decoded || !decoded.userId) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    const { data: user, error: userError } = await supabase
      .from('Users')
      .select('role')
      .eq('user_id', decoded.userId)
      .single();

    if (userError || !user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.role !== 'creator') {
      return res.status(403).json({ error: 'Only creators can check tier eligibility' });
    }

    const eligibility = await checkTierEligibility(decoded.userId);

    const missingRequirements: string[] = [];
    if (!eligibility.requirements_met.completed_sessions) {
      missingRequirements.push('Need 20+ completed sessions');
    }
    if (!eligibility.requirements_met.average_rating) {
      missingRequirements.push('Need 4.5+ average rating');
    }
    if (!eligibility.requirements_met.account_age) {
      missingRequirements.push('Need 60+ days account age');
    }
    if (!eligibility.requirements_met.flags_check) {
      missingRequirements.push('Too many flags (max 1 yellow, 0 red)');
    }

    const servicesAvailable: string[] = [];
    if (eligibility.tier >= 1) {
      servicesAvailable.push('text_chat', 'webcam');
    }
    if (eligibility.tier >= 2) {
      servicesAvailable.push('video_call', 'in_person');
    }

    return res.status(200).json({
      current_tier: eligibility.tier,
      eligible_for_upgrade: eligibility.eligible_for_upgrade,
      missing_requirements: missingRequirements,
      services_available: servicesAvailable,
    });
  } catch (error: any) {
    console.error('Tier check error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
