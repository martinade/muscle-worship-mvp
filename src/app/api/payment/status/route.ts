import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
});

export async function GET(req: NextRequest) {
  try {
    const sessionId = req.nextUrl.searchParams.get('session_id');

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Missing session_id parameter' },
        { status: 400 }
      );
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    let status: 'pending' | 'completed' | 'failed';
    if (session.payment_status === 'paid') {
      status = 'completed';
    } else if (session.payment_status === 'unpaid') {
      status = 'pending';
    } else {
      status = 'failed';
    }

    let balance = null;
    if (status === 'completed' && session.metadata?.user_id) {
      const { data: wallet } = await supabase
        .from('wallets')
        .select('balance_wc')
        .eq('user_id', session.metadata.user_id)
        .single();

      if (wallet) {
        balance = wallet.balance_wc;
      }
    }

    return NextResponse.json({ status, balance }, { status: 200 });
  } catch (error) {
    console.error('Payment status check error:', error);
    return NextResponse.json(
      { error: 'Failed to check payment status' },
      { status: 500 }
    );
  }
}
