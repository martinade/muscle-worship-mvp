const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function getWalletBalance(userId) {
  const { data, error } = await supabase
    .from('cointransactions')
    .select('amount_wc')
    .eq('user_id', userId);
  
  if (error) throw error;
  if (!data || data.length === 0) return 0;
  return data.reduce((sum, t) => sum + t.amount_wc, 0);
}

async function getAutoTopupConfig(userId) {
  const { data, error } = await supabase
    .from('wallets')
    .select('auto_topup_enabled, auto_topup_threshold_wc, auto_topup_amount_wc')
    .eq('user_id', userId)
    .single();

  if (error) throw error;
  return data;
}

async function triggerAutoTopUp(userId) {
  const balance = await getWalletBalance(userId);
  const config = await getAutoTopupConfig(userId);

  console.log('=== Auto-Top-Up Check ===');
  console.log('User ID:', userId);
  console.log('Current balance:', balance, 'WC');
  console.log('Auto-top-up config:');
  console.log('  - Enabled:', config.auto_topup_enabled);
  console.log('  - Threshold:', config.auto_topup_threshold_wc, 'WC');
  console.log('  - Amount:', config.auto_topup_amount_wc, 'WC');
  console.log('');

  if (!config.auto_topup_enabled) {
    console.log('❌ Auto-top-up is DISABLED');
    return;
  }

  if (balance < config.auto_topup_threshold_wc) {
    console.log(`✅ Balance (${balance}) is BELOW threshold (${config.auto_topup_threshold_wc})`);
    console.log(`🔔 AUTO-TOP-UP WOULD BE TRIGGERED!`);
    console.log(`   Would add ${config.auto_topup_amount_wc} WC to wallet`);
    // In production, this would call initiatePayment
  } else {
    console.log(`ℹ️  Balance (${balance}) is ABOVE threshold (${config.auto_topup_threshold_wc})`);
    console.log('   No auto-top-up needed');
  }
}

const userId = process.argv[2] || '41f0eccf-1e05-4680-aebe-84a682b0f64c';
triggerAutoTopUp(userId)
  .then(() => console.log('\n✅ Auto-top-up check completed'))
  .catch(err => console.error('❌ Error:', err.message));
