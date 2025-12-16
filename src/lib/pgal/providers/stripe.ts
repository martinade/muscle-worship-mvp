import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-02-24.acacia',
});

export interface CheckoutURL {
  url: string;
  sessionId: string;
}

export type PaymentStatus = 'pending' | 'completed' | 'failed';

/**
 * Initiates a Stripe payment
 * @param amountUSD - Amount in USD (1 USD = 1 WC)
 * @param userId - User ID for metadata
 * @param description - Payment description
 * @returns Checkout URL and session ID
 */
export async function initiateStripePayment(
  amountUSD: number,
  userId: string,
  description: string
): Promise<CheckoutURL> {
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'Worship Coins',
            description,
          },
          unit_amount: Math.round(amountUSD * 100),
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
    invoice_creation: {
      enabled: false,
    },
    submit_type: 'pay',
  });

  return {
    url: session.url!,
    sessionId: session.id,
  };
}

/**
 * Gets the status of a Stripe payment
 * @param sessionId - Stripe checkout session ID
 * @returns Payment status
 */
export async function getStripePaymentStatus(
  sessionId: string
): Promise<PaymentStatus> {
  const session = await stripe.checkout.sessions.retrieve(sessionId);

  if (session.payment_status === 'paid') {
    return 'completed';
  } else if (session.payment_status === 'unpaid') {
    return 'pending';
  } else {
    return 'failed';
  }
}
