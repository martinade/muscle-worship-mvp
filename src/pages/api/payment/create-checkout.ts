import type { NextApiRequest, NextApiResponse } from 'next';
import { verifyAccessToken } from '@/lib/auth/tokenUtils';
import { initiatePayment } from '@/lib/pgal';

interface CreateCheckoutRequest {
  amount_usd: number;
}

interface CreateCheckoutResponse {
  checkout_url: string;
}

interface ErrorResponse {
  error: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<CreateCheckoutResponse | ErrorResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const token = authHeader.substring(7);
    const payload = verifyAccessToken(token);
    if (!payload) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    const { amount_usd } = req.body as CreateCheckoutRequest;

    if (!amount_usd || typeof amount_usd !== 'number') {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    if (amount_usd < 10) {
      return res.status(400).json({ error: 'Minimum amount is $10' });
    }

    // Validate maximum purchase amount
    if (amount_usd > 1000) {
      return res.status(400).json({ error: 'Maximum amount is $1000' });
    }

    const { url } = await initiatePayment('stripe', amount_usd, payload.userId);

    return res.status(200).json({ checkout_url: url });
  } catch (error) {
    console.error('Create checkout error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
