import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

export async function lockEscrow(
  user_id: string,
  amount_wc: number,
  booking_id: string
): Promise<{ escrow_id: string; new_balance_wc: number; escrow_balance_wc: number }> {
  const { data, error } = await supabase.rpc('process_escrow_lock', {
    p_user_id: user_id,
    p_amount_wc: amount_wc,
    p_booking_id: booking_id,
  });

  if (error) {
    throw new Error(`Failed to lock escrow: ${error.message}`);
  }

  return {
    escrow_id: data.escrow_id,
    new_balance_wc: data.new_balance_wc,
    escrow_balance_wc: data.escrow_balance_wc,
  };
}

export async function releaseEscrow(
  user_id: string,
  amount_wc: number,
  booking_id: string
): Promise<{ new_balance_wc: number; escrow_balance_wc: number }> {
  const { data, error } = await supabase.rpc('process_escrow_release', {
    p_user_id: user_id,
    p_amount_wc: amount_wc,
    p_booking_id: booking_id,
  });

  if (error) {
    throw new Error(`Failed to release escrow: ${error.message}`);
  }

  return {
    new_balance_wc: data.new_balance_wc,
    escrow_balance_wc: data.escrow_balance_wc,
  };
}
