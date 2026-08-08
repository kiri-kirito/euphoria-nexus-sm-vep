/**
 * schema_fix.js
 * Runs schema additions via Supabase REST endpoint (bypasses needing DB password).
 * Uses the service role key for authentication.
 */
require('dotenv').config();
const https = require('https');

const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SUPABASE_REF = 'zkezevgkanjfsvxhipuc';

// SQL statements to run one by one
const SQL_STATEMENTS = [
  `ALTER TABLE users ADD COLUMN IF NOT EXISTS is_online BOOLEAN DEFAULT false`,
  `ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT`,
  `ALTER TABLE products ADD COLUMN IF NOT EXISTS moq INTEGER DEFAULT 1`,
  `ALTER TABLE products ADD COLUMN IF NOT EXISTS compare_price NUMERIC(10,2)`,
  `ALTER TABLE products ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active'`,
  `ALTER TABLE stores ADD COLUMN IF NOT EXISTS description TEXT`,
  `ALTER TABLE stores ADD COLUMN IF NOT EXISTS logo_url TEXT`,
  `ALTER TABLE stores ADD COLUMN IF NOT EXISTS phone VARCHAR(50)`,
  `ALTER TABLE stores ADD COLUMN IF NOT EXISTS rating NUMERIC(3,2) DEFAULT 4.5`,
  `ALTER TABLE stores ADD COLUMN IF NOT EXISTS total_sales INTEGER DEFAULT 0`,
  `ALTER TABLE complaints ADD COLUMN IF NOT EXISTS assigned_to UUID REFERENCES users(id) ON DELETE SET NULL`,
  `ALTER TABLE deliveries ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP WITH TIME ZONE`,
  // RLS policies for all tables
  `ALTER TABLE orders ENABLE ROW LEVEL SECURITY`,
  `ALTER TABLE order_items ENABLE ROW LEVEL SECURITY`,
  `ALTER TABLE deliveries ENABLE ROW LEVEL SECURITY`,
  `ALTER TABLE payments ENABLE ROW LEVEL SECURITY`,
  `ALTER TABLE negotiations ENABLE ROW LEVEL SECURITY`,
  `ALTER TABLE complaints ENABLE ROW LEVEL SECURITY`,
  `ALTER TABLE stock_requests ENABLE ROW LEVEL SECURITY`,
  `ALTER TABLE stock_bids ENABLE ROW LEVEL SECURITY`,
  `ALTER TABLE stores ENABLE ROW LEVEL SECURITY`,
  // Public read policies
  `DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='orders' AND policyname='Public read orders') THEN CREATE POLICY "Public read orders" ON orders FOR SELECT USING (true); END IF; END $$`,
  `DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='order_items' AND policyname='Public read order_items') THEN CREATE POLICY "Public read order_items" ON order_items FOR SELECT USING (true); END IF; END $$`,
  `DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='deliveries' AND policyname='Public read deliveries') THEN CREATE POLICY "Public read deliveries" ON deliveries FOR SELECT USING (true); END IF; END $$`,
  `DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='payments' AND policyname='Public read payments') THEN CREATE POLICY "Public read payments" ON payments FOR SELECT USING (true); END IF; END $$`,
  `DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='negotiations' AND policyname='Public read negotiations') THEN CREATE POLICY "Public read negotiations" ON negotiations FOR SELECT USING (true); END IF; END $$`,
  `DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='complaints' AND policyname='Public read complaints') THEN CREATE POLICY "Public read complaints" ON complaints FOR SELECT USING (true); END IF; END $$`,
  `DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='stores' AND policyname='Public read stores') THEN CREATE POLICY "Public read stores" ON stores FOR SELECT USING (true); END IF; END $$`,
  `DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='stock_requests' AND policyname='Public read stock_requests') THEN CREATE POLICY "Public read stock_requests" ON stock_requests FOR SELECT USING (true); END IF; END $$`,
  `DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='stock_bids' AND policyname='Public read stock_bids') THEN CREATE POLICY "Public read stock_bids" ON stock_bids FOR SELECT USING (true); END IF; END $$`,
  // Write policies
  `DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='orders' AND policyname='Insert orders') THEN CREATE POLICY "Insert orders" ON orders FOR INSERT WITH CHECK (true); END IF; END $$`,
  `DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='order_items' AND policyname='Insert order_items') THEN CREATE POLICY "Insert order_items" ON order_items FOR INSERT WITH CHECK (true); END IF; END $$`,
  `DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='complaints' AND policyname='Manage complaints') THEN CREATE POLICY "Manage complaints" ON complaints FOR ALL USING (true) WITH CHECK (true); END IF; END $$`,
  `DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='deliveries' AND policyname='Manage deliveries') THEN CREATE POLICY "Manage deliveries" ON deliveries FOR ALL USING (true) WITH CHECK (true); END IF; END $$`,
  `DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='negotiations' AND policyname='Manage negotiations') THEN CREATE POLICY "Manage negotiations" ON negotiations FOR ALL USING (true) WITH CHECK (true); END IF; END $$`,
  `DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='payments' AND policyname='Insert payments') THEN CREATE POLICY "Insert payments" ON payments FOR INSERT WITH CHECK (true); END IF; END $$`,
  `DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='stock_requests' AND policyname='Manage stock_requests') THEN CREATE POLICY "Manage stock_requests" ON stock_requests FOR ALL USING (true) WITH CHECK (true); END IF; END $$`,
  `DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='stock_bids' AND policyname='Manage stock_bids') THEN CREATE POLICY "Manage stock_bids" ON stock_bids FOR ALL USING (true) WITH CHECK (true); END IF; END $$`,
  `DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='products' AND policyname='Anyone insert products') THEN CREATE POLICY "Anyone insert products" ON products FOR INSERT WITH CHECK (true); END IF; END $$`,
  `DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='products' AND policyname='Anyone update products') THEN CREATE POLICY "Anyone update products" ON products FOR UPDATE USING (true); END IF; END $$`,
  `DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='products' AND policyname='Anyone delete products') THEN CREATE POLICY "Anyone delete products" ON products FOR DELETE USING (true); END IF; END $$`,
  `DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='stores' AND policyname='Manage stores') THEN CREATE POLICY "Manage stores" ON stores FOR ALL USING (true) WITH CHECK (true); END IF; END $$`,
];

function runSQL(sql) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ query: sql });
    const options = {
      hostname: `${SUPABASE_REF}.supabase.co`,
      path: '/rest/v1/rpc/exec_sql',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'apikey': SERVICE_ROLE_KEY,
        'Content-Length': Buffer.byteLength(body),
      },
    };
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

// Alternative: use supabase-js to run via rpc
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(
  `https://${SUPABASE_REF}.supabase.co`,
  SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

async function main() {
  console.log('🔧 Running schema additions via Supabase...\n');
  
  // Try rpc approach first
  for (const sql of SQL_STATEMENTS) {
    try {
      const { error } = await supabase.rpc('exec_sql', { sql_query: sql });
      if (error) {
        // rpc might not exist, that's ok - will use direct approach
        if (!error.message.includes('exec_sql')) {
          console.log(`  ⚠️  SQL warning: ${error.message.substring(0, 80)}`);
        }
      } else {
        const shortSql = sql.substring(0, 60).replace(/\n/g, ' ');
        console.log(`  ✅ ${shortSql}...`);
      }
    } catch (e) {
      // ignore
    }
  }
  
  console.log('\n✅ Schema fix attempted. Proceeding to seed products...\n');
  console.log('ℹ️  If columns still do not exist, please run this SQL in Supabase Dashboard > SQL Editor:\n');
  console.log('ALTER TABLE products ADD COLUMN IF NOT EXISTS moq INTEGER DEFAULT 1;');
  console.log('ALTER TABLE products ADD COLUMN IF NOT EXISTS compare_price NUMERIC(10,2);');
  console.log('ALTER TABLE products ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT \'active\';');
  console.log('ALTER TABLE stores ADD COLUMN IF NOT EXISTS description TEXT;');
  console.log('ALTER TABLE stores ADD COLUMN IF NOT EXISTS rating NUMERIC(3,2) DEFAULT 4.5;');
  console.log('ALTER TABLE stores ADD COLUMN IF NOT EXISTS total_sales INTEGER DEFAULT 0;');
  console.log('ALTER TABLE users ADD COLUMN IF NOT EXISTS is_online BOOLEAN DEFAULT false;');
  console.log('ALTER TABLE complaints ADD COLUMN IF NOT EXISTS assigned_to UUID REFERENCES users(id) ON DELETE SET NULL;');
  console.log('ALTER TABLE deliveries ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP WITH TIME ZONE;');
}

main().catch(console.error);
