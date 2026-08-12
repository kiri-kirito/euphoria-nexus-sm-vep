/**
 * apply_wishlist_migration.js — Creates wishlists table via Supabase SQL API
 */
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const fs = require('fs');
const https = require('https');

const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SUPABASE_REF = 'zkezevgkanjfsvxhipuc';

const sql = fs.readFileSync(path.join(__dirname, 'migrations', '004_wishlists.sql'), 'utf8');

function runSql(query) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ query });
    const req = https.request(
      {
        hostname: `${SUPABASE_REF}.supabase.co`,
        path: '/rest/v1/rpc/exec_sql',
        method: 'POST',
        headers: {
          apikey: SERVICE_ROLE_KEY,
          Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(body),
        },
      },
      (res) => {
        let data = '';
        res.on('data', (c) => (data += c));
        res.on('end', () => resolve({ status: res.statusCode, data }));
      }
    );
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

async function main() {
  if (!SERVICE_ROLE_KEY) {
    console.error('Missing SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
  }

  const { createClient } = require('@supabase/supabase-js');
  const supabase = createClient(
    process.env.SUPABASE_URL || `https://${SUPABASE_REF}.supabase.co`,
    SERVICE_ROLE_KEY
  );

  const { error } = await supabase.from('wishlists').select('id').limit(1);
  if (!error) {
    console.log('✅ wishlists table already exists');
    return;
  }

  console.log('wishlists table missing — please run backend/migrations/004_wishlists.sql in Supabase SQL Editor');
  console.log('Error was:', error.message);
}

main().catch(console.error);
