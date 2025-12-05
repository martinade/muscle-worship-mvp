const https = require('https');

const testUser = {
  email: 'testfan@example.com',
  password: 'TestPassword123!',
  username: 'testfan',
  date_of_birth: '1990-01-01',
  country: 'United States',
  city: 'New York'
};

const data = JSON.stringify(testUser);

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/auth/register-fan',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

console.log('🚀 Registering test fan user...');
console.log('Email:', testUser.email);
console.log('Username:', testUser.username);

const req = https.request(options, (res) => {
  let responseData = '';

  res.on('data', (chunk) => {
    responseData += chunk;
  });

  res.on('end', () => {
    console.log('\n📊 Response Status:', res.statusCode);
    console.log('📦 Response:', responseData);
    
    if (res.statusCode === 201) {
      console.log('\n✅ Test user created successfully!');
      console.log('You can now use these credentials:');
      console.log('  Email:', testUser.email);
      console.log('  Password:', testUser.password);
    } else {
      console.log('\n⚠️ Registration failed or user may already exist');
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Error:', error.message);
  console.log('\n💡 Make sure your dev server is running on port 3000');
});

req.write(data);
req.end();
