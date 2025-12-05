import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';
import { getWalletBalance } from './walletUtils';

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

export async function triggerAutoTopUp(userId: string): Promise<void> {
  const balance = await getWalletBalance(userId);
  
  const { data: wallet, error } = await supabase
    .from('wallets')
    .select('auto_topup_threshold_wc, auto_topup_amount_wc, auto_topup_enabled')
    .eq('user_id', userId)
    .single() as { data: { auto_topup_threshold_wc: number; auto_topup_amount_wc: number; auto_topup_enabled: boolean } | null; error: any };

  if (error) {
    throw new Error(`Failed to fetch wallet settings: ${error.message}`);
  }

  if (!wallet || !wallet.auto_topup_enabled) {
    return;
  }

  if (balance < wallet.auto_topup_threshold_wc) {
    // V1.0: Log alert (Module 17 will send email notification)
    console.log(`🔔 Auto-top-up triggered for user ${userId}. Balance: ${balance} WC, Threshold: ${wallet.auto_topup_threshold_wc} WC`);
    console.log(`   Recommended top-up amount: ${wallet.auto_topup_amount_wc} WC`);
    
    // V1.1: Automatically charge saved payment method
    // const paymentMethod = await getDefaultPaymentMethod(userId);
    // if (!paymentMethod) {
    //   throw new Error('No payment method saved');
    // }
    // await chargePaymentMethod(paymentMethod, wallet.auto_topup_amount_wc);
  }
}

export async function checkAutoTopUpEligibility(userId: string): Promise<{
  eligible: boolean;
  currentBalance: number;
  threshold: number;
  topUpAmount: number;
}> {
  const balance = await getWalletBalance(userId);
  
  const { data: wallet } = await supabase
    .from('wallets')
    .select('auto_topup_threshold_wc, auto_topup_amount_wc, auto_topup_enabled')
    .eq('user_id', userId)
    .single();

  if (!wallet || !wallet.auto_topup_enabled) {
    return {
      eligible: false,
      currentBalance: balance,
      threshold: wallet?.auto_topup_threshold_wc || 0,
      topUpAmount: wallet?.auto_topup_amount_wc || 0,
    };
  }

  return {
    eligible: balance < wallet.auto_topup_threshold_wc,
    currentBalance: balance,
    threshold: wallet.auto_topup_threshold_wc,
    topUpAmount: wallet.auto_topup_amount_wc,
  };
}
