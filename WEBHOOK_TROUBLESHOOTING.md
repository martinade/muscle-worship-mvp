# Webhook Troubleshooting Guide

## Pitfall 1: Webhook Signature Verification Fails

### Symptoms
- Error: "Webhook signature verification failed"
- Error: "Invalid signature"
- Stripe webhooks return 400 status

### Common Causes & Fixes

#### 1. STRIPE_WEBHOOK_SECRET Mismatch
**Problem:** The webhook secret in your environment doesn't match Stripe dashboard

**Fix:**
```bash
# Get your webhook secret from Stripe Dashboard:
# 1. Go to Developers > Webhooks
# 2. Click on your webhook endpoint
# 3. Click "Reveal" next to "Signing secret"
# 4. Copy the secret (starts with whsec_)

# Update your .env.local (DO NOT COMMIT THIS FILE)
STRIPE_WEBHOOK_SECRET=whsec_your_actual_secret_here
```

#### 2. Test vs Live Mode Mismatch
**Problem:** Using test mode secret with live mode webhooks (or vice versa)

**Fix:**
- Test mode secrets start with `whsec_test_`
- Live mode secrets start with `whsec_`
- Make sure your `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` are from the same mode

#### 3. Body Parser Enabled
**Problem:** Next.js body parser modifies the request body before signature verification

**Fix:**
✅ Already configured correctly in `src/pages/api/webhooks/stripe.ts`:
```typescript
export const config = {
  api: {
    bodyParser: false, // MUST be false for webhooks
  },
};
```

#### 4. Local Testing with Stripe CLI
**Problem:** Not using Stripe CLI for local webhook testing

**Fix:**
```bash
# Install Stripe CLI
# https://stripe.com/docs/stripe-cli

# Login to Stripe
stripe login

# Forward webhooks to local endpoint
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# This will output a webhook secret like:
# whsec_xxxxxxxxxxxxxxxxxxxxx
# Use this secret in your .env.local for local testing
```

**DO NOT use ngrok or other tunneling services** - they change the URL and break signature verification.

#### 5. Wrong Webhook Events
**Problem:** Webhook is configured but not listening to the right events

**Fix:**
Ensure your webhook is listening to:
- `checkout.session.completed` (for payment completion)

In Stripe Dashboard:
1. Go to Developers > Webhooks
2. Click on your webhook
3. Click "Add events"
4. Select `checkout.session.completed`

### Testing Webhook Signature

Run the test script:
```bash
node test-webhook-setup.js
```

This will verify:
- ✅ Webhook secret is configured
- ✅ Body parser is disabled
- ✅ Signature verification logic is correct

### Debugging Tips

1. **Check environment variables:**
```bash
# Verify secrets are loaded
echo $STRIPE_WEBHOOK_SECRET
```

2. **Check Stripe CLI output:**
```bash
# When using Stripe CLI, you'll see webhook events in real-time
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

3. **Check server logs:**
The webhook handler now logs detailed error messages:
```
❌ Webhook signature verification failed!
   Error: [specific error message]
   Common causes:
   1. STRIPE_WEBHOOK_SECRET does not match Stripe dashboard
   2. Using wrong webhook secret (test vs live mode)
   3. Body was modified before reaching this handler
   4. Stripe CLI not forwarding to correct endpoint
```

### Production Deployment

When deploying to production:

1. **Create production webhook in Stripe:**
   - Go to Stripe Dashboard (live mode)
   - Developers > Webhooks > Add endpoint
   - URL: `https://yourdomain.com/api/webhooks/stripe`
   - Events: `checkout.session.completed`

2. **Update production environment variables:**
   - Set `STRIPE_WEBHOOK_SECRET` to the production webhook secret
   - Set `STRIPE_SECRET_KEY` to your live secret key (starts with `sk_live_`)

3. **Test production webhook:**
   - Use Stripe Dashboard to send test events
   - Check your server logs for successful processing

---

## Pitfall 2: Wallet Not Credited After Payment

### Symptoms
- Payment succeeds in Stripe
- User sees success page
- Wallet balance unchanged
- No transaction in database

### Diagnostic Steps

#### 1. Check Webhook is Receiving Events

**Look for this log at the start of webhook handler:**
```
🔔 Webhook received: 2024-01-15T10:30:00.000Z
```

**If NOT present:**
- Webhook endpoint not configured in Stripe
- Webhook URL is incorrect
- Firewall blocking webhook requests

**Fix:**
```bash
# For local testing, use Stripe CLI:
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# For production, configure webhook in Stripe Dashboard:
# URL: https://yourdomain.com/api/webhooks/stripe
# Events: checkout.session.completed
```

#### 2. Check Metadata is Present

**Look for this log:**
```
💳 Processing checkout.session.completed
   Session ID: cs_test_xxxxx
   Payment status: paid
   Metadata: {
     "user_id": "41f0eccf-1e05-4680-aebe-84a682b0f64c",
     "amount_wc": "100",
     "amount_usd": "100"
   }
```

**If metadata is missing or null:**
```
❌ Missing metadata in session: cs_test_xxxxx
   Expected: user_id and amount_wc
   Received: {}
```

**Fix:**
The metadata is set when creating the checkout session. Check `src/lib/pgal/index.ts`:
```typescript
metadata: {
  user_id: userId,
  amount_wc: amountUSD.toString(),
  amount_usd: amountUSD.toString(),
}
```

Ensure `userId` is valid when calling `initiatePayment()`.

#### 3. Check Amount is Valid

**Look for this log:**
```
💰 Crediting wallet...
   User ID: 41f0eccf-1e05-4680-aebe-84a682b0f64c
   Amount: 100 WC
```

**If amount is invalid:**
```
❌ Invalid amount_wc: abc
```

**Fix:**
Ensure `amount_wc` in metadata is a valid number string.

#### 4. Check Database Transaction

**Look for this log:**
```
💰 creditWallet called
   User ID: 41f0eccf-1e05-4680-aebe-84a682b0f64c
   Amount: 100 WC
   Description: stripe_payment
   Related Entity ID: cs_test_xxxxx
```

**If database error occurs:**
```
❌ Database error in creditWallet
   Error code: 23503
   Error message: insert or update on table "cointransactions" violates foreign key constraint
   Error details: Key (user_id)=(xxx) is not present in table "users"
```

**Common database errors:**

1. **User doesn't exist:**
   - Error code: 23503 (foreign key violation)
   - Fix: Ensure user exists in `users` table before payment

2. **Wallet doesn't exist:**
   - Error: "Wallet not found"
   - Fix: Create wallet when user registers

3. **Transaction function error:**
   - Check Supabase logs for RPC function errors
   - Verify `process_wallet_transaction` function exists

#### 5. Check Success Response

**Look for this log:**
```
✅ Wallet credited successfully!
   User: 41f0eccf-1e05-4680-aebe-84a682b0f64c
   Amount: 100 WC
   Transaction ID: cs_test_xxxxx
```

**If this appears but balance still unchanged:**
- Check if you're looking at the correct user
- Verify balance calculation in `getWalletBalance()`
- Check if transaction was rolled back

### Testing Wallet Credit

**Manual test script:**
```javascript
// test-wallet-credit.js
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function testCreditWallet(userId, amount) {
  console.log('Testing wallet credit...');
  console.log('User ID:', userId);
  console.log('Amount:', amount);
  
  const { data, error } = await supabase.rpc('process_wallet_transaction', {
    p_user_id: userId,
    p_transaction_type: 'credit',
    p_amount_wc: amount,
    p_description: 'test_payment',
    p_related_entity_type: 'test',
    p_related_entity_id: 'test_123',
  });
  
  if (error) {
    console.error('❌ Error:', error);
  } else {
    console.log('✅ Success! New balance:', data.new_balance);
  }
}

testCreditWallet('41f0eccf-1e05-4680-aebe-84a682b0f64c', 100);
```

### Verification Checklist

- [ ] Webhook endpoint configured in Stripe
- [ ] Webhook secret matches environment variable
- [ ] Webhook receiving events (check logs)
- [ ] Metadata includes `user_id` and `amount_wc`
- [ ] User exists in database
- [ ] Wallet exists for user
- [ ] `process_wallet_transaction` function works
- [ ] Transaction appears in `cointransactions` table
- [ ] Balance calculation is correct

### Quick Debug Commands

```bash
# Check if webhook is receiving events
tail -f logs/server.log | grep "Webhook received"

# Check if wallet is being credited
tail -f logs/server.log | grep "Wallet credited"

# Check Supabase logs
# Go to Supabase Dashboard > Logs > API Logs

# Test webhook locally
stripe trigger checkout.session.completed

# Check user's balance
node -e "
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
supabase.from('cointransactions').select('*').eq('user_id', 'USER_ID_HERE').then(console.log);
"
```

---

## Pitfall 3: Stripe Session Expires

### Symptoms
- Checkout URL returns 404
- Error: "Session not found"
- Error: "This payment link has expired"
- User clicks old payment link and gets error

### Why This Happens

**Stripe checkout sessions expire after 24 hours** for security reasons. This is a Stripe limitation, not a bug.

When a session expires:
- The checkout URL becomes invalid
- Attempting to retrieve the session returns 404
- Payment cannot be completed

### Prevention

✅ **Already implemented:**
- Sessions are created with explicit 24-hour expiration
- Expiration time is logged when session is created
- Error handling detects expired sessions

### User Experience

When a user tries to use an expired payment link:

1. **Payment success page shows:**
   ```
   ⏰ Payment Link Expired
   
   Stripe checkout sessions expire after 24 hours for security. 
   Please create a new payment to add funds to your wallet.
   ```

2. **Server logs show:**
   ```
   ⚠️  Stripe session expired: cs_test_xxxxx
      Sessions expire after 24 hours
      User needs to create a new checkout session
   ```

### Fix for Users

**Users must create a new payment:**
1. Go back to the wallet/payment page
2. Enter the amount they want to add
3. Click "Add Funds" to create a new checkout session
4. Complete payment within 24 hours

### Implementation Details

**Session creation** (`src/lib/pgal/index.ts`):
```typescript
const session = await stripe.checkout.sessions.create({
  // ... other config
  expires_at: Math.floor(Date.now() / 1000) + (24 * 60 * 60), // 24 hours
});

console.log('✅ Checkout session created');
console.log('   Session ID:', session.id);
console.log('   Expires at:', new Date(session.expires_at! * 1000).toISOString());
```

**Session retrieval** (`src/lib/pgal/index.ts`):
```typescript
try {
  const session = await stripe.checkout.sessions.retrieve(externalTxId);
  
  if (session.status === 'expired') {
    console.warn('⚠️  Stripe session expired:', externalTxId);
    return 'failed';
  }
} catch (error) {
  if (error.statusCode === 404) {
    console.error('❌ Stripe session not found:', externalTxId);
    console.error('   Session may have expired (24 hour limit)');
    return 'failed';
  }
}
```

**User-facing error** (`src/app/payment/success/page.tsx`):
```typescript
if (errorMsg.includes('expired') || errorMsg.includes('not found')) {
  setErrorMessage('This payment link has expired. Payment links are valid for 24 hours. Please create a new payment to add funds to your wallet.');
}
```

### Best Practices

1. **Don't store checkout URLs long-term**
   - Generate new sessions for each payment attempt
   - Don't email checkout URLs (they expire)

2. **Inform users about expiration**
   - Show expiration time when generating link
   - Provide clear error message when expired

3. **Make it easy to retry**
   - Provide "Create New Payment" button
   - Pre-fill amount from expired session if possible

### Testing Expired Sessions

**Simulate expired session:**
```bash
# Create a session
node -e "
const Stripe = require('stripe');
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
stripe.checkout.sessions.create({
  payment_method_types: ['card'],
  line_items: [{
    price_data: {
      currency: 'usd',
      product_data: { name: 'Test' },
      unit_amount: 1000,
    },
    quantity: 1,
  }],
  mode: 'payment',
  success_url: 'http://localhost:3000/success',
  cancel_url: 'http://localhost:3000/cancel',
  expires_at: Math.floor(Date.now() / 1000) + 60, // Expires in 1 minute
}).then(s => console.log('Session ID:', s.id));
"

# Wait 1 minute, then try to retrieve it
# It will return status: 'expired'
```

### Monitoring

**Track expired sessions:**
```bash
# Check logs for expired session warnings
grep "session expired" logs/server.log

# Count expired session attempts
grep "session expired" logs/server.log | wc -l
```

**Metrics to monitor:**
- Number of expired session attempts per day
- Time between session creation and expiration
- Conversion rate (completed vs expired sessions)

### FAQ

**Q: Can I extend the 24-hour limit?**
A: No, this is a Stripe limitation for security. Maximum is 24 hours.

**Q: What if user starts payment but doesn't complete?**
A: Session remains valid for 24 hours. User can return to the same URL to complete payment.

**Q: Can I reuse a session after payment?**
A: No, sessions are single-use. After successful payment, create a new session for additional payments.

**Q: What happens to pending payments when session expires?**
A: If payment was initiated but not completed, it's automatically cancelled by Stripe.

