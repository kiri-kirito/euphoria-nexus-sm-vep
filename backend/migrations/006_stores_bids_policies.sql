-- Seller apply + stock bidding insert policies (DROP + CREATE pattern)

DROP POLICY IF EXISTS "Users can insert own store" ON stores;
CREATE POLICY "Users can insert own store"
    ON stores FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own store" ON stores;
CREATE POLICY "Users can update own store"
    ON stores FOR UPDATE
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Sellers can insert stock_bids" ON stock_bids;
CREATE POLICY "Sellers can insert stock_bids"
    ON stock_bids FOR INSERT
    WITH CHECK (auth.uid() = bidding_seller_id);

DROP POLICY IF EXISTS "Sellers can insert stock_requests" ON stock_requests;
CREATE POLICY "Sellers can insert stock_requests"
    ON stock_requests FOR INSERT
    WITH CHECK (auth.uid() = requesting_seller_id);

DROP POLICY IF EXISTS "Sellers can update own stock_requests" ON stock_requests;
CREATE POLICY "Sellers can update own stock_requests"
    ON stock_requests FOR UPDATE
    USING (auth.uid() = requesting_seller_id);
