/**
 * apply_migrations.js — Applies pending SQL migrations via exec_sql RPC
 */
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://zkezevgkanjfsvxhipuc.supabase.co';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const EXTRA_SQL = [
  fs.readFileSync(path.join(__dirname, 'migrations', '004_wishlists.sql'), 'utf8'),
  `UPDATE stores SET location = ST_SetSRID(ST_MakePoint(
    (settings->>'lng')::float, (settings->>'lat')::float
  ), 4326)
  WHERE settings->>'lat' IS NOT NULL AND (location IS NULL OR location::text = 'POINT EMPTY');`,
];

async function main() {
  if (!SERVICE_ROLE_KEY) {
    console.error('Missing SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
  }

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  for (const sql of EXTRA_SQL) {
    const label = sql.trim().substring(0, 50).replace(/\n/g, ' ');
    const { error } = await supabase.rpc('exec_sql', { sql_query: sql });
    if (error) {
      console.log(`⚠️  ${label}... — ${error.message}`);
    } else {
      console.log(`✅ ${label}...`);
    }
  }

  const { count: locCount } = await supabase
    .from('stores')
    .select('*', { count: 'exact', head: true })
    .not('location', 'is', null);

  const { data: rpc } = await supabase.rpc('get_sellers_within_radius', {
    lat: 23.8103,
    lng: 90.4125,
    radius_meters: 50000,
  });

  const { error: wlErr } = await supabase.from('wishlists').select('id').limit(1);
  console.log(`\n📍 Stores with location: ${locCount ?? '?'}`);
  console.log(`🏪 Nearby sellers RPC: ${(rpc || []).length}`);
  console.log(`❤️  Wishlists table: ${wlErr ? 'MISSING — run 004_wishlists.sql manually' : 'OK'}`);
}

main().catch(console.error);
