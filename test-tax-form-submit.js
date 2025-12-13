const fs = require('fs');
const FormData = require('form-data');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testTaxFormSubmit() {
  console.log('🧪 Testing Tax Form Submission...\n');

  // First, login to get a fresh access token
  console.log('🔐 Logging in to get access token...');
  const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      email: 'creator@test.com',
      password: 'password123'
    })
  });

  const loginData = await loginResponse.json();
  
  if (!loginResponse.ok || !loginData.accessToken) {
    console.error('❌ Login failed:', loginData.error || 'Unknown error');
    console.error('   Make sure you have a creator account registered');
    console.error('   Run: node test-register-user.js');
    return;
  }

  const accessToken = loginData.accessToken;
  console.log('✅ Logged in successfully\n');

  // Create form data
  const form = new FormData();
  form.append('form_type', 'W9');
  form.append('tax_id_last_four', '1234');
  
  // Check if test PDF exists
  if (!fs.existsSync('test-tax-form.pdf')) {
    console.log('⚠️  test-tax-form.pdf not found, creating a dummy PDF...');
    fs.writeFileSync('test-tax-form.pdf', '%PDF-1.4\n1 0 obj\n<<\n/Type /Catalog\n/Pages 2 0 R\n>>\nendobj\n2 0 obj\n<<\n/Type /Pages\n/Kids [3 0 R]\n/Count 1\n>>\nendobj\n3 0 obj\n<<\n/Type /Page\n/Parent 2 0 R\n/MediaBox [0 0 612 792]\n>>\nendobj\nxref\n0 4\n0000000000 65535 f\n0000000009 00000 n\n0000000058 00000 n\n0000000115 00000 n\ntrailer\n<<\n/Size 4\n/Root 1 0 R\n>>\nstartxref\n190\n%%EOF');
  }
  
  form.append('tax_form', fs.createReadStream('test-tax-form.pdf'), {
    filename: 'test-tax-form.pdf',
    contentType: 'application/pdf'
  });

  try {
    console.log('📤 Submitting tax form...');
    const response = await fetch('http://localhost:3000/api/creator/tax_form/submit', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        ...form.getHeaders()
      },
      body: form
    });

    const data = await response.json();

    console.log(`\n📊 Response Status: ${response.status}`);
    console.log('📊 Response Body:', JSON.stringify(data, null, 2));

    if (response.ok && data.success) {
      console.log('\n✅ Tax form submitted successfully!');
    } else {
      console.log('\n❌ Tax form submission failed');
      console.log('   Error:', data.error || 'Unknown error');
    }

  } catch (error) {
    console.error('\n❌ Request failed:', error.message);
  }
}

testTaxFormSubmit();
