import type { NextApiRequest, NextApiResponse } from 'next';
import { verifyAccessToken } from '@/lib/auth/tokenUtils';
import { lockEscrow } from '@/lib/wallet/escrowUtils';

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
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const decoded = verifyAccessToken(token);
    if (!decoded) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    const { user_id, amount_wc, booking_id } = req.body;

    if (!user_id || !amount_wc || !booking_id) {
      return res.status(400).json({ error: 'Missing required fields: user_id, amount_wc, booking_id' });
    }

    if (decoded.user_id !== user_id) {
      return res.status(403).json({ error: 'Forbidden: Cannot lock escrow for another user' });
    }

    if (amount_wc <= 0) {
      return res.status(400).json({ error: 'Amount must be positive' });
    }

    const result = await lockEscrow(user_id, amount_wc, booking_id);

    return res.status(200).json({
      success: true,
      message: 'Escrow locked successfully',
      escrow_id: result.escrow_id,
      new_balance_wc: result.new_balance_wc,
      escrow_balance_wc: result.escrow_balance_wc,
    });
  } catch (error: any) {
    console.error('Escrow lock error:', error);
    return res.status(500).json({ error: error.message || 'Failed to lock escrow' });
  }
}
