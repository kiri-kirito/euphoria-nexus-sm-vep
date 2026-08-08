require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://zkezevgkanjfsvxhipuc.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

async function test() {
  console.log('Testing Supabase connection...');
  const { data, error } = await supabase.from('users').select('id, role, email').eq('role', 'seller').limit(3);
  console.log('Sellers found:', data?.length || 0);
  console.log('Sample:', JSON.stringify(data?.[0]));
  if (error) console.log('Error:', error.message);

  const { data: allUsers, error: e2 } = await supabase.from('users').select('id, role').limit(5);
  console.log('All users sample:', JSON.stringify(allUsers));
  if (e2) console.log('Error:', e2.message);
}
test().catch(console.error);
