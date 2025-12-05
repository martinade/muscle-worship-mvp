# Pitfall 4: Double Crediting

## Symptoms
- User gets credited twice (or more) for a single payment
- Multiple transactions with the same `payment_reference` in database
- Wallet balance is higher than expected

## Why This Happens

Stripe may send the same webhook event multiple times in certain scenarios:
1. **Network issues** - If your server doesn't respond with 200 quickly enough
2. **Timeouts** - If processing takes too long (>30 seconds)
3. **Retries** - Stripe automatically retries failed webhooks
4. **Manual resends** - From Stripe Dashboard for testing

## Prevention: Idempotency

✅ **Already implemented** in `src/pages/api/webhooks/stripe.ts`:

```typescript
// IDEMPOTENCY CHECK: Prevent double crediting
console.log('🔍 Checking for existing transaction...');
const { data: existingTransaction, error: checkError } = await supabase
  .from('cointransactions')
  .select('transaction_id, amount_wc')
  .eq('payment_reference', session.id)
  .maybeSingle();

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
```

## How It Works

1. **Before crediting wallet**, check if a transaction with this `payment_reference` already exists
2. **If found**, skip the credit and return success (200) to Stripe
3. **If not found**, proceed with crediting the wallet
4. **The `payment_reference` column** stores the Stripe session ID (`cs_test_xxxxx`)

## Verification

### Check for duplicate transactions:

```sql
-- Find duplicate payment references
SELECT 
  payment_reference,
  COUNT(*) as transaction_count,
  SUM(amount_wc) as total_credited
FROM CoinTransactions
WHERE payment_reference IS NOT NULL
GROUP BY payment_reference
HAVING COUNT(*) > 1;
```

### Check specific user's transactions:

```sql
-- View all transactions for a user
SELECT 
  transaction_id,
  transaction_type,
  amount_wc,
  payment_reference,
  created_at
FROM CoinTransactions
WHERE user_id = 'USER_ID_HERE'
ORDER BY created_at DESC;
```

## Testing Idempotency

### Simulate duplicate webhook:

```bash
# Using Stripe CLI, trigger the same event twice
stripe trigger checkout.session.completed

# Then manually resend from Stripe Dashboard:
# 1. Go to Developers > Webhooks
# 2. Click on your webhook endpoint
# 3. Find the event in "Recent deliveries"
# 4. Click "Resend"
```

### Expected behavior:

**First webhook:**
```
🔔 Webhook received: 2024-01-15T10:30:00.000Z
💳 Processing checkout.session.completed
   Session ID: cs_test_xxxxx
🔍 Checking for existing transaction...
✅ No existing transaction found - proceeding with credit
💰 Crediting wallet...
✅ Wallet credited successfully!
```

**Second webhook (duplicate):**
```
🔔 Webhook received: 2024-01-15T10:30:05.000Z
💳 Processing checkout.session.completed
   Session ID: cs_test_xxxxx
🔍 Checking for existing transaction...
⚠️  Transaction already processed!
   Session ID: cs_test_xxxxx
   Existing transaction ID: 123e4567-e89b-12d3-a456-426614174000
   Amount: 100 WC
   Skipping duplicate credit
```

## Database Schema

The `CoinTransactions` table includes:

```sql
CREATE TABLE CoinTransactions (
  transaction_id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  transaction_type VARCHAR(50) NOT NULL,
  amount_wc DECIMAL(10, 2) NOT NULL,
  balance_after_wc DECIMAL(10, 2) NOT NULL,
  payment_reference VARCHAR(255),  -- Stores Stripe session ID
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

The `payment_reference` column is used for idempotency checks.

## Edge Cases

### What if the check fails?

```typescript
if (checkError) {
  console.error('❌ Error checking for existing transaction:', checkError);
  // Continue anyway - better to risk double credit than block payment
}
```

**Decision:** If the idempotency check fails (database error), we proceed with the credit anyway. This is because:
- Blocking a legitimate payment is worse than a rare double credit
- Double credits can be manually refunded
- Blocked payments cause customer support issues

### What if creditWallet fails after the check?

The transaction is atomic - if `creditWallet()` fails, no transaction is created, so the next webhook retry will succeed.

## Manual Fix for Double Credits

If a user was double-credited:

```javascript
// test-fix-double-credit.js
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function fixDoubleCredit(userId, amountToDeduct, reason) {
  console.log('Fixing double credit...');
  console.log('User ID:', userId);
  console.log('Amount to deduct:', amountToDeduct);
  
  const { data, error } = await supabase.rpc('process_wallet_transaction', {
    p_user_id: userId,
    p_transaction_type: 'debit',
    p_amount_wc: -amountToDeduct, // Negative for debit
    p_description: `Refund: ${reason}`,
    p_related_entity_type: 'manual_correction',
    p_related_entity_id: null,
  });
  
  if (error) {
    console.error('❌ Error:', error);
  } else {
    console.log('✅ Fixed! New balance:', data.new_balance);
  }
}

// Example: Remove duplicate 100 WC credit
fixDoubleCredit(
  '41f0eccf-1e05-4680-aebe-84a682b0f64c',
  100,
  'Duplicate Stripe payment cs_test_xxxxx'
);
```

## Best Practices

1. ✅ **Always use unique identifiers** - Store Stripe session ID in `payment_reference`
2. ✅ **Check before processing** - Query for existing transaction first
3. ✅ **Return 200 even for duplicates** - Prevents Stripe from retrying
4. ✅ **Log everything** - Makes debugging easier
5. ✅ **Make operations atomic** - Use database transactions

## Monitoring

Set up alerts for:
- Multiple transactions with same `payment_reference`
- Unusually high wallet balances
- Webhook processing taking >10 seconds

```sql
-- Daily check for duplicates
SELECT 
  DATE(created_at) as date,
  COUNT(*) as total_transactions,
  COUNT(DISTINCT payment_reference) as unique_payments,
  COUNT(*) - COUNT(DISTINCT payment_reference) as potential_duplicates
FROM CoinTransactions
WHERE payment_reference IS NOT NULL
GROUP BY DATE(created_at)
HAVING COUNT(*) > COUNT(DISTINCT payment_reference);
```
