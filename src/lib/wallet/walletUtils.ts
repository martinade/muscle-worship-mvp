import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

export async function createWallet(userId: string): Promise<string> {
  const { data, error } = await supabase
    .from('wallets')
    .insert({
      user_id: userId,
      balance_wc: 0,
      auto_topup_enabled: true,
      auto_topup_threshold_wc: 50,
      auto_topup_amount_wc: 100,
    })
    .select('wallet_id')
    .single() as { data: { wallet_id: string } | null; error: any };

  if (error) {
    throw new Error(`Failed to create wallet: ${error.message}`);
  }

  return data.wallet_id;
}

export async function getWalletBalance(userId: string): Promise<number> {
  const { data, error } = await supabase
    .from('cointransactions')
    .select('amount_wc')
    .eq('user_id', userId) as { data: { amount_wc: number }[] | null; error: any };

  if (error) {
    throw new Error(`Failed to get wallet balance: ${error.message}`);
  }

  if (!data || data.length === 0) {
    return 0;
  }

  const balance = data.reduce((sum, transaction) => sum + transaction.amount_wc, 0);
  return balance;
}

export async function checkLowBalance(userId: string): Promise<boolean> {
  const balance = await getWalletBalance(userId);
  return balance < 100;
}

export async function getEscrowBalance(userId: string): Promise<number> {
  const { data, error } = await supabase
    .from('wallets')
    .select('escrow_balance_wc')
    .eq('user_id', userId)
    .single() as { data: { escrow_balance_wc: number } | null; error: any };

  if (error) {
    throw new Error(`Failed to get escrow balance: ${error.message}`);
  }

  return data?.escrow_balance_wc || 0;
}

export async function creditWallet(userId: string, amountWc: number, description: string, paymentReference?: string): Promise<number> {
  console.log('💰 creditWallet called');
  console.log('   User ID:', userId);
  console.log('   Amount:', amountWc, 'WC');
  console.log('   Description:', description);
  console.log('   Payment Reference:', paymentReference || 'N/A');
  
  if (amountWc <= 0) {
    console.error('❌ Invalid amount:', amountWc);
    throw new Error('Credit amount must be greater than 0');
  }
  
  const { data, error } = await supabase.rpc('process_wallet_transaction', {
    p_user_id: userId,
    p_transaction_type: 'credit',
    p_amount_wc: amountWc,
    p_description: description,
    p_related_entity_type: paymentReference ? 'stripe_session' : null,
    p_related_entity_id: null,
    p_payment_reference: paymentReference || null,
  }) as { data: { new_balance: number } | null; error: any };

  if (error) {
    console.error('❌ Database error in creditWallet');
    console.error('   Error code:', error.code);
    console.error('   Error message:', error.message);
    console.error('   Error details:', error.details);
    throw new Error(`Failed to credit wallet: ${error.message}`);
  }
  
  if (!data) {
    console.error('❌ No data returned from process_wallet_transaction');
    throw new Error('No data returned from transaction');
  }

  console.log('✅ Wallet credited successfully');
  console.log('   New balance:', data.new_balance, 'WC');
  
  return data.new_balance;
}

export async function debitWallet(userId: string, amountWc: number, description: string): Promise<number> {
  const currentBalance = await getWalletBalance(userId);
  
  if (currentBalance < amountWc) {
    throw new Error('Insufficient balance');
  }

  const { data, error } = await supabase.rpc('process_wallet_transaction', {
    p_user_id: userId,
    p_transaction_type: 'debit',
    p_amount_wc: -amountWc,
    p_description: description,
    p_related_entity_type: null,
    p_related_entity_id: null,
  });

  if (error) {
    throw new Error(`Failed to debit wallet: ${error.message}`);
  }

  return data.new_balance;
}

export interface AutoTopupConfig {
  auto_topup_enabled: boolean;
  auto_topup_threshold_wc: number;
  auto_topup_amount_wc: number;
}

export async function getAutoTopupConfig(userId: string): Promise<AutoTopupConfig> {
  const { data, error } = await supabase
    .from('wallets')
    .select('auto_topup_enabled, auto_topup_threshold_wc, auto_topup_amount_wc')
    .eq('user_id', userId)
    .single();

  if (error) {
    throw new Error(`Failed to get auto-topup config: ${error.message}`);
  }

  return {
    auto_topup_enabled: data.auto_topup_enabled,
    auto_topup_threshold_wc: data.auto_topup_threshold_wc,
    auto_topup_amount_wc: data.auto_topup_amount_wc,
  };
}

export async function updateAutoTopupConfig(userId: string, config: AutoTopupConfig): Promise<AutoTopupConfig> {
  const { data, error } = await supabase
    .from('wallets')
    .update({
      auto_topup_enabled: config.auto_topup_enabled,
      auto_topup_threshold_wc: config.auto_topup_threshold_wc,
      auto_topup_amount_wc: config.auto_topup_amount_wc,
    })
    .eq('user_id', userId)
    .select('auto_topup_enabled, auto_topup_threshold_wc, auto_topup_amount_wc')
    .single();

  if (error) {
    throw new Error(`Failed to update auto-topup config: ${error.message}`);
  }

  return {
    auto_topup_enabled: data.auto_topup_enabled,
    auto_topup_threshold_wc: data.auto_topup_threshold_wc,
    auto_topup_amount_wc: data.auto_topup_amount_wc,
  };
}
