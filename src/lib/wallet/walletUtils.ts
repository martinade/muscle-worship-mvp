import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

export async function createWallet(userId: string): Promise<string> {
  const { data, error } = await supabase
    .from('Wallets')
    .insert({
      user_id: userId,
      balance_wc: 0,
      auto_topup_enabled: true,
      auto_topup_threshold_wc: 50,
      auto_topup_amount_wc: 100,
    })
    .select('wallet_id')
    .single();

  if (error) {
    throw new Error(`Failed to create wallet: ${error.message}`);
  }

  return data.wallet_id;
}

export async function getWalletBalance(userId: string): Promise<number> {
  const { data, error } = await supabase
    .from('cointransactions')
    .select('amount_wc')
    .eq('user_id', userId);

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
    .from('Wallets')
    .select('escrow_balance_wc')
    .eq('user_id', userId)
    .single();

  if (error) {
    throw new Error(`Failed to get escrow balance: ${error.message}`);
  }

  return data?.escrow_balance_wc || 0;
}

export async function creditWallet(userId: string, amountWc: number, description: string): Promise<number> {
  const { data, error } = await supabase.rpc('process_wallet_transaction', {
    p_user_id: userId,
    p_transaction_type: 'credit',
    p_amount_wc: amountWc,
    p_description: description,
    p_related_entity_type: null,
    p_related_entity_id: null,
  });

  if (error) {
    throw new Error(`Failed to credit wallet: ${error.message}`);
  }

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
