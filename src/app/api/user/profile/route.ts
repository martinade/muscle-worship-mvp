import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifyToken, generateAccessToken } from '@/lib/auth/tokenUtils';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

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

export async function GET(req: NextRequest) {
  try {
    // Read accessToken from cookies
    let accessToken = req.cookies.get('accessToken')?.value;
    const refreshToken = req.cookies.get('refreshToken')?.value;

    // Verify access token
    let decoded = accessToken ? verifyToken(accessToken, 'access') : null;

    // If access token expired but refresh token exists, try to refresh
    if (!decoded && refreshToken) {
      const refreshDecoded = verifyToken(refreshToken, 'refresh');

      if (refreshDecoded && refreshDecoded.userId) {
        // Fetch user role from database
        const { data: user, error: userError } = await supabase
          .from('users')
          .select('role')
          .eq('user_id', refreshDecoded.userId)
          .single();

        if (!userError && user) {
          // Generate new access token
          const newAccessToken = generateAccessToken({
            userId: refreshDecoded.userId,
            role: user.role,
          });

          // Update decoded with new token data
          decoded = {
            userId: refreshDecoded.userId,
            role: user.role,
          };

          // Create response with new access token cookie
          const response = await fetchUserProfile(decoded.userId);
          response.cookies.set('accessToken', newAccessToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'strict',
            path: '/',
            maxAge: 15 * 60, // 15 minutes
          });
          return response;
        }
      }
    }

    // If no valid token, return 401 Unauthorized
    if (!decoded || !decoded.userId) {
      return NextResponse.json({
        error: 'Unauthorized',
        details: 'Authentication required',
      }, { status: 401 });
    }

    // Fetch and return user profile
    return await fetchUserProfile(decoded.userId);

  } catch (error) {
    console.error('Profile fetch error:', error);
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}

async function fetchUserProfile(userId: string): Promise<NextResponse<UserProfileResponse | { error: string; details?: string }>> {
  // Fetch user data from Users table
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (userError || !user) {
    return NextResponse.json({
      error: 'User not found',
      details: userError?.message,
    }, { status: 404 });
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

  return NextResponse.json(response, { status: 200 });
}
