-- Euphoria Nexus: schema fixes for escrow, local sellers RPC, negotiations
-- Run in Supabase SQL Editor after SCHEMA_TO_RUN.sql

-- ─── Escrow (Inter-Seller Stock Exchange) ───────────────────────────────────
CREATE TABLE IF NOT EXISTS escrow (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    stock_request_id UUID REFERENCES stock_requests(id) ON DELETE SET NULL,
    from_seller_id UUID REFERENCES users(id) ON DELETE SET NULL,
    to_seller_id UUID REFERENCES users(id) ON DELETE SET NULL,
    amount NUMERIC(10, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'held',
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE escrow ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read escrow" ON escrow;
CREATE POLICY "Public read escrow" ON escrow FOR SELECT USING (true);
DROP POLICY IF EXISTS "Manage escrow" ON escrow;
CREATE POLICY "Manage escrow" ON escrow FOR ALL USING (true) WITH CHECK (true);

-- ─── Negotiations: extra columns for seller inbox UI ────────────────────────
ALTER TABLE negotiations ADD COLUMN IF NOT EXISTS quantity INTEGER DEFAULT 1;
ALTER TABLE negotiations ADD COLUMN IF NOT EXISTS message TEXT;
ALTER TABLE negotiations ADD COLUMN IF NOT EXISTS original_price NUMERIC(10, 2);
ALTER TABLE negotiations ADD COLUMN IF NOT EXISTS final_price NUMERIC(10, 2);

-- Backfill original_price from products where missing
UPDATE negotiations n
SET original_price = p.price
FROM products p
WHERE n.product_id = p.id AND n.original_price IS NULL;

-- ─── PostGIS: nearby sellers RPC ────────────────────────────────────────────
CREATE OR REPLACE FUNCTION get_sellers_within_radius(
    lat DOUBLE PRECISION,
    lng DOUBLE PRECISION,
    radius_meters DOUBLE PRECISION DEFAULT 10000
)
RETURNS TABLE (
    id UUID,
    name TEXT,
    store_name TEXT,
    distance_km NUMERIC,
    rating NUMERIC,
    product_count BIGINT,
    image TEXT,
    is_same_day BOOLEAN,
    category TEXT
)
LANGUAGE sql
STABLE
AS $$
    SELECT
        u.id,
        u.name::TEXT,
        s.store_name::TEXT,
        ROUND((ST_Distance(
            s.location::geography,
            ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography
        ) / 1000.0)::numeric, 1) AS distance_km,
        s.rating,
        (SELECT COUNT(*) FROM products p WHERE p.seller_id = u.id AND p.status = 'active') AS product_count,
        COALESCE(s.logo_url, u.avatar_url)::TEXT AS image,
        COALESCE((s.settings->>'same_day_delivery')::boolean, true) AS is_same_day,
        COALESCE(
            (SELECT p.category FROM products p WHERE p.seller_id = u.id LIMIT 1),
            'General'
        )::TEXT AS category
    FROM stores s
    JOIN users u ON u.id = s.user_id
    WHERE s.is_approved = true
      AND s.location IS NOT NULL
      AND ST_DWithin(
            s.location::geography,
            ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography,
            radius_meters
          )
    ORDER BY distance_km ASC
    LIMIT 12;
$$;

GRANT EXECUTE ON FUNCTION get_sellers_within_radius(DOUBLE PRECISION, DOUBLE PRECISION, DOUBLE PRECISION) TO anon, authenticated;
