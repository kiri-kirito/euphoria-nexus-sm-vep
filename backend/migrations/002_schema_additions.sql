-- Run this in Supabase SQL Editor FIRST before seeding
-- Adds missing columns needed for full functionality

-- User agent status (online/offline toggle)
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_online BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Product extra fields
ALTER TABLE products ADD COLUMN IF NOT EXISTS moq INTEGER DEFAULT 1;
ALTER TABLE products ADD COLUMN IF NOT EXISTS compare_price NUMERIC(10,2);
ALTER TABLE products ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active';

-- Store extra fields  
ALTER TABLE stores ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE stores ADD COLUMN IF NOT EXISTS logo_url TEXT;
ALTER TABLE stores ADD COLUMN IF NOT EXISTS phone VARCHAR(50);
ALTER TABLE stores ADD COLUMN IF NOT EXISTS rating NUMERIC(3,2) DEFAULT 4.5;
ALTER TABLE stores ADD COLUMN IF NOT EXISTS total_sales INTEGER DEFAULT 0;

-- Complaints: track which support agent handles it
ALTER TABLE complaints ADD COLUMN IF NOT EXISTS assigned_to UUID REFERENCES users(id);

-- Deliveries: track completion time
ALTER TABLE deliveries ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP WITH TIME ZONE;

-- Add service role policy so admin can see all users
CREATE POLICY IF NOT EXISTS "Admin can view all users" ON users FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "Anyone can view products" ON products FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "Anyone can view stores" ON stores FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "Anyone can view orders" ON orders FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "Anyone can view order_items" ON order_items FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "Anyone can view deliveries" ON deliveries FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "Anyone can view complaints" ON complaints FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "Anyone can view negotiations" ON negotiations FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "Anyone can view payments" ON payments FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "Anyone can view stock_requests" ON stock_requests FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "Anyone can view stock_bids" ON stock_bids FOR SELECT USING (true);

-- Enable RLS on tables that might not have it
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE negotiations ENABLE ROW LEVEL SECURITY;
ALTER TABLE complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_bids ENABLE ROW LEVEL SECURITY;
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;

-- Allow inserts for authenticated users
CREATE POLICY IF NOT EXISTS "Authenticated users can insert orders" ON orders FOR INSERT WITH CHECK (auth.uid() = buyer_id);
CREATE POLICY IF NOT EXISTS "Authenticated users can insert order_items" ON order_items FOR INSERT WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "Authenticated users can insert complaints" ON complaints FOR INSERT WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "Authenticated users can insert negotiations" ON negotiations FOR INSERT WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "Authenticated users can update complaints" ON complaints FOR UPDATE USING (true);
CREATE POLICY IF NOT EXISTS "Authenticated users can update deliveries" ON deliveries FOR UPDATE USING (true);
CREATE POLICY IF NOT EXISTS "Sellers can update their products" ON products FOR UPDATE USING (true);
CREATE POLICY IF NOT EXISTS "Sellers can insert products" ON products FOR INSERT WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "Sellers can delete their products" ON products FOR DELETE USING (true);
