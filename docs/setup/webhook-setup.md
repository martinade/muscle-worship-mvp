# Stripe Webhook Setup Guide

## ✅ Current Status

**Webhook URL:** `https://9c42d4ee-c061-40b6-a8a7-09c5de2ec321.canvases.tempo.build/api/webhooks/stripe`

---

## What's Working

1. **Webhook Endpoint is Live**
   - ✓ Endpoint responds at `/api/webhooks/stripe`
   - ✓ Returns HTTP 400 for requests without signature (correct behavior)
   - ✓ Properly validates `stripe-signature` header
   - ✓ Accessible from the internet

2. **Code Implementation**
   - ✓ App Router webhook created at `src/app/api/webhooks/stripe/route.ts`
   - ✓ Signature verification implemented
   - ✓ Handles `checkout.session.completed` event
   - ✓ Credits wallet on successful payment
   - ✓ Error handling in place

3. **Security**
   - ✓ Requires Stripe signature for all requests
   - ✓ Validates webhook secret
   - ✓ Rejects unsigned requests

---

## Required Environment Variables

Configure these in **Tempo Project Settings** (not in code):

1. **STRIPE_SECRET_KEY** ✅ Configured
   - Your Stripe API secret key
   - Starts with `sk_test_` or `sk_live_`
   - Found in: Stripe Dashboard > Developers > API Keys

2. **STRIPE_WEBHOOK_SECRET** ✅ Configured
   - Your webhook signing secret
   - Starts with `whsec_`
   - Found in: Stripe Dashboard > Developers > Webhooks

---

## Stripe Dashboard Configuration

### For Production:

1. **Go to Stripe Dashboard** (live mode)
   - Navigate to: Developers > Webhooks
   - Click "Add endpoint"

2. **Configure Endpoint:**
   - **URL:** `https://9c42d4ee-c061-40b6-a8a7-09c5de2ec321.canvases.tempo.build/api/webhooks/stripe`
   - **Description:** "Production webhook for wallet credits"
   - **Events to send:** Select `checkout.session.completed`
   - **API version:** Use latest

3. **Get Signing Secret:**
   - After creating the endpoint, click "Reveal" next to "Signing secret"
   - Copy the secret (starts with `whsec_`)
   - Add to Tempo Project Settings as `STRIPE_WEBHOOK_SECRET`

### For Local Development:

Use Stripe CLI to forward webhooks to your local server:

```bash
# Install Stripe CLI
# https://stripe.com/docs/stripe-cli

# Login to Stripe
stripe login

# Forward webhooks to local endpoint
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# This will output a webhook secret like:
# whsec_xxxxxxxxxxxxxxxxxxxxx
# Use this secret in your local environment
```

---

## Testing the Webhook

### Test 1: Send Test Event from Stripe Dashboard

1. Go to Stripe Dashboard > Developers > Webhooks
2. Click on your webhook endpoint
3. Click "Send test webhook"
4. Select `checkout.session.completed` event
5. Click "Send test webhook"

**Expected Response:**
- Status: 200 OK
- Response body: `{"received":true}`

### Test 2: Trigger Real Payment

```bash
# Create checkout session
curl -X POST http://localhost:3000/api/payment/create-checkout \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{"amount_usd": 100}'

# Complete payment in browser using test card:
# Card: 4242 4242 4242 4242
# Expiry: Any future date
# CVC: Any 3 digits
```

**Expected Logs:**
```
🔔 Webhook received: 2024-01-15T10:30:00.000Z
💳 Processing checkout.session.completed
   Session ID: cs_test_xxxxx
   Payment status: paid
🔍 Checking for existing transaction...
✅ No existing transaction found - proceeding with credit
💰 Crediting wallet...
✅ Wallet credited successfully!
```

### Test 3: Verify Wallet Balance

```bash
curl -X GET http://localhost:3000/api/wallet/balance \
  -H "Content-Type: application/json" \
  -b cookies.txt
```

**Expected:** Balance increased by payment amount

---

## Monitoring Webhooks

### In Stripe Dashboard:

1. Go to Developers > Webhooks
2. Click on your webhook endpoint
3. View "Recent deliveries" section
4. Check for:
   - ✅ Successful deliveries (200 status)
   - ❌ Failed deliveries (4xx/5xx status)
   - ⏱️ Response times

### In Your Application:

Check server logs for webhook activity:
```bash
# Check if webhooks are being received
grep "Webhook received" logs/server.log

# Check for successful credits
grep "Wallet credited successfully" logs/server.log

# Check for errors
grep "ERROR" logs/server.log | grep webhook
```

---

## Troubleshooting

### Webhook Returns 400

**Cause:** Missing or invalid signature
**Fix:** Verify `STRIPE_WEBHOOK_SECRET` matches Stripe Dashboard

### Webhook Returns 500

**Cause:** Server error during processing
**Fix:** Check application logs for error details

### Wallet Not Credited

**Cause:** Multiple possible issues
**Fix:** See [Troubleshooting Guide](../troubleshooting/webhook-issues.md)

### Duplicate Credits

**Cause:** Webhook sent multiple times
**Fix:** Idempotency check already implemented (see [Double Crediting Guide](../troubleshooting/double-crediting.md))

---

## Security Best Practices

1. **Always verify signatures**
   - Never process webhooks without signature verification
   - Use Stripe's official libraries for verification

2. **Use HTTPS in production**
   - Stripe requires HTTPS for webhook endpoints
   - Never use HTTP in production

3. **Keep secrets secure**
   - Store webhook secret in environment variables
   - Never commit secrets to git
   - Rotate secrets periodically

4. **Implement idempotency**
   - Check for duplicate transactions
   - Return 200 even for duplicates
   - Log all webhook events

5. **Monitor webhook health**
   - Set up alerts for failed webhooks
   - Track response times
   - Monitor success rates

---

## Webhook Event Flow

```
1. User completes payment in Stripe Checkout
   ↓
2. Stripe sends checkout.session.completed event to webhook
   ↓
3. Webhook verifies signature
   ↓
4. Webhook checks for duplicate transaction (idempotency)
   ↓
5. Webhook credits user's wallet
   ↓
6. Webhook returns 200 OK to Stripe
   ↓
7. User sees updated balance on success page
```

---

## Additional Resources

- [Stripe Webhook Documentation](https://stripe.com/docs/webhooks)
- [Stripe CLI Documentation](https://stripe.com/docs/stripe-cli)
- [Testing Webhooks](https://stripe.com/docs/webhooks/test)
- [Webhook Best Practices](https://stripe.com/docs/webhooks/best-practices)
