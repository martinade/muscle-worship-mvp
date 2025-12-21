import type { NextApiResponse } from 'next';
import { requireAuth, AuthenticatedRequest } from '@/lib/auth/authMiddleware';
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

const supabase = createClient<Database>(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

interface Transaction {
  transaction_id: string;
  user_id: string;
  transaction_type: string;
  amount_wc: number;
  balance_after_wc: number;
  description: string | null;
  related_entity_type: string | null;
  related_entity_id: string | null;
  created_at: string | null;
}

interface HistoryResponse {
  transactions: Transaction[];
}

interface ErrorResponse {
  error: string;
  details?: string;
}

async function handler(
  req: AuthenticatedRequest,
  res: NextApiResponse<HistoryResponse | ErrorResponse>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const userId = req.user.userId;

    const { data, error } = await supabase
      .from('cointransactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      throw new Error(`Failed to fetch transaction history: ${error.message}`);
    }

    return res.status(200).json({
      transactions: data || [],
    });
  } catch (error) {
    console.error('Transaction history error:', error);
    return res.status(500).json({
      error: 'Failed to retrieve transaction history',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

export default requireAuth()(handler);
