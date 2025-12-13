const BASE_URL = 'http://localhost:3000';

async function getToken() {
  console.log('🔑 Getting access token for testcreator...\n');

  try {
    const loginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'creator@test.com',
        password: 'Test1234!'
      })
    });

    const loginData = await loginResponse.json();
    
    if (!loginResponse.ok) {
      console.error('❌ Login failed:', loginData);
      return;
    }

    const cookies = loginResponse.headers.get('set-cookie');
    const accessTokenMatch = cookies?.match(/accessToken=([^;]+)/);
    const accessToken = accessTokenMatch ? accessTokenMatch[1] : null;
    
    if (!accessToken) {
      console.error('❌ No access token in cookies');
      return;
    }

    console.log('✅ Login successful');
    console.log('   User:', loginData.user.username);
    console.log('   Role:', loginData.user.role);
    console.log('\n📋 Copy this token for curl commands:\n');
    console.log(accessToken);
    console.log('\n💡 Use it like this:');
    console.log(`\ncurl -X POST http://localhost:3000/api/creator/legal/accept-disclaimer \\`);
    console.log(`  -H "Content-Type: application/json" \\`);
    console.log(`  -H "Authorization: Bearer ${accessToken}" \\`);
    console.log(`  -d '{"disclaimer_version": "v1.0"}'\n`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

getToken();
