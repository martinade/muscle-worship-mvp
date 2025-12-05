const http = require('http');
const fs = require('fs');

// Read cookies from file
let cookies = '';
try {
  const cookieContent = fs.readFileSync('cookies.txt', 'utf8');
  const lines = cookieContent.split('\n');
  const cookieValues = [];
  
  for (const line of lines) {
    if (line.trim() && !line.startsWith('#')) {
      const parts = line.split('\t');
      if (parts.length >= 7) {
        const name = parts[5];
        const value = parts[6];
        cookieValues.push(`${name}=${value}`);
      }
    }
  }
  
  cookies = cookieValues.join('; ');
  console.log('Cookies loaded:', cookies.substring(0, 50) + '...\n');
} catch (e) {
  console.error('Failed to read cookies:', e.message);
  process.exit(1);
}

const postData = JSON.stringify({
  amount_usd: 100
});

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/payment/create-checkout',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData),
    'Cookie': cookies
  }
};

console.log('Creating checkout session...\n');

const req = http.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);
  console.log(`Headers:`, JSON.stringify(res.headers, null, 2));
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('\nResponse:');
    try {
      const json = JSON.parse(data);
      console.log(JSON.stringify(json, null, 2));
      
      if (json.checkout_url) {
        console.log('\n✅ SUCCESS! Checkout URL created:');
        console.log(json.checkout_url);
      } else if (json.error) {
        console.log('\n❌ ERROR:', json.error);
      }
    } catch (e) {
      console.log(data);
    }
  });
});

req.on('error', (e) => {
  console.error('Request error:', e.message);
});

req.write(postData);
req.end();
