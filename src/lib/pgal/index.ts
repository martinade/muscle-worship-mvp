import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-02-24.acacia',
});

export type PaymentProvider = 'stripe';
export type PaymentStatus = 'pending' | 'completed' | 'failed';

export interface CheckoutURL {
  url: string;
  sessionId: string;
}

/**
 * Initiates a payment with the specified provider
 * @param provider - Payment provider to use ('stripe' for V1.0)
 * @param amountUSD - Amount in USD (will be converted to cents)
 * @param userId - User ID for metadata
 * @returns Checkout URL and session ID
 */
export async function initiatePayment(
  provider: PaymentProvider,
  amountUSD: number,
  userId: string
): Promise<CheckoutURL> {
  if (provider === 'stripe') {
    console.log('💳 Creating Stripe checkout session...');
    console.log('   Amount USD:', amountUSD);
    console.log('   User ID:', userId);
    
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Worship Coins',
              description: `Add ${amountUSD} WC to your wallet`,
            },
            unit_amount: Math.round(amountUSD * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `https://9c42d4ee-c061-40b6-a8a7-09c5de2ec321.canvases.tempo.build/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `https://9c42d4ee-c061-40b6-a8a7-09c5de2ec321.canvases.tempo.build/payment/cancelled`,
      metadata: {
        user_id: userId,
        amount_wc: amountUSD.toString(),
        amount_usd: amountUSD.toString(),
      },
      expires_at: Math.floor(Date.now() / 1000) + (24 * 60 * 60), // 24 hours from now
    });
    
    console.log('✅ Checkout session created');
    console.log('   Session ID:', session.id);
    console.log('   Expires at:', new Date(session.expires_at! * 1000).toISOString());
    console.log('   Metadata:', JSON.stringify(session.metadata, null, 2));

    return {
      url: session.url!,
      sessionId: session.id,
    };
  }

  throw new Error(`Unsupported payment provider: ${provider}`);
}

/**
 * Gets the status of a payment
 * @param provider - Payment provider used ('stripe' for V1.0)
 * @param externalTxId - External transaction ID (session ID for Stripe)
 * @returns Payment status
 */
export async function getPaymentStatus(
  provider: PaymentProvider,
  externalTxId: string
): Promise<PaymentStatus> {
  if (provider === 'stripe') {
    try {
      const session = await stripe.checkout.sessions.retrieve(externalTxId);

      // Check if session is expired
      if (session.status === 'expired') {
        console.warn('⚠️  Stripe session expired:', externalTxId);
        console.warn('   Sessions expire after 24 hours');
        console.warn('   User needs to create a new checkout session');
        return 'failed';
      }

      switch (session.payment_status) {
        case 'paid':
          return 'completed';
        case 'unpaid':
          return 'pending';
        default:
          return 'failed';
      }
    } catch (error) {
      const err = error as any;
      if (err.statusCode === 404) {
        console.error('❌ Stripe session not found:', externalTxId);
        console.error('   Session may have expired (24 hour limit)');
        console.error('   User needs to create a new checkout session');
        return 'failed';
      }
      throw error;
    }
  }

  throw new Error(`Unsupported payment provider: ${provider}`);
}
