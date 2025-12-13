import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';
import { verifyAccessToken } from '@/lib/auth/tokenUtils';

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST' && req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    let token: string | null = null;

    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (req.cookies.accessToken) {
      token = req.cookies.accessToken;
    }

    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

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
      return res.status(403).json({ error: 'Only creators can set up profiles' });
    }

    const {
      gender,
      height_cm,
      weight_kg,
      age,
      division,
      specialties,
      max_lifts,
      text_chat,
      webcam,
      video_call,
      in_person,
      text_chat_rate_wc,
      webcam_rate_per_min_wc,
      video_call_rate_per_min_wc,
      in_person_rate_per_hour_wc,
      bio,
      profile_photo_url,
      gallery_urls,
      location_city,
      location_state,
      location_country,
      travel_willing,
      travel_max_distance_km,
    } = req.body;

    const { data: existingProfile, error: fetchError } = await supabase
      .from('creatorprofiles')
      .select('profile_id')
      .eq('user_id', decoded.userId)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      return res.status(500).json({ error: 'Failed to check existing profile' });
    }

    const profileData: any = {
      user_id: decoded.userId,
    };

    if (gender !== undefined) profileData.gender = gender;
    if (height_cm !== undefined) profileData.height_cm = height_cm;
    if (weight_kg !== undefined) profileData.weight_kg = weight_kg;
    if (age !== undefined) profileData.age = age;
    if (division !== undefined) profileData.division = division;
    if (specialties !== undefined) profileData.specialties = specialties;
    if (max_lifts !== undefined) profileData.max_lifts = max_lifts;
    if (text_chat !== undefined) profileData.text_chat = text_chat;
    if (webcam !== undefined) profileData.webcam = webcam;
    if (video_call !== undefined) profileData.video_call = video_call;
    if (in_person !== undefined) profileData.in_person = in_person;
    if (text_chat_rate_wc !== undefined) profileData.text_chat_rate_wc = text_chat_rate_wc;
    if (webcam_rate_per_min_wc !== undefined) profileData.webcam_rate_per_min_wc = webcam_rate_per_min_wc;
    if (video_call_rate_per_min_wc !== undefined) profileData.video_call_rate_per_min_wc = video_call_rate_per_min_wc;
    if (in_person_rate_per_hour_wc !== undefined) profileData.in_person_rate_per_hour_wc = in_person_rate_per_hour_wc;
    if (bio !== undefined) profileData.bio = bio;
    if (profile_photo_url !== undefined) profileData.profile_photo_url = profile_photo_url;
    if (gallery_urls !== undefined) profileData.gallery_urls = gallery_urls;
    if (location_city !== undefined) profileData.location_city = location_city;
    if (location_state !== undefined) profileData.location_state = location_state;
    if (location_country !== undefined) profileData.location_country = location_country;
    if (travel_willing !== undefined) profileData.travel_willing = travel_willing;
    if (travel_max_distance_km !== undefined) profileData.travel_max_distance_km = travel_max_distance_km;

    if (existingProfile) {
      const { data: updatedProfile, error: updateError } = await supabase
        .from('creatorprofiles')
        .update(profileData)
        .eq('user_id', decoded.userId)
        .select('profile_id')
        .single();

      if (updateError) {
        return res.status(500).json({ error: `Failed to update profile: ${updateError.message}` });
      }

      return res.status(200).json({
        success: true,
        profile_id: updatedProfile.profile_id,
        message: 'Profile updated successfully',
      });
    } else {
      const { data: newProfile, error: insertError } = await supabase
        .from('creatorprofiles')
        .insert(profileData)
        .select('profile_id')
        .single();

      if (insertError) {
        console.error('Insert error details:', insertError);
        return res.status(500).json({ 
          error: `Failed to create profile: ${insertError.message}`,
          details: insertError.details,
          hint: insertError.hint
        });
      }

      return res.status(201).json({
        success: true,
        profile_id: newProfile.profile_id,
        message: 'Profile created successfully',
      });
    }
  } catch (error: any) {
    console.error('Profile setup error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
