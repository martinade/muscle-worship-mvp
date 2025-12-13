import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';
import { verifyAccessToken } from '@/lib/auth/tokenUtils';
import { submitKYCDocuments } from '@/lib/kyc/kycUtils';

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    let token: string | undefined;
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (req.cookies.accessToken) {
      token = req.cookies.accessToken;
    }

    if (!token) {
      return res.status(401).json({ error: 'Missing or invalid authorization' });
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
      return res.status(403).json({ error: 'Only creators can submit KYC' });
    }

    const { data: profile, error: profileError } = await supabase
      .from('creatorprofiles')
      .select('legal_disclaimer_accepted')
      .eq('user_id', decoded.userId)
      .single();

    if (profileError || !profile) {
      return res.status(404).json({ error: 'Creator profile not found' });
    }

    if (!profile.legal_disclaimer_accepted) {
      return res.status(400).json({ error: 'Legal disclaimer must be accepted before KYC submission' });
    }

    const { selfie_video_url } = req.body;

    if (!selfie_video_url) {
      return res.status(400).json({ error: 'selfie_video_url is required' });
    }

    await submitKYCDocuments(decoded.userId, selfie_video_url);

    return res.status(200).json({
      success: true,
      status: 'pending_kyc',
      message: 'KYC documents submitted successfully',
    });
  } catch (error: any) {
    console.error('KYC submission error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
