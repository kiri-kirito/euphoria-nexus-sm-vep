/**
 * run_schema.js
 * Runs the database schema using Supabase Management API.
 * Personal Access Token needed — uses project ref from URL.
 * 
 * ALTERNATIVE: Just run the SQL directly in Supabase Dashboard > SQL Editor
 */
require('dotenv').config();
const https = require('https');
const fs = require('fs');
const path = require('path');

const SUPABASE_REF = 'zkezevgkanjfsvxhipuc';
// Note: Management API requires a personal access token, not service role key
// We'll try both approaches

const SCHEMA_SQL = `
-- Core schema for Euphoria Nexus
CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL DEFAULT 'supabase_auth',
    phone VARCHAR(50),
    address TEXT,
    role VARCHAR(50) NOT NULL DEFAULT 'buyer',
    is_online BOOLEAN DEFAULT false,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read users" ON users;
CREATE POLICY "Public read users" ON users FOR SELECT USING (true);
DROP POLICY IF EXISTS "Anyone insert users" ON users;
CREATE POLICY "Anyone insert users" ON users FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Anyone update users" ON users;
CREATE POLICY "Anyone update users" ON users FOR UPDATE USING (true);

CREATE TABLE IF NOT EXISTS stores (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    store_name VARCHAR(255) NOT NULL,
    description TEXT,
    settings JSONB DEFAULT '{}',
    is_approved BOOLEAN DEFAULT false,
    logo_url TEXT,
    phone VARCHAR(50),
    rating NUMERIC(3,2) DEFAULT 4.5,
    total_sales INTEGER DEFAULT 0,
    location GEOMETRY(Point, 4326),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read stores" ON stores;
CREATE POLICY "Public read stores" ON stores FOR SELECT USING (true);
DROP POLICY IF EXISTS "Manage stores" ON stores;
CREATE POLICY "Manage stores" ON stores FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price NUMERIC(10, 2) NOT NULL,
    compare_price NUMERIC(10, 2),
    quantity INTEGER NOT NULL DEFAULT 0,
    category VARCHAR(255),
    images JSONB DEFAULT '[]',
    moq INTEGER DEFAULT 1,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Products viewable by all" ON products;
CREATE POLICY "Products viewable by all" ON products FOR SELECT USING (true);
DROP POLICY IF EXISTS "Anyone insert products" ON products;
CREATE POLICY "Anyone insert products" ON products FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Anyone update products" ON products;
CREATE POLICY "Anyone update products" ON products FOR UPDATE USING (true);
DROP POLICY IF EXISTS "Anyone delete products" ON products;
CREATE POLICY "Anyone delete products" ON products FOR DELETE USING (true);

CREATE TABLE IF NOT EXISTS product_bundles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bundle_name VARCHAR(255) NOT NULL,
    total_price NUMERIC(10, 2) NOT NULL,
    revenue_split JSONB NOT NULL DEFAULT '{}',
    image TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE product_bundles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read bundles" ON product_bundles;
CREATE POLICY "Public read bundles" ON product_bundles FOR SELECT USING (true);
DROP POLICY IF EXISTS "Manage bundles" ON product_bundles;
CREATE POLICY "Manage bundles" ON product_bundles FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS bundle_items (
    bundle_id UUID REFERENCES product_bundles(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    PRIMARY KEY (bundle_id, product_id)
);

ALTER TABLE bundle_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read bundle_items" ON bundle_items;
CREATE POLICY "Public read bundle_items" ON bundle_items FOR SELECT USING (true);
DROP POLICY IF EXISTS "Manage bundle_items" ON bundle_items;
CREATE POLICY "Manage bundle_items" ON bundle_items FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS stock_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    requesting_seller_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL,
    target_price NUMERIC(10, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'open',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE stock_requests ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read stock_requests" ON stock_requests;
CREATE POLICY "Public read stock_requests" ON stock_requests FOR SELECT USING (true);
DROP POLICY IF EXISTS "Manage stock_requests" ON stock_requests;
CREATE POLICY "Manage stock_requests" ON stock_requests FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS stock_bids (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id UUID NOT NULL REFERENCES stock_requests(id) ON DELETE CASCADE,
    bidding_seller_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    bid_price NUMERIC(10, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE stock_bids ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read stock_bids" ON stock_bids;
CREATE POLICY "Public read stock_bids" ON stock_bids FOR SELECT USING (true);
DROP POLICY IF EXISTS "Manage stock_bids" ON stock_bids;
CREATE POLICY "Manage stock_bids" ON stock_bids FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    buyer_id UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,
    total_amount NUMERIC(10, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    shipping_address TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read orders" ON orders;
CREATE POLICY "Public read orders" ON orders FOR SELECT USING (true);
DROP POLICY IF EXISTS "Insert orders" ON orders;
CREATE POLICY "Insert orders" ON orders FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Update orders" ON orders;
CREATE POLICY "Update orders" ON orders FOR UPDATE USING (true);

CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    seller_id UUID REFERENCES users(id) ON DELETE SET NULL,
    quantity INTEGER NOT NULL,
    unit_price NUMERIC(10, 2) NOT NULL
);

ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read order_items" ON order_items;
CREATE POLICY "Public read order_items" ON order_items FOR SELECT USING (true);
DROP POLICY IF EXISTS "Insert order_items" ON order_items;
CREATE POLICY "Insert order_items" ON order_items FOR INSERT WITH CHECK (true);

CREATE TABLE IF NOT EXISTS deliveries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    agent_id UUID REFERENCES users(id) ON DELETE SET NULL,
    pickup_address TEXT,
    delivery_address TEXT,
    status VARCHAR(50) DEFAULT 'assigned',
    estimated_time TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE deliveries ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read deliveries" ON deliveries;
CREATE POLICY "Public read deliveries" ON deliveries FOR SELECT USING (true);
DROP POLICY IF EXISTS "Manage deliveries" ON deliveries;
CREATE POLICY "Manage deliveries" ON deliveries FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    amount NUMERIC(10, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    transaction_id VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read payments" ON payments;
CREATE POLICY "Public read payments" ON payments FOR SELECT USING (true);
DROP POLICY IF EXISTS "Insert payments" ON payments;
CREATE POLICY "Insert payments" ON payments FOR INSERT WITH CHECK (true);

CREATE TABLE IF NOT EXISTS negotiations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    buyer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    seller_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    current_price NUMERIC(10, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'open',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE negotiations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read negotiations" ON negotiations;
CREATE POLICY "Public read negotiations" ON negotiations FOR SELECT USING (true);
DROP POLICY IF EXISTS "Manage negotiations" ON negotiations;
CREATE POLICY "Manage negotiations" ON negotiations FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS complaints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    buyer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
    description TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'open',
    resolution TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE complaints ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read complaints" ON complaints;
CREATE POLICY "Public read complaints" ON complaints FOR SELECT USING (true);
DROP POLICY IF EXISTS "Manage complaints" ON complaints;
CREATE POLICY "Manage complaints" ON complaints FOR ALL USING (true) WITH CHECK (true);
`;

console.log('╔══════════════════════════════════════════════════════════════╗');
console.log('║      EUPHORIA NEXUS — DATABASE SETUP REQUIRED               ║');
console.log('╠══════════════════════════════════════════════════════════════╣');
console.log('║                                                              ║');
console.log('║  The database schema has NOT been run in Supabase yet.      ║');
console.log('║  You need to run the SQL below in Supabase SQL Editor.      ║');
console.log('║                                                              ║');
console.log('║  STEPS:                                                      ║');
console.log('║  1. Go to: https://supabase.com/dashboard/project/          ║');
console.log('║             zkezevgkanjfsvxhipuc/sql/new                    ║');
console.log('║  2. Paste ALL the SQL printed below                         ║');
console.log('║  3. Click "Run" button                                       ║');
console.log('║  4. Then run: node seed.js                                  ║');
console.log('║     Then run: node seed_products.js                         ║');
console.log('║                                                              ║');
console.log('╚══════════════════════════════════════════════════════════════╝');
console.log('\n\n-- ===== PASTE THIS IN SUPABASE SQL EDITOR ===== --\n');
console.log(SCHEMA_SQL);
console.log('\n-- ===== END OF SQL ===== --\n');

// Also save to a file for easy copying
fs.writeFileSync(path.join(__dirname, 'SCHEMA_TO_RUN.sql'), SCHEMA_SQL, 'utf8');
console.log('✅ SQL also saved to: backend/SCHEMA_TO_RUN.sql\n');
console.log('After running the SQL in Supabase:');
console.log('  1. node seed.js             (creates all users/accounts)');
console.log('  2. node seed_products.js    (creates all products, orders, etc.)');
