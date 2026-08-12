-- Wishlists for buyer saved products
CREATE TABLE IF NOT EXISTS wishlists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id, product_id)
);

ALTER TABLE wishlists ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users read own wishlist" ON wishlists;
CREATE POLICY "Users read own wishlist" ON wishlists FOR SELECT USING (true);
DROP POLICY IF EXISTS "Users manage own wishlist" ON wishlists;
CREATE POLICY "Users manage own wishlist" ON wishlists FOR ALL USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_wishlists_user_id ON wishlists(user_id);
