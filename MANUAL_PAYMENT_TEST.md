# Manual Payment Test Guide

## Test 1: Create Checkout Session

```bash
# Login first
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"wallettest@test.com","password":"Test1234!"}' \
  -c cookies.txt

# Create checkout session
curl -X POST http://localhost:3000/api/payment/create-checkout \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{"amount_usd": 100}'
```

**Expected Response:**
```json
{
  "checkout_url": "https://checkout.stripe.com/c/pay/cs_test_...",
  "session_id": "cs_test_..."
}
```

---

## Test 2: Complete Payment (Manual)

1. **Copy the `checkout_url`** from Test 1 response
2. **Open in browser** (paste the full URL)
3. **Fill in Stripe test card details:**
   - Card number: `4242 4242 4242 4242`
   - Expiry date: Any future date (e.g., `12/25`)
   - CVC: Any 3 digits (e.g., `123`)
   - ZIP code: Any 5 digits (e.g., `12345`)
   - Email: Any email (e.g., `test@example.com`)
4. **Click "Pay"**
5. **You'll be redirected to:** `http://localhost:3000/payment/success?session_id=cs_test_...`

---

## Test 3: Verify Payment Success

After completing payment, check the success page shows:
- ✅ Payment successful message
- ✅ Session ID displayed
- ✅ Updated wallet balance

---

## Test 4: Check Wallet Balance

```bash
curl -X GET http://localhost:3000/api/wallet/balance \
  -H "Content-Type: application/json" \
  -b cookies.txt
```

**Expected Response:**
```json
{
  "user_id": "41f0eccf-1e05-4680-aebe-84a682b0f64c",
  "balance_wc": 100
}
```

The balance should increase by 100 WC after payment.

---

## Test 5: Check Transaction History

```bash
curl -X GET http://localhost:3000/api/wallet/history \
  -H "Content-Type: application/json" \
  -b cookies.txt
```

**Expected Response:**
```json
{
  "transactions": [
    {
      "transaction_id": "...",
      "transaction_type": "credit",
      "amount_wc": 100,
      "balance_after_wc": 100,
      "description": "Stripe payment",
      "created_at": "2024-01-..."
    }
  ]
}
```

---

## Alternative: Direct Credit Test (If Stripe Checkout Fails)

If the Stripe checkout URL doesn't work, use direct credit:

```bash
# Credit wallet directly (simulates successful payment)
curl -X POST http://localhost:3000/api/wallet/credit \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{"user_id":"41f0eccf-1e05-4680-aebe-84a682b0f64c","amount_wc":100,"description":"Manual test payment"}'
```

---

## Troubleshooting

### Checkout URL doesn't load
- Stripe account may need additional verification
- Use direct credit method as workaround

### Payment completes but balance doesn't update
- Check webhook is configured in Stripe dashboard
- Webhook URL: `https://your-domain.com/api/webhooks/stripe`
- Use direct credit to test wallet functionality

### Session expired error
- Checkout sessions expire after 24 hours
- Create a new checkout session

---

## Success Criteria

✅ Checkout session created successfully  
✅ Stripe checkout page loads  
✅ Payment completes without errors  
✅ Redirected to success page  
✅ Wallet balance increases by 100 WC  
✅ Transaction logged in history  

---

## Notes

- **Conversion rate:** $1 USD = 1 WC
- **Test amount:** $100 USD = 100 WC
- **Test card:** 4242 4242 4242 4242 (always succeeds)
- **Webhook:** Stripe sends payment confirmation to `/api/webhooks/stripe`
