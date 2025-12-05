# Payment System Documentation

This directory contains comprehensive documentation for the Stripe payment and wallet system.

## 📁 Directory Structure

```
docs/
├── README.md                          # This file
├── setup/
│   └── webhook-setup.md              # Stripe webhook configuration guide
├── troubleshooting/
│   ├── webhook-issues.md             # Common webhook problems and solutions
│   └── double-crediting.md           # Preventing duplicate credits
└── testing/
    ├── manual-payment-test.md        # Step-by-step testing guide
    └── test-results.md               # Test execution results
```

---

## 🚀 Quick Start

### For First-Time Setup:
1. Read [Webhook Setup Guide](setup/webhook-setup.md)
2. Configure environment variables in Tempo Project Settings
3. Set up webhook endpoint in Stripe Dashboard
4. Run tests from [Manual Payment Test Guide](testing/manual-payment-test.md)

### For Troubleshooting:
1. Check [Webhook Issues Guide](troubleshooting/webhook-issues.md) for common problems
2. Review [Double Crediting Guide](troubleshooting/double-crediting.md) if users are getting duplicate credits
3. Check [Test Results](testing/test-results.md) for known issues

---

## 📚 Documentation Overview

### Setup Guides

#### [Webhook Setup](setup/webhook-setup.md)
Complete guide for configuring Stripe webhooks:
- Environment variable configuration
- Stripe Dashboard setup
- Local development with Stripe CLI
- Testing and monitoring
- Security best practices

### Troubleshooting Guides

#### [Webhook Issues](troubleshooting/webhook-issues.md)
Solutions for common webhook problems:
- **Pitfall 1:** Webhook signature verification fails
- **Pitfall 2:** Wallet not credited after payment
- **Pitfall 3:** Stripe session expires

#### [Double Crediting](troubleshooting/double-crediting.md)
Preventing and fixing duplicate credits:
- Why duplicate webhooks happen
- Idempotency implementation
- Testing duplicate scenarios
- Manual fix procedures

### Testing Guides

#### [Manual Payment Test](testing/manual-payment-test.md)
Step-by-step testing procedures:
- Creating checkout sessions
- Completing test payments
- Verifying wallet credits
- Checking transaction history

#### [Test Results](testing/test-results.md)
Historical test execution results:
- What's working
- Known issues
- Configuration checklist
- Next steps

---

## 🔧 Common Tasks

### Testing a Payment Flow

```bash
# 1. Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"Test1234!"}' \
  -c cookies.txt

# 2. Create checkout session
curl -X POST http://localhost:3000/api/payment/create-checkout \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{"amount_usd": 100}'

# 3. Complete payment in browser (use test card 4242 4242 4242 4242)

# 4. Check balance
curl -X GET http://localhost:3000/api/wallet/balance \
  -H "Content-Type: application/json" \
  -b cookies.txt
```

### Checking for Duplicate Transactions

```sql
SELECT 
  payment_reference,
  COUNT(*) as transaction_count,
  SUM(amount_wc) as total_credited
FROM CoinTransactions
WHERE payment_reference IS NOT NULL
GROUP BY payment_reference
HAVING COUNT(*) > 1;
```

### Monitoring Webhook Health

```bash
# Check webhook logs
grep "Webhook received" logs/server.log

# Check for errors
grep "ERROR" logs/server.log | grep webhook

# Count successful credits
grep "Wallet credited successfully" logs/server.log | wc -l
```

---

## 🐛 Debugging Checklist

When a payment issue occurs, check in this order:

1. **Is the webhook being received?**
   - Check server logs for "Webhook received"
   - Verify webhook URL in Stripe Dashboard
   - Check Stripe Dashboard > Webhooks > Recent deliveries

2. **Is signature verification passing?**
   - Verify `STRIPE_WEBHOOK_SECRET` is correct
   - Check for "signature verification failed" errors
   - Ensure body parser is disabled

3. **Is the metadata present?**
   - Check logs for metadata values
   - Verify `user_id` and `amount_wc` are included
   - Ensure checkout session includes metadata

4. **Is the wallet being credited?**
   - Check for "Wallet credited successfully" log
   - Query database for transaction
   - Verify user exists and has wallet

5. **Is it a duplicate?**
   - Check for "Transaction already processed" log
   - Query for duplicate `payment_reference`
   - Review idempotency implementation

---

## 📞 Support Resources

### Internal Documentation
- [Webhook Issues Guide](troubleshooting/webhook-issues.md)
- [Double Crediting Guide](troubleshooting/double-crediting.md)
- [Webhook Setup Guide](setup/webhook-setup.md)

### External Resources
- [Stripe Webhook Documentation](https://stripe.com/docs/webhooks)
- [Stripe Testing Guide](https://stripe.com/docs/testing)
- [Stripe CLI Documentation](https://stripe.com/docs/stripe-cli)

### Database Schema
See migration files in `supabase/migrations/` for complete schema:
- `20240101000000_create_muscle_worship_schema.sql` - Initial schema
- `20240110000000_add_escrow_balance.sql` - Escrow features
- `20240111000000_add_transaction_functions.sql` - Transaction functions

---

## 🔐 Security Notes

### Environment Variables
Never commit these to git:
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `SUPABASE_SERVICE_KEY`

### Webhook Security
- Always verify Stripe signatures
- Use HTTPS in production
- Implement idempotency checks
- Log all webhook events
- Monitor for suspicious activity

### Testing
- Use Stripe test mode for development
- Use test cards (4242 4242 4242 4242)
- Never use real payment methods in test mode
- Keep test and live mode secrets separate

---

## 📝 Maintenance

### Regular Tasks
- Monitor webhook delivery success rate
- Check for duplicate transactions weekly
- Review error logs daily
- Update documentation when code changes
- Test payment flow after deployments

### When to Update This Documentation
- New payment features added
- Webhook handler modified
- New troubleshooting scenarios discovered
- Environment variable changes
- Database schema updates

---

## 🎯 Next Steps

### Immediate
- [ ] Complete Stripe account setup
- [ ] Test full payment flow
- [ ] Configure production webhook
- [ ] Set up monitoring alerts

### Future Enhancements
- [ ] Implement auto-top-up V1.1
- [ ] Add payment analytics dashboard
- [ ] Implement refund handling
- [ ] Add payment method management
- [ ] Create admin tools for manual corrections

---

## 📄 License & Contact

For questions or issues with this documentation, contact the development team or create an issue in the project repository.

Last Updated: 2024
