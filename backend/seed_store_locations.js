/**
 * seed_store_locations.js — Adds PostGIS locations to stores for local seller discovery
 */
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SERVICE_ROLE_KEY || !SUPABASE_URL) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in backend/.env');
  process.exit(1);
}

const supabase = createClient(
  SUPABASE_URL,
  SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

// Dhaka area coordinates
const DHAKA_POINTS = [
  { lat: 23.8103, lng: 90.4125 }, // Gulshan
  { lat: 23.7937, lng: 90.4066 }, // Banani
  { lat: 23.7465, lng: 90.3760 }, // Dhanmondi
  { lat: 23.8223, lng: 90.3654 }, // Mirpur
  { lat: 23.8759, lng: 90.3795 }, // Uttara
  { lat: 23.7279, lng: 90.4135 }, // Motijheel
  { lat: 23.7680, lng: 90.4250 }, // Badda
  { lat: 23.7850, lng: 90.3500 }, // Mohammadpur
];

async function main() {
  const { data: stores, error } = await supabase.from('stores').select('user_id').eq('is_approved', true);
  if (error || !stores?.length) {
    console.error('No stores found:', error?.message);
    process.exit(1);
  }

  let updated = 0;
  for (let i = 0; i < stores.length; i++) {
    const pt = DHAKA_POINTS[i % DHAKA_POINTS.length];
    const jitter = () => (Math.random() - 0.5) * 0.02;
    const lat = pt.lat + jitter();
    const lng = pt.lng + jitter();

    const { error: upErr } = await supabase.rpc('exec_sql', {}).catch(() => ({ error: { message: 'no rpc' } }));

    // Use raw update via REST — PostGIS via WKT in a workaround: update settings with lat/lng and use SQL separately
    // Supabase JS doesn't support geometry directly; use SQL through postgres if available
    // Fallback: store lat/lng in settings JSONB for client-side distance until geometry is set via SQL Editor

    const { data: existing } = await supabase.from('stores').select('settings').eq('user_id', stores[i].user_id).single();
    const settings = { ...(existing?.settings || {}), lat, lng, same_day_delivery: true };

    const { error: e2 } = await supabase
      .from('stores')
      .update({ settings })
      .eq('user_id', stores[i].user_id);

    if (!e2) updated++;
  }

  console.log(`✅ Updated ${updated} store settings with lat/lng`);
  console.log('⚠️  Run this SQL in Supabase to sync geometry from settings:');
  console.log(`
UPDATE stores SET location = ST_SetSRID(ST_MakePoint(
  (settings->>'lng')::float, (settings->>'lat')::float
), 4326)
WHERE settings->>'lat' IS NOT NULL AND location IS NULL;
  `);
}

main().catch(console.error);
