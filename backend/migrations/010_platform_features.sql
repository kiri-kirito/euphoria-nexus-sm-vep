-- Same-day / priority delivery + in-app notifications

ALTER TABLE deliveries ADD COLUMN IF NOT EXISTS is_priority BOOLEAN DEFAULT false;
ALTER TABLE deliveries ADD COLUMN IF NOT EXISTS delivery_type VARCHAR(50) DEFAULT 'standard';

CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    link VARCHAR(512),
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, is_read);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users read own notifications" ON notifications;
CREATE POLICY "Users read own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users update own notifications" ON notifications;
CREATE POLICY "Users update own notifications" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Authenticated insert notifications" ON notifications;
CREATE POLICY "Authenticated insert notifications" ON notifications
  FOR INSERT WITH CHECK (true);

-- One blind bid per seller per stock request
CREATE UNIQUE INDEX IF NOT EXISTS idx_stock_bids_one_per_seller
  ON stock_bids (request_id, bidding_seller_id);

ALTER TABLE stock_requests ADD COLUMN IF NOT EXISTS fulfillment_type VARCHAR(50) DEFAULT 'bulk_transfer';

ALTER TABLE users ADD COLUMN IF NOT EXISTS is_banned BOOLEAN DEFAULT false;

CREATE TABLE IF NOT EXISTS product_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS commission_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
    seller_id UUID REFERENCES users(id) ON DELETE SET NULL,
    gross_amount NUMERIC(10, 2) NOT NULL,
    commission_rate NUMERIC(5, 2) NOT NULL,
    commission_amount NUMERIC(10, 2) NOT NULL,
    net_amount NUMERIC(10, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE commission_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone read categories" ON product_categories;
CREATE POLICY "Anyone read categories" ON product_categories FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin manage categories" ON product_categories;
CREATE POLICY "Admin manage categories" ON product_categories FOR ALL USING (true);

DROP POLICY IF EXISTS "Admin read commission logs" ON commission_logs;
CREATE POLICY "Admin read commission logs" ON commission_logs FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated insert commission logs" ON commission_logs;
CREATE POLICY "Authenticated insert commission logs" ON commission_logs FOR INSERT WITH CHECK (true);
