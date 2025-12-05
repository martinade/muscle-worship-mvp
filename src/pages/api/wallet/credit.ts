import type { NextApiResponse } from 'next';
import { requireAuth, AuthenticatedRequest } from '@/lib/auth/authMiddleware';
import { creditWallet } from '@/lib/wallet/ledgerUtils';
import { getWalletBalance } from '@/lib/wallet/walletUtils';

interface CreditRequest {
  user_id: string;
  amount_wc: number;
  description?: string;
}

interface CreditResponse {
  success: boolean;
  new_balance_wc: number;
}

interface ErrorResponse {
  error: string;
  details?: string;
}

async function handler(
  req: AuthenticatedRequest,
  res: NextApiResponse<CreditResponse | ErrorResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { user_id, amount_wc, description } = req.body as CreditRequest;

    if (!user_id || !amount_wc) {
      return res.status(400).json({ 
        error: 'Missing required fields: user_id and amount_wc' 
      });
    }

    if (typeof amount_wc !== 'number' || amount_wc <= 0) {
      return res.status(400).json({ 
        error: 'Invalid amount_wc: must be a positive number' 
      });
    }

    await creditWallet(user_id, amount_wc, description);
    const newBalance = await getWalletBalance(user_id);

    return res.status(200).json({
      success: true,
      new_balance_wc: newBalance,
    });
  } catch (error) {
    console.error('Wallet credit error:', error);
    return res.status(500).json({
      error: 'Failed to credit wallet',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

export default requireAuth()(handler);
