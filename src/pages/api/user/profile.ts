import type { NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { requireAuth, AuthenticatedRequest } from '@/lib/auth/authMiddleware';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

interface ErrorResponse {
  error: string;
  details?: string;
}

interface UserProfileResponse {
  user_id: string;
  email: string;
  username: string;
  role: string;
  date_of_birth: string;
  country: string;
  city?: string;
  timezone: string;
  account_status: string;
  created_at: string;
  fan_profile?: {
    total_bookings: number;
    no_show_count: number;
    late_cancellation_count: number;
    preferred_gender?: string[];
    preferred_body_types?: string[];
    preferred_specialties?: string[];
  };
  creator_profile?: {
    tier: number;
    kyc_verified: boolean;
    gender?: string;
    orientation?: string;
    height_cm?: number;
    weight_kg?: number;
    services_offered?: string[];
    total_sessions_completed: number;
    average_rating: number;
    total_reviews: number;
    text_chat_rate_wc?: number;
    webcam_rate_per_min_wc?: number;
    video_call_rate_per_hour_wc?: number;
    inperson_rate_per_hour_wc?: number;
    community_subscription_wc?: number;
  };
}

async function handler(
  req: AuthenticatedRequest,
  res: NextApiResponse<UserProfileResponse | ErrorResponse>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const userId = req.user!.userId;

    // Fetch user data from Users table
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (userError || !user) {
      return res.status(404).json({
        error: 'User not found',
        details: userError?.message,
      });
    }

    // Build base response
    const response: UserProfileResponse = {
      user_id: user.user_id,
      email: user.email,
      username: user.username,
      role: user.role,
      date_of_birth: user.date_of_birth,
      country: user.country,
      city: user.city,
      timezone: user.timezone,
      account_status: user.account_status,
      created_at: user.created_at,
    };

    // Fetch role-specific data
    if (user.role === 'fan') {
      const { data: fanProfile, error: fanError } = await supabase
        .from('fanprofiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (!fanError && fanProfile) {
        response.fan_profile = {
          total_bookings: fanProfile.total_bookings,
          no_show_count: fanProfile.no_show_count,
          late_cancellation_count: fanProfile.late_cancellation_count,
          preferred_gender: fanProfile.preferred_gender,
          preferred_body_types: fanProfile.preferred_body_types,
          preferred_specialties: fanProfile.preferred_specialties,
        };
      }
    } else if (user.role === 'creator') {
      const { data: creatorProfile, error: creatorError } = await supabase
        .from('creatorprofiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (!creatorError && creatorProfile) {
        response.creator_profile = {
          tier: creatorProfile.tier,
          kyc_verified: creatorProfile.kyc_verified,
          gender: creatorProfile.gender,
          orientation: creatorProfile.orientation,
          height_cm: creatorProfile.height_cm,
          weight_kg: creatorProfile.weight_kg,
          services_offered: creatorProfile.services_offered,
          total_sessions_completed: creatorProfile.total_sessions_completed,
          average_rating: creatorProfile.average_rating,
          total_reviews: creatorProfile.total_reviews,
          text_chat_rate_wc: creatorProfile.text_chat_rate_wc,
          webcam_rate_per_min_wc: creatorProfile.webcam_rate_per_min_wc,
          video_call_rate_per_hour_wc: creatorProfile.video_call_rate_per_hour_wc,
          inperson_rate_per_hour_wc: creatorProfile.inperson_rate_per_hour_wc,
          community_subscription_wc: creatorProfile.community_subscription_wc,
        };
      }
    }

    return res.status(200).json(response);

  } catch (error) {
    console.error('Profile fetch error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

export default requireAuth()(handler) as any;
