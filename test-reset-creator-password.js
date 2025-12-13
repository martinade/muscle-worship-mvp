const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function resetPassword() {
  console.log('🔧 Resetting creator password...\n');

  const newPassword = 'password123';
  const passwordHash = await bcrypt.hash(newPassword, 10);

  const { error } = await supabase
    .from('users')
    .update({ password_hash: passwordHash })
    .eq('email', 'creator@test.com');

  if (error) {
    console.error('❌ Error:', error);
  } else {
    console.log('✅ Password reset successfully');
    console.log('   Email: creator@test.com');
    console.log('   Password: password123');
  }
}

resetPassword().catch(console.error);
