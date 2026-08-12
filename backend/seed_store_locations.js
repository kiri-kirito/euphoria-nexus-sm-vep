/**
 * seed_store_locations.js — Adds lat/lng to store settings for local seller discovery
 * Run: node seed_store_locations.js (from backend/, requires backend/.env)
 * After this, sync PostGIS: UPDATE stores SET location = ST_SetSRID(ST_MakePoint(...)) ...
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

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const DHAKA_POINTS = [
  { lat: 23.8103, lng: 90.4125 },
  { lat: 23.7937, lng: 90.4066 },
  { lat: 23.7465, lng: 90.3760 },
  { lat: 23.8223, lng: 90.3654 },
  { lat: 23.8759, lng: 90.3795 },
  { lat: 23.7279, lng: 90.4135 },
  { lat: 23.7680, lng: 90.4250 },
  { lat: 23.7850, lng: 90.3500 },
];

async function main() {
  const { data: stores, error } = await supabase
    .from('stores')
    .select('user_id, settings')
    .eq('is_approved', true);

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
    const settings = { ...(stores[i].settings || {}), lat, lng, same_day_delivery: true };

    const { error: e2 } = await supabase
      .from('stores')
      .update({ settings })
      .eq('user_id', stores[i].user_id);

    if (!e2) updated++;
  }

  console.log(`✅ Updated ${updated} store settings with lat/lng`);

  const { count: withLocation } = await supabase
    .from('stores')
    .select('*', { count: 'exact', head: true })
    .not('location', 'is', null);

  const { data: rpc } = await supabase.rpc('get_sellers_within_radius', {
    lat: 23.8103,
    lng: 90.4125,
    radius_meters: 50000,
  });

  console.log(`📍 Stores with PostGIS location: ${withLocation ?? 0}`);
  console.log(`🏪 Nearby sellers RPC (50km, Gulshan): ${(rpc || []).length}`);

  if ((withLocation ?? 0) === 0) {
    console.log('\n⚠️  Run location sync SQL in Supabase if not done yet:');
    console.log(`UPDATE stores SET location = ST_SetSRID(ST_MakePoint(
  (settings->>'lng')::float, (settings->>'lat')::float
), 4326) WHERE settings->>'lat' IS NOT NULL AND location IS NULL;`);
  }
}

main().catch(console.error);
