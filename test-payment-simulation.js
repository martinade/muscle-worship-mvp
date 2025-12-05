const http = require('http');
const crypto = require('crypto');

// Simulate a successful Stripe payment webhook
const simulatePayment = async (userId, amountUSD) => {
  const amountWC = amountUSD; // 1 USD = 1 WC
  
  // Create a mock Stripe event
  const mockEvent = {
    id: 'evt_test_' + Date.now(),
    type: 'checkout.session.completed',
    data: {
      object: {
        id: 'cs_test_' + Date.now(),
        payment_status: 'paid',
        metadata: {
          user_id: userId,
          amount_wc: amountWC.toString(),
          amount_usd: amountUSD.toString()
        }
      }
    }
  };

  const payload = JSON.stringify(mockEvent);
  
  // For testing, we'll call the webhook directly
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/webhooks/stripe',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(payload),
      'stripe-signature': 't=1234567890,v1=test_signature'
    }
  };

  console.log('🧪 Simulating Stripe payment webhook...\n');
  console.log('User ID:', userId);
  console.log('Amount USD:', amountUSD);
  console.log('Amount WC:', amountWC);
  console.log('\nSending webhook event...\n');

  const req = http.request(options, (res) => {
    console.log(`Status: ${res.statusCode}`);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log('\nResponse:');
      try {
        const json = JSON.parse(data);
        console.log(JSON.stringify(json, null, 2));
      } catch (e) {
        console.log(data);
      }
      
      if (res.statusCode === 200) {
        console.log('\n✅ Payment simulation successful!');
        console.log('Check wallet balance to verify credits were added.');
      } else {
        console.log('\n❌ Payment simulation failed');
        console.log('Note: Signature verification will fail in simulation mode.');
        console.log('Use this to test the credit logic only.');
      }
    });
  });

  req.on('error', (e) => {
    console.error('Request error:', e.message);
  });

  req.write(payload);
  req.end();
};

// Get user ID from command line or use test user
const userId = process.argv[2] || '41f0eccf-1e05-4680-aebe-84a682b0f64c';
const amountUSD = parseFloat(process.argv[3]) || 100;

simulatePayment(userId, amountUSD);
