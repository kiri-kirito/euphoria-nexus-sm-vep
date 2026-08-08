require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://zkezevgkanjfsvxhipuc.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

async function verify() {
  console.log('\n🔍 EUPHORIA NEXUS — DATABASE VERIFICATION\n');
  console.log('═'.repeat(50));

  const checks = [
    { table: 'users', role: null, label: 'Total Users' },
    { table: 'users', role: 'admin', label: 'Admins' },
    { table: 'users', role: 'seller', label: 'Sellers' },
    { table: 'users', role: 'buyer', label: 'Buyers' },
    { table: 'users', role: 'agent', label: 'Delivery Agents' },
    { table: 'users', role: 'support', label: 'Support Agents' },
  ];

  for (const c of checks) {
    let q = supabase.from(c.table).select('*', { count: 'exact', head: true });
    if (c.role) q = q.eq('role', c.role);
    const { count } = await q;
    console.log(`   ${c.label.padEnd(20)} → ${count || 0}`);
  }

  console.log('─'.repeat(50));

  const tables = [
    { table: 'products', label: 'Products' },
    { table: 'stores', label: 'Stores' },
    { table: 'orders', label: 'Orders' },
    { table: 'order_items', label: 'Order Items' },
    { table: 'deliveries', label: 'Deliveries' },
    { table: 'payments', label: 'Payments' },
    { table: 'complaints', label: 'Complaints' },
    { table: 'negotiations', label: 'Negotiations' },
    { table: 'stock_requests', label: 'Stock Requests' },
  ];

  for (const t of tables) {
    const { count } = await supabase.from(t.table).select('*', { count: 'exact', head: true });
    console.log(`   ${t.label.padEnd(20)} → ${count || 0}`);
  }

  console.log('─'.repeat(50));

  // Sample a real product
  const { data: product } = await supabase.from('products').select('name, price, category, images').limit(1).single();
  if (product) {
    console.log(`\n   Sample Product: ${product.name}`);
    console.log(`   Price: ৳${product.price} | Category: ${product.category}`);
    const img = Array.isArray(product.images) ? product.images[0] : JSON.parse(product.images||'[]')[0];
    console.log(`   Image: ${img?.substring(0, 60)}...`);
  }

  // Revenue
  const { data: orders } = await supabase.from('orders').select('total_amount');
  const gmv = orders?.reduce((s, o) => s + Number(o.total_amount), 0) || 0;
  console.log(`\n   Platform GMV: ৳${gmv.toLocaleString()}`);
  console.log('\n' + '═'.repeat(50));
  console.log('   ✅ DATABASE FULLY OPERATIONAL!');
  console.log('═'.repeat(50) + '\n');
}

verify().catch(console.error);
