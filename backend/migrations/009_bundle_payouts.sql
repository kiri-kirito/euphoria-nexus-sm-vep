-- Cross-seller bundle payouts and multi-pickup delivery metadata

CREATE TABLE IF NOT EXISTS seller_payouts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    seller_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    bundle_id UUID REFERENCES product_bundles(id) ON DELETE SET NULL,
    amount NUMERIC(10, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE orders ADD COLUMN IF NOT EXISTS bundle_id UUID REFERENCES product_bundles(id) ON DELETE SET NULL;
ALTER TABLE deliveries ADD COLUMN IF NOT EXISTS pickup_stops JSONB DEFAULT '[]'::jsonb;

CREATE INDEX IF NOT EXISTS idx_seller_payouts_order ON seller_payouts(order_id);
CREATE INDEX IF NOT EXISTS idx_seller_payouts_seller ON seller_payouts(seller_id);

ALTER TABLE seller_payouts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Sellers view own payouts" ON seller_payouts;
CREATE POLICY "Sellers view own payouts" ON seller_payouts
  FOR SELECT USING (auth.uid() = seller_id);

DROP POLICY IF EXISTS "Service role manages payouts" ON seller_payouts;
CREATE POLICY "Service role manages payouts" ON seller_payouts
  FOR ALL USING (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Authenticated insert payouts" ON seller_payouts;
CREATE POLICY "Authenticated insert payouts" ON seller_payouts
  FOR INSERT WITH CHECK (true);
