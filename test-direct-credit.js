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
  console.log('✅ Cookies loaded\n');
} catch (e) {
  console.error('❌ Failed to read cookies:', e.message);
  console.log('Please login first:\n');
  console.log('curl -X POST http://localhost:3000/api/auth/login \\');
  console.log('  -H "Content-Type: application/json" \\');
  console.log('  -d \'{"email":"wallettest@test.com","password":"Test1234!"}\' \\');
  console.log('  -c cookies.txt\n');
  process.exit(1);
}

// Test direct wallet credit
const testDirectCredit = (amountWC) => {
  const postData = JSON.stringify({
    amount_wc: amountWC,
    description: 'Test payment simulation'
  });

  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/wallet/credit',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData),
      'Cookie': cookies
    }
  };

  console.log('🧪 Testing direct wallet credit...');
  console.log('Amount WC:', amountWC);
  console.log('\nSending request...\n');

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
        
        if (res.statusCode === 200) {
          console.log('\n✅ Wallet credited successfully!');
          console.log('New balance:', json.new_balance, 'WC');
        } else {
          console.log('\n❌ Credit failed:', json.error);
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
};

// Get amount from command line or use default
const amountWC = parseFloat(process.argv[2]) || 100; // 100 WC = $100

testDirectCredit(amountWC);
