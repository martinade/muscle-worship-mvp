import type { NextApiResponse } from 'next';
import { requireAuth, AuthenticatedRequest } from '@/lib/auth/authMiddleware';
import { getWalletBalance, checkLowBalance, getEscrowBalance } from '@/lib/wallet/walletUtils';

interface BalanceResponse {
  user_id: string;
  balance_wc: number;
  escrow_balance_wc: number;
  low_balance_alert: boolean;
}

interface ErrorResponse {
  error: string;
  details?: string;
}

async function handler(
  req: AuthenticatedRequest,
  res: NextApiResponse<BalanceResponse | ErrorResponse>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const userId = req.user.userId;

    const balance = await getWalletBalance(userId);
    const escrowBalance = await getEscrowBalance(userId);
    const lowBalanceAlert = await checkLowBalance(userId);

    return res.status(200).json({
      user_id: userId,
      balance_wc: balance,
      escrow_balance_wc: escrowBalance,
      low_balance_alert: lowBalanceAlert,
    });
  } catch (error) {
    console.error('Balance check error:', error);
    return res.status(500).json({
      error: 'Failed to retrieve wallet balance',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

export default requireAuth(handler);
