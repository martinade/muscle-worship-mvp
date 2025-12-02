// Test script for low balance alerts
// Run this with: node test-alert.js

const TEST_USER_ID = '41f0eccf-1e05-4680-aebe-84a682b0f64c';
const API_BASE_URL = 'https://9c42d4ee-c061-40b6-a8a7-09c5de2ec321.canvases.tempo.build';

async function testLowBalanceAlert() {
  console.log('🧪 Testing Low Balance Alert System\n');

  try {
    // Step 1: Check current balance
    console.log('1️⃣ Checking current balance...');
    const balanceRes = await fetch(`${API_BASE_URL}/api/wallet/balance?user_id=${TEST_USER_ID}`);
    const balanceData = await balanceRes.json();
    console.log(`   Current balance: ${balanceData.balance_wc} WC\n`);

    // Step 2: Credit to ensure balance is above 100
    if (balanceData.balance_wc < 100) {
      console.log('2️⃣ Crediting wallet to bring balance above 100 WC...');
      const creditRes = await fetch(`${API_BASE_URL}/api/wallet/credit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: TEST_USER_ID,
          amount_wc: 50,
          description: 'Test credit to prepare for alert test'
        })
      });
      const creditData = await creditRes.json();
      console.log(`   New balance: ${creditData.new_balance_wc} WC\n`);
    }

    // Step 3: Debit to bring balance below 100
    console.log('3️⃣ Debiting wallet to trigger low balance alert...');
    const debitRes = await fetch(`${API_BASE_URL}/api/wallet/debit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: TEST_USER_ID,
        amount_wc: 25,
        description: 'Test debit to trigger alert'
      })
    });
    const debitData = await debitRes.json();
    console.log(`   New balance: ${debitData.new_balance_wc} WC\n`);

    // Step 4: Wait a moment for trigger to fire
    console.log('4️⃣ Waiting for trigger to fire...');
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Step 5: Check for alerts
    console.log('5️⃣ Checking for alerts...');
    console.log('\n⚠️  Please run this SQL query in Supabase to verify:\n');
    console.log(`SELECT * FROM Alerts WHERE user_id = '${TEST_USER_ID}' ORDER BY created_at DESC LIMIT 3;\n`);
    
    console.log('✅ Test completed! Check the SQL query result above.');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testLowBalanceAlert();
