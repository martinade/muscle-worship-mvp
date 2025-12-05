import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { creditWallet } from '@/lib/wallet/walletUtils';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const sig = req.headers.get('stripe-signature');

    let event: Stripe.Event;
    let signatureVerified = false;

    // Try signature verification first if we have both signature and secret
    if (sig && webhookSecret) {
      try {
        event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
        signatureVerified = true;
        console.log('Webhook signature verified successfully');
      } catch (err) {
        console.warn('Signature verification failed:', (err as Error).message);
      }
    }

    // If signature verification failed or wasn't possible, verify via Stripe API
    if (!signatureVerified) {
      console.log('Attempting to verify event via Stripe API...');
      
      try {
        const payload = JSON.parse(rawBody);
        
        // Verify this is a real Stripe event by retrieving it from Stripe
        if (payload.id && payload.id.startsWith('evt_')) {
          const verifiedEvent = await stripe.events.retrieve(payload.id);
          event = verifiedEvent;
          console.log('Event verified via Stripe API:', event.id);
        } else {
          console.error('Invalid event payload - no valid event ID');
          return NextResponse.json(
            { error: 'Invalid event payload' },
            { status: 400 }
          );
        }
      } catch (verifyErr) {
        console.error('Failed to verify event via API:', verifyErr);
        return NextResponse.json(
          { error: 'Could not verify webhook event' },
          { status: 400 }
        );
      }
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;

      const userId = session.metadata?.user_id;
      const amountWC = session.metadata?.amount_wc;

      if (!userId || !amountWC) {
        console.error('Missing metadata in session:', session.id);
        return NextResponse.json(
          { error: 'Missing metadata' },
          { status: 400 }
        );
      }

      const amountWCNumber = parseFloat(amountWC);

      await creditWallet(
        userId,
        amountWCNumber,
        'stripe_payment',
        session.id
      );

      console.log(`Wallet credited: ${amountWCNumber} WC for user ${userId}`);
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error('Webhook handler error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
