import { NextApiRequest, NextApiResponse } from 'next';
import { verifyAccessToken } from '@/lib/auth/tokenUtils';
import { verifyKYC } from '@/lib/kyc/kycUtils';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
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

    const { creator_id } = req.body;

    if (!creator_id) {
      return res.status(400).json({ error: 'creator_id is required' });
    }

    await verifyKYC(creator_id, decoded.userId);

    return res.status(200).json({
      success: true,
      message: 'KYC approved successfully',
    });
  } catch (error: any) {
    console.error('KYC approval error:', error);
    return res.status(500).json({
      error: error.message || 'Internal server error',
    });
  }
}
