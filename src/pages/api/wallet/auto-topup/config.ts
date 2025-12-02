import type { NextApiResponse } from 'next';
import { requireAuth, AuthenticatedRequest } from '@/lib/auth/authMiddleware';
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface AutoTopupConfig {
  auto_topup_enabled: boolean;
  auto_topup_threshold_wc: number;
  auto_topup_amount_wc: number;
}

interface ConfigResponse extends AutoTopupConfig {
  user_id: string;
}

interface ErrorResponse {
  error: string;
  details?: string;
}

async function handler(
  req: AuthenticatedRequest,
  res: NextApiResponse<ConfigResponse | ErrorResponse>
) {
  const userId = req.user.userId;

  if (req.method === 'GET') {
    try {
      const { data, error } = await supabase
        .from('Wallets')
        .select('auto_topup_enabled, auto_topup_threshold_wc, auto_topup_amount_wc')
        .eq('user_id', userId)
        .single();

      if (error) {
        throw new Error(`Failed to fetch auto-topup config: ${error.message}`);
      }

      return res.status(200).json({
        user_id: userId,
        auto_topup_enabled: data.auto_topup_enabled,
        auto_topup_threshold_wc: data.auto_topup_threshold_wc,
        auto_topup_amount_wc: data.auto_topup_amount_wc,
      });
    } catch (error) {
      console.error('Get auto-topup config error:', error);
      return res.status(500).json({
        error: 'Failed to retrieve auto-topup configuration',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  if (req.method === 'POST') {
    try {
      const { auto_topup_enabled, auto_topup_threshold_wc, auto_topup_amount_wc } = req.body as AutoTopupConfig;

      // Validation
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

      // Update wallet settings
      const { data, error } = await supabase
        .from('Wallets')
        .update({
          auto_topup_enabled,
          auto_topup_threshold_wc,
          auto_topup_amount_wc,
        })
        .eq('user_id', userId)
        .select('auto_topup_enabled, auto_topup_threshold_wc, auto_topup_amount_wc')
        .single();

      if (error) {
        throw new Error(`Failed to update auto-topup config: ${error.message}`);
      }

      return res.status(200).json({
        user_id: userId,
        auto_topup_enabled: data.auto_topup_enabled,
        auto_topup_threshold_wc: data.auto_topup_threshold_wc,
        auto_topup_amount_wc: data.auto_topup_amount_wc,
      });
    } catch (error) {
      console.error('Update auto-topup config error:', error);
      return res.status(500).json({
        error: 'Failed to update auto-topup configuration',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

export default requireAuth(handler);
