import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';
import { getWalletBalance } from './walletUtils';

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface LogTransactionParams {
  user_id: string;
  transaction_type: string;
  amount_wc: number;
  description?: string;
  related_entity_type?: string;
  related_entity_id?: string;
}

export async function logTransaction(params: LogTransactionParams): Promise<string> {
  const { user_id, transaction_type, amount_wc, description, related_entity_type, related_entity_id } = params;

  const { data, error } = await supabase.rpc('process_wallet_transaction', {
    p_user_id: user_id,
    p_transaction_type: transaction_type,
    p_amount_wc: amount_wc,
    p_description: description || null,
    p_related_entity_type: related_entity_type || null,
    p_related_entity_id: related_entity_id || null,
  });

  if (error) {
    throw new Error(`Failed to process transaction: ${error.message}`);
  }

  return data.transaction_id;
}

export async function creditWallet(userId: string, amount: number, description?: string): Promise<void> {
  if (amount <= 0) {
    throw new Error('Credit amount must be greater than 0');
  }

  await logTransaction({
    user_id: userId,
    transaction_type: 'credit',
    amount_wc: amount,
    description,
  });
}

export async function debitWallet(userId: string, amount: number, description?: string): Promise<void> {
  if (amount <= 0) {
    throw new Error('Debit amount must be greater than 0');
  }

  const currentBalance = await getWalletBalance(userId);
  if (currentBalance < amount) {
    throw new Error(`Insufficient funds. Current balance: ${currentBalance} WC, Required: ${amount} WC`);
  }

  await logTransaction({
    user_id: userId,
    transaction_type: 'debit',
    amount_wc: -amount,
    description,
  });
}

export async function escrowLock(userId: string, amount: number, bookingId: string): Promise<void> {
  if (amount <= 0) {
    throw new Error('Escrow amount must be greater than 0');
  }

  const currentBalance = await getWalletBalance(userId);
  if (currentBalance < amount) {
    throw new Error(`Insufficient funds for escrow. Current balance: ${currentBalance} WC, Required: ${amount} WC`);
  }

  await logTransaction({
    user_id: userId,
    transaction_type: 'escrow_lock',
    amount_wc: -amount,
    description: `Escrow locked for booking ${bookingId}`,
    related_entity_type: 'booking',
    related_entity_id: bookingId,
  });
}

export async function escrowRelease(userId: string, amount: number, bookingId: string): Promise<void> {
  if (amount <= 0) {
    throw new Error('Escrow release amount must be greater than 0');
  }

  await logTransaction({
    user_id: userId,
    transaction_type: 'escrow_release',
    amount_wc: amount,
    description: `Escrow released for booking ${bookingId}`,
    related_entity_type: 'booking',
    related_entity_id: bookingId,
  });
}
