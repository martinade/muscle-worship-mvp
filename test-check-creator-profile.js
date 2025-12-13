const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function checkCreatorProfile() {
  console.log('🔍 Checking creator profile...\n');

  const { data: user } = await supabase
    .from('users')
    .select('id, email')
    .eq('email', 'creator@test.com')
    .single();

  if (!user) {
    console.log('❌ User not found');
    return;
  }

  console.log('✅ User found:', user.email);
  console.log('   ID:', user.id);

  const { data: profile, error } = await supabase
    .from('creator_profiles')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (error || !profile) {
    console.log('\n❌ Creator profile not found');
    console.log('   Creating profile...');
    
    const { data: newProfile, error: createError } = await supabase
      .from('creator_profiles')
      .insert({ user_id: user.id })
      .select()
      .single();
    
    if (createError) {
      console.error('   Error:', createError);
    } else {
      console.log('   ✅ Profile created');
    }
  } else {
    console.log('\n✅ Creator profile exists');
    console.log('   Display name:', profile.display_name || 'Not set');
    console.log('   Bio:', profile.bio || 'Not set');
  }
}

checkCreatorProfile().catch(console.error);
