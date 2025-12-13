const BASE_URL = 'http://localhost:3000';

async function testCreatorProfileSetup() {
  console.log('🧪 Testing Creator Profile Setup Flow\n');

  try {
    // Step 1: Login as creator
    console.log('1️⃣ Logging in as creator...');
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

    // Extract cookies from response
    const cookies = loginResponse.headers.get('set-cookie');
    const accessTokenMatch = cookies?.match(/accessToken=([^;]+)/);
    const accessToken = accessTokenMatch ? accessTokenMatch[1] : null;
    
    console.log('✅ Login successful');
    console.log('   User:', loginData.user.username);
    console.log('   Role:', loginData.user.role);
    console.log('   Token:', accessToken ? accessToken.substring(0, 20) + '...\n' : 'No token received\n');
    
    if (!accessToken) {
      console.error('❌ No access token in cookies');
      return;
    }

    // Step 2: Setup creator profile
    console.log('2️⃣ Setting up creator profile...');
    const profileResponse = await fetch(`${BASE_URL}/api/creator/profile/setup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
        'Cookie': `accessToken=${accessToken}`
      },
      body: JSON.stringify({
        gender: 'male',
        height_cm: 185,
        weight_kg: 95,
        orientation: 'straight',
        text_chat_rate_wc: 2,
        webcam_rate_per_min_wc: 5,
        video_call_rate_per_hour_wc: 120,
        inperson_rate_per_hour_wc: 300,
        community_subscription_wc: 50,
        services_offered: ['text_chat', 'webcam', 'video_call'],
        specialties: ['Posing', 'Flexing', 'Wrestling'],
        best_body_parts: ['Biceps', 'Chest', 'Abs']
      })
    });

    const profileData = await profileResponse.json();

    if (!profileResponse.ok) {
      console.error('❌ Profile setup failed:');
      console.error('   Status:', profileResponse.status);
      console.error('   Response:', JSON.stringify(profileData, null, 2));
      return;
    }

    console.log('✅ Profile setup successful');
    console.log('   Profile ID:', profileData.profile_id);
    console.log('\n📊 Full Response:', JSON.stringify(profileData, null, 2));

    // Step 3: Accept legal disclaimer
    console.log('\n3️⃣ Accepting legal disclaimer...');
    const disclaimerResponse = await fetch(`${BASE_URL}/api/creator/legal/accept-disclaimer`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
        'Cookie': `accessToken=${accessToken}`
      },
      body: JSON.stringify({
        disclaimer_version: 'v1.0'
      })
    });

    const disclaimerData = await disclaimerResponse.json();

    if (!disclaimerResponse.ok) {
      console.error('❌ Disclaimer acceptance failed:', disclaimerData);
      return;
    }

    console.log('✅ Legal disclaimer accepted');
    console.log('   Accepted at:', disclaimerData.accepted_at);
    console.log('   IP Address:', disclaimerData.ip_address);

    // Step 4: Check tier eligibility
    console.log('\n4️⃣ Checking tier eligibility...');
    const tierResponse = await fetch(`${BASE_URL}/api/creator/tier/check`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Cookie': `accessToken=${accessToken}`
      }
    });

    const tierData = await tierResponse.json();

    if (!tierResponse.ok) {
      console.error('❌ Tier check failed:', tierData);
      return;
    }

    console.log('✅ Tier check complete');
    console.log('   Current Tier:', tierData.current_tier);
    console.log('   Eligible for Upgrade:', tierData.eligible_for_upgrade);
    console.log('   Missing Requirements:', tierData.missing_requirements);
    console.log('   Services Available:', tierData.services_available);

    console.log('\n✅ ALL TESTS PASSED! 🎉');
    console.log('\n📝 Next Steps:');
    console.log('   - Upload tax form via /api/creator/tax-form/submit');
    console.log('   - Upload selfie video and submit KYC via /api/creator/kyc/submit');
    console.log('   - Complete 20+ sessions to unlock Tier 2');

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }
}

// Run the test
testCreatorProfileSetup();
