import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';
import { checkLowBalance } from './walletUtils';

const supabase = createClient<Database>(
  process.env.SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function checkAndAlertLowBalance(userId: string): Promise<void> {
  try {
    const isLowBalance = await checkLowBalance(userId);

    if (!isLowBalance) {
      return;
    }

    // Get user's email from Users table
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('email')
      .eq('user_id', userId)
      .single();

    if (userError) {
      throw new Error(`Failed to fetch user email: ${userError.message}`);
    }

    // Get wallet details for balance and auto-topup settings
    const { data: wallet, error: walletError } = await supabase
      .from('wallets')
      .select('balance_wc, auto_topup_enabled, auto_topup_threshold_wc')
      .eq('user_id', userId)
      .single();

    if (walletError) {
      throw new Error(`Failed to fetch wallet details: ${walletError.message}`);
    }

    const balance = wallet.balance_wc;

    // Check if balance is below 100 WC
    if (balance < 100) {
      console.log(`[LOW BALANCE ALERT] User ${userId} (${user.email}) has low balance: ${balance} WC`);
      console.log(`Email would be sent: "Your wallet balance is low. Please top up."`);
    }

    // Check if balance is below 50 WC and auto-topup is enabled
    if (balance < 50 && wallet.auto_topup_enabled) {
      console.log(`[AUTO-TOPUP TRIGGER] User ${userId} balance (${balance} WC) is below threshold (${wallet.auto_topup_threshold_wc} WC)`);
      console.log(`Auto-topup would trigger here (Module 3 will implement)`);
    }
  } catch (error) {
    console.error('Error in checkAndAlertLowBalance:', error);
    throw error;
  }
}
