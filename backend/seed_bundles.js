/**
 * seed_bundles.js — Creates cross-seller product_bundles from existing products
 * Run: node seed_bundles.js (requires SUPABASE_SERVICE_ROLE_KEY in backend/.env)
 */
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function main() {
  const { data: products, error } = await supabase
    .from('products')
    .select('id, name, price, seller_id, category, images')
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(40);

  if (error || !products?.length) {
    console.error('No products found:', error?.message);
    process.exit(1);
  }

  // Clear existing bundles for idempotent re-run
  await supabase.from('bundle_items').delete().neq('bundle_id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('product_bundles').delete().neq('id', '00000000-0000-0000-0000-000000000000');

  const bundles = [];
  const usedProducts = new Set();

  for (let i = 0; i < products.length && bundles.length < 15; i++) {
    const p1 = products[i];
    if (usedProducts.has(p1.id)) continue;

    let p2 = null;
    for (let j = i + 1; j < products.length; j++) {
      if (products[j].seller_id !== p1.seller_id) {
        p2 = products[j];
        break;
      }
    }
    if (!p2) continue;

    usedProducts.add(p1.id);
    usedProducts.add(p2.id);

    const originalTotal = Number(p1.price) + Number(p2.price);
    const bundlePrice = Math.round(originalTotal * 0.85);
    const split = {
      [p1.seller_id]: Number(p1.price) / originalTotal,
      [p2.seller_id]: Number(p2.price) / originalTotal,
    };

    bundles.push({
      bundle_name: `${p1.name.split(' ').slice(0, 2).join(' ')} + ${p2.name.split(' ').slice(0, 2).join(' ')} Bundle`,
      total_price: bundlePrice,
      revenue_split: split,
      items: [p1.id, p2.id],
    });
  }

  let created = 0;
  for (const b of bundles) {
    const { data: bundleRow, error: bErr } = await supabase
      .from('product_bundles')
      .insert({
        bundle_name: b.bundle_name,
        total_price: b.total_price,
        revenue_split: b.revenue_split,
      })
      .select('id')
      .single();

    if (bErr || !bundleRow) {
      console.warn('Bundle insert failed:', bErr?.message);
      continue;
    }

    const itemRows = b.items.map((productId) => ({
      bundle_id: bundleRow.id,
      product_id: productId,
    }));

    const { error: iErr } = await supabase.from('bundle_items').insert(itemRows);
    if (iErr) console.warn('bundle_items failed:', iErr.message);
    else created++;
  }

  console.log(`✅ Created ${created} cross-seller bundles`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
