import type { NextApiResponse } from 'next';
import { requireAuth, AuthenticatedRequest } from '@/lib/auth/authMiddleware';
import { getWalletBalance, checkLowBalance, getEscrowBalance, getAutoTopupConfig, updateAutoTopupConfig } from '@/lib/wallet/walletUtils';

// Updated to include auto-topup config functionality
interface BalanceResponse {
  user_id: string;
  balance_wc: number;
  escrow_balance_wc?: number;
  low_balance_alert?: boolean;
  auto_topup_enabled?: boolean;
  auto_topup_threshold_wc?: number;
  auto_topup_amount_wc?: number;
}

interface ErrorResponse {
  error: string;
  details?: string;
}

async function handler(
  req: AuthenticatedRequest,
  res: NextApiResponse<BalanceResponse | ErrorResponse>
) {
  const userId = req.user?.userId;
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const { include_autotopup, update_autotopup } = req.query;

  // Handle auto-topup config update via POST
  if (req.method === 'POST' && update_autotopup === 'true') {
    try {
      const { auto_topup_enabled, auto_topup_threshold_wc, auto_topup_amount_wc } = req.body;

      if (typeof auto_topup_enabled !== 'boolean') {
        return res.status(400).json({ error: 'auto_topup_enabled must be a boolean' });
      }

      if (auto_topup_enabled !== true) {
        return res.status(400).json({ error: 'auto_topup_enabled must be true (cannot disable in V1.0)' });
      }

      if (typeof auto_topup_threshold_wc !== 'number' || auto_topup_threshold_wc < 0 || auto_topup_threshold_wc > 100) {
        return res.status(400).json({ error: 'auto_topup_threshold_wc must be between 0 and 100' });
      }

      if (typeof auto_topup_amount_wc !== 'number' || auto_topup_amount_wc < 50 || auto_topup_amount_wc > 500) {
        return res.status(400).json({ error: 'auto_topup_amount_wc must be between 50 and 500' });
      }

      const config = await updateAutoTopupConfig(userId, {
        auto_topup_enabled,
        auto_topup_threshold_wc,
        auto_topup_amount_wc,
      });

      return res.status(200).json({
        user_id: userId,
        balance_wc: await getWalletBalance(userId),
        auto_topup_enabled: config.auto_topup_enabled,
        auto_topup_threshold_wc: config.auto_topup_threshold_wc,
        auto_topup_amount_wc: config.auto_topup_amount_wc,
      });
    } catch (err) {
      console.error('Update auto-topup config error:', err);
      return res.status(500).json({
        error: 'Failed to update auto-topup configuration',
        details: err instanceof Error ? err.message : 'Unknown error',
      });
    }
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const balance = await getWalletBalance(userId);
    const escrowBalance = await getEscrowBalance(userId);
    const lowBalanceAlert = await checkLowBalance(userId);

    const response: BalanceResponse = {
      user_id: userId,
      balance_wc: balance,
      escrow_balance_wc: escrowBalance,
      low_balance_alert: lowBalanceAlert,
    };

    // Include auto-topup config if requested
    if (include_autotopup === 'true') {
      const config = await getAutoTopupConfig(userId);
      response.auto_topup_enabled = config.auto_topup_enabled;
      response.auto_topup_threshold_wc = config.auto_topup_threshold_wc;
      response.auto_topup_amount_wc = config.auto_topup_amount_wc;
    }

    return res.status(200).json(response);
  } catch (error) {
    console.error('Balance check error:', error);
    return res.status(500).json({
      error: 'Failed to retrieve wallet balance',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

export default requireAuth()(handler);
