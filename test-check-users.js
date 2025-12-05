const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_KEY environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkUsers() {
  console.log('🔍 Checking existing users in database...\n');

  try {
    const { data: users, error } = await supabase
      .from('users')
      .select('user_id, email, username, role, account_status, created_at')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error fetching users:', error.message);
      return;
    }

    if (!users || users.length === 0) {
      console.log('📭 No users found in database');
      console.log('\n💡 Run "node test-register-user.js" to create a test user');
      return;
    }

    console.log(`✅ Found ${users.length} user(s):\n`);
    
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.username}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Status: ${user.account_status}`);
      console.log(`   ID: ${user.user_id}`);
      console.log(`   Created: ${new Date(user.created_at).toLocaleString()}`);
      console.log('');
    });

    console.log('🔍 Checking wallets for these users...\n');

    const { data: wallets, error: walletError } = await supabase
      .from('wallets')
      .select('user_id, balance_wc, escrow_balance_wc, created_at')
      .in('user_id', users.map(u => u.user_id));

    if (walletError) {
      console.error('❌ Error fetching wallets:', walletError.message);
      return;
    }

    if (!wallets || wallets.length === 0) {
      console.log('📭 No wallets found');
      return;
    }

    console.log(`✅ Found ${wallets.length} wallet(s):\n`);
    
    wallets.forEach((wallet, index) => {
      const user = users.find(u => u.user_id === wallet.user_id);
      console.log(`${index + 1}. ${user?.username || wallet.user_id}`);
      console.log(`   Balance: ${wallet.balance_wc} WC`);
      console.log(`   Escrow: ${wallet.escrow_balance_wc || 0} WC`);
      console.log(`   Created: ${new Date(wallet.created_at).toLocaleString()}`);
      console.log('');
    });

  } catch (err) {
    console.error('❌ Unexpected error:', err.message);
  }
}

checkUsers();
