import type { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
import { creditWallet } from '@/lib/wallet/walletUtils';
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
});

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

// CRITICAL: Body parser MUST be disabled for webhook signature verification
export const config = {
  api: {
    bodyParser: false,
  },
};

// Validate webhook secret is configured
if (!webhookSecret) {
  console.error('❌ STRIPE_WEBHOOK_SECRET is not configured!');
  console.error('   Set it in your environment variables to match your Stripe webhook secret');
}

async function buffer(req: NextApiRequest): Promise<Buffer> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log('🔔 Webhook received:', new Date().toISOString());
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Validate webhook secret is configured
  if (!webhookSecret) {
    console.error('❌ STRIPE_WEBHOOK_SECRET not configured');
    return res.status(500).json({ error: 'Webhook secret not configured' });
  }

  try {
    const buf = await buffer(req);
    const sig = req.headers['stripe-signature'];

    if (!sig) {
      return res.status(400).json({ error: 'Missing stripe-signature header' });
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(buf, sig, webhookSecret);
    } catch (err) {
      const error = err as Error;
      console.error('❌ Webhook signature verification failed!');
      console.error('   Error:', error.message);
      console.error('   Common causes:');
      console.error('   1. STRIPE_WEBHOOK_SECRET does not match Stripe dashboard');
      console.error('   2. Using wrong webhook secret (test vs live mode)');
      console.error('   3. Body was modified before reaching this handler');
      console.error('   4. Stripe CLI not forwarding to correct endpoint');
      return res.status(400).json({ 
        error: 'Webhook signature verification failed',
        details: error.message 
      });
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      
      console.log('💳 Processing checkout.session.completed');
      console.log('   Session ID:', session.id);
      console.log('   Payment status:', session.payment_status);
      console.log('   Metadata:', JSON.stringify(session.metadata, null, 2));

      const userId = session.metadata?.user_id;
      const amountWC = session.metadata?.amount_wc;

      if (!userId || !amountWC) {
        console.error('❌ Missing metadata in session:', session.id);
        console.error('   Expected: user_id and amount_wc');
        console.error('   Received:', session.metadata);
        return res.status(400).json({ 
          error: 'Missing metadata',
          details: 'user_id and amount_wc are required in session metadata'
        });
      }

      const amountWCNumber = parseFloat(amountWC);
      
      if (isNaN(amountWCNumber) || amountWCNumber <= 0) {
        console.error('❌ Invalid amount_wc:', amountWC);
        return res.status(400).json({ 
          error: 'Invalid amount_wc',
          details: 'amount_wc must be a positive number'
        });
      }

      // IDEMPOTENCY CHECK: Prevent double crediting
      console.log('🔍 Checking for existing transaction...');
      const { data: existingTransaction, error: checkError } = await supabase
        .from('cointransactions')
        .select('transaction_id, amount_wc')
        .eq('payment_reference', session.id)
        .maybeSingle();

      if (checkError) {
        console.error('❌ Error checking for existing transaction:', checkError);
        // Continue anyway - better to risk double credit than block payment
      }

      if (existingTransaction) {
        console.log('⚠️  Transaction already processed!');
        console.log('   Session ID:', session.id);
        console.log('   Existing transaction ID:', existingTransaction.transaction_id);
        console.log('   Amount:', existingTransaction.amount_wc, 'WC');
        console.log('   Skipping duplicate credit');
        return res.status(200).json({ 
          received: true,
          message: 'Transaction already processed'
        });
      }

      console.log('✅ No existing transaction found - proceeding with credit');
      console.log('💰 Crediting wallet...');
      console.log('   User ID:', userId);
      console.log('   Amount:', amountWCNumber, 'WC');

      try {
        await creditWallet(
          userId,
          amountWCNumber,
          'stripe_payment',
          session.id
        );

        console.log('✅ Wallet credited successfully!');
        console.log('   User:', userId);
        console.log('   Amount:', amountWCNumber, 'WC');
        console.log('   Transaction ID:', session.id);
      } catch (creditError) {
        console.error('❌ Failed to credit wallet!');
        console.error('   Error:', creditError instanceof Error ? creditError.message : creditError);
        console.error('   User ID:', userId);
        console.error('   Amount:', amountWCNumber);
        console.error('   Session ID:', session.id);
        throw creditError;
      }
    } else {
      console.log('ℹ️  Received event type:', event.type, '(ignored)');
    }

    return res.status(200).json({ received: true });
  } catch (error) {
    console.error('❌ Webhook handler error!');
    console.error('   Error:', error instanceof Error ? error.message : error);
    console.error('   Stack:', error instanceof Error ? error.stack : 'N/A');
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
