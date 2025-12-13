const fs = require('fs');

// Read the access token
const token = fs.readFileSync('access_token.txt', 'utf8').trim();

// Import the handler directly
async function testTierCheck() {
  try {
    // Mock the request and response objects
    const req = {
      method: 'GET',
      headers: {
        authorization: `Bearer ${token}`
      }
    };

    const res = {
      status: function(code) {
        this.statusCode = code;
        return this;
      },
      json: function(data) {
        console.log('\n✅ Response Status:', this.statusCode);
        console.log('📊 Response Data:');
        console.log(JSON.stringify(data, null, 2));
        return this;
      }
    };

    // Import and call the handler
    const handler = require('./src/pages/api/creator/tier/check.ts').default;
    await handler(req, res);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
  }
}

testTierCheck();
