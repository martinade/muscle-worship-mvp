const FormData = require('form-data');
const fs = require('fs');

async function testTaxFormSubmit() {
  console.log('🧪 Testing Tax Form Submission\n');

  // Step 1: Login
  console.log('Step 1: Logging in...');
  const loginRes = await fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'creator@test.com',
      password: 'password123'
    })
  });

  if (!loginRes.ok) {
    console.error('❌ Login failed:', await loginRes.text());
    return;
  }

  const { accessToken } = await loginRes.json();
  console.log('✅ Logged in\n');

  // Step 2: Submit tax form
  console.log('Step 2: Submitting tax form...');

  const taxFormRes = await fetch('http://localhost:3000/api/creator/tax_form/submit', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      form_type: 'W9',
      tax_id_last_four: '1234'
    })
  });

  const result = await taxFormRes.json();
  
  if (taxFormRes.ok) {
    console.log('✅ Tax form submitted successfully');
    console.log('\nResponse:', JSON.stringify(result, null, 2));
  } else {
    console.error('❌ Tax form submission failed');
    console.error('Status:', taxFormRes.status);
    console.error('Response:', JSON.stringify(result, null, 2));
  }
}

testTaxFormSubmit().catch(console.error);
