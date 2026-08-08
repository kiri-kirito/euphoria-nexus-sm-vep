/**
 * sync_users.js
 * Syncs existing Supabase Auth users into the public.users table.
 * Run this when auth users exist but public.users is empty.
 */
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://zkezevgkanjfsvxhipuc.supabase.co';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

// Bangladesh names for realistic data
const BD_NAMES = [
  'Rahim Uddin', 'Karim Hossain', 'Nasrin Begum', 'Sumaiya Akter', 'Mizanur Rahman',
  'Shahida Khanam', 'Abul Kashem', 'Fatema Begum', 'Golam Mostafa', 'Hasina Akhter',
  'Imran Hossain', 'Jasmin Akter', 'Kamal Hossain', 'Laila Begum', 'Mamun Hossain',
  'Nargis Akter', 'Omar Faruk', 'Parvin Akhter', 'Quamrul Islam', 'Rashida Khanam',
  'Sabbir Ahmed', 'Tahmina Begum', 'Usman Gani', 'Vahida Begum', 'Wahidur Rahman',
  'Xamil Khan', 'Yasmin Akter', 'Zahidul Islam', 'Arman Hossain', 'Bilkis Begum',
];

const BD_PHONES = ['017', '018', '019', '015', '016'];
const BD_AREAS = ['Gulshan, Dhaka', 'Banani, Dhaka', 'Dhanmondi, Dhaka', 'Uttara, Dhaka', 'Mirpur, Dhaka', 'Mohammadpur, Dhaka', 'Gazipur', 'Narayanganj', 'Chittagong', 'Sylhet', 'Rajshahi', 'Khulna'];

function randomPhone() {
  const prefix = BD_PHONES[Math.floor(Math.random() * BD_PHONES.length)];
  return prefix + Math.floor(10000000 + Math.random() * 90000000);
}

function randomArea() {
  return BD_AREAS[Math.floor(Math.random() * BD_AREAS.length)];
}

function randomName(i) {
  return BD_NAMES[i % BD_NAMES.length];
}

const STORE_NAMES = [
  'TechZone BD', 'Digital World', 'Fashion Hub', 'Smart Gadgets', 'BD Electronics',
  'Dhaka Store', 'Premium Shop', 'Quality Mart', 'City Center', 'Mega Store',
  'Super Shop', 'Fast Delivery Co', 'Online Bazaar', 'Express Mart', 'Sunrise Store',
  'Moonlight Shop', 'Star Traders', 'Galaxy Mart', 'Nova Store', 'Zenith Shop',
  'Apex Traders', 'Prime Mart', 'Elite Store', 'Royal Shop', 'Golden Gate',
  'Silver Star', 'Diamond Mart', 'Pearl Store', 'Ruby Shop', 'Emerald Traders',
  'Sapphire Mart', 'Topaz Store', 'Crystal Shop', 'Amber Mart', 'Jade Traders',
  'Coral Store', 'Opal Shop', 'Garnet Mart', 'Onyx Store', 'Quartz Traders',
  'Beryl Mart', 'Agate Store', 'Jasper Shop', 'Flint Mart', 'Granite Traders',
  'Marble Store', 'Slate Shop', 'Basalt Mart', 'Obsidian Store', 'Pumice Traders',
];

async function syncUsers() {
  console.log('🔄 Syncing Supabase Auth users to public.users table...\n');

  // List all auth users using admin API
  let allAuthUsers = [];
  let page = 1;
  let perPage = 1000;

  const { data: { users }, error } = await supabase.auth.admin.listUsers({ perPage, page });
  if (error) {
    console.error('❌ Failed to list auth users:', error.message);
    process.exit(1);
  }
  allAuthUsers = users;
  console.log(`✅ Found ${allAuthUsers.length} auth users to sync\n`);

  // Check which ones are already in public.users
  const { data: existingUsers } = await supabase.from('users').select('id');
  const existingIds = new Set((existingUsers || []).map(u => u.id));
  console.log(`ℹ️  ${existingIds.size} users already in public.users\n`);

  const toSync = allAuthUsers.filter(u => !existingIds.has(u.id));
  console.log(`📥 Syncing ${toSync.length} new users...\n`);

  let synced = 0;
  let storeCount = 0;

  for (let i = 0; i < toSync.length; i++) {
    const authUser = toSync[i];
    const email = authUser.email || '';
    
    // Determine role from email pattern
    let role = 'buyer';
    if (email.startsWith('admin')) role = 'admin';
    else if (email.startsWith('seller')) role = 'seller';
    else if (email.startsWith('support')) role = 'support';
    else if (email.startsWith('delivery')) role = 'agent';
    else if (email.startsWith('buyer')) role = 'buyer';

    // Get name from metadata if available, otherwise generate
    const metaName = authUser.user_metadata?.name || authUser.user_metadata?.full_name;
    const name = metaName || randomName(i);

    const { error: insertError } = await supabase.from('users').insert({
      id: authUser.id,
      name,
      email,
      password_hash: 'supabase_auth',
      phone: randomPhone(),
      address: randomArea(),
      role,
      is_online: false,
    });

    if (insertError) {
      if (!insertError.message.includes('duplicate') && !insertError.message.includes('already exists')) {
        console.log(`  ⚠️  ${email}: ${insertError.message.substring(0, 60)}`);
      }
      continue;
    }

    // If seller, create a store entry
    if (role === 'seller') {
      const storeIdx = storeCount % STORE_NAMES.length;
      await supabase.from('stores').insert({
        user_id: authUser.id,
        store_name: STORE_NAMES[storeIdx] + (storeCount >= STORE_NAMES.length ? ` ${Math.floor(storeCount / STORE_NAMES.length) + 1}` : ''),
        description: `Premium quality products from ${name}. Fast delivery across Bangladesh.`,
        phone: randomPhone(),
        is_approved: true,
        rating: (4.0 + Math.random() * 0.9).toFixed(2),
        total_sales: Math.floor(Math.random() * 500),
      });
      storeCount++;
    }

    synced++;
    if (synced % 50 === 0) {
      console.log(`  → Synced ${synced}/${toSync.length} users...`);
    }
  }

  console.log(`\n✅ Synced ${synced} users to public.users`);
  console.log(`✅ Created ${storeCount} store entries\n`);

  // Verify
  const { count: userCount } = await supabase.from('users').select('*', { count: 'exact', head: true });
  const { count: sellerCount } = await supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'seller');
  const { count: buyerCount } = await supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'buyer');
  const { count: storesCount } = await supabase.from('stores').select('*', { count: 'exact', head: true });

  console.log('📊 Database Status:');
  console.log(`   Total users:   ${userCount}`);
  console.log(`   Sellers:       ${sellerCount}`);
  console.log(`   Buyers:        ${buyerCount}`);
  console.log(`   Stores:        ${storesCount}`);
  console.log('\n🎉 Sync complete! Now run: node seed_products.js');
}

syncUsers().catch(err => {
  console.error('💥 Fatal:', err);
  process.exit(1);
});
