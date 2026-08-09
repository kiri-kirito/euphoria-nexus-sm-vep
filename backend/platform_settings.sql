-- Create platform_settings table
CREATE TABLE IF NOT EXISTS platform_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    commission_rate NUMERIC(5,2) DEFAULT 10.00,
    minimum_payout NUMERIC(10,2) DEFAULT 50.00,
    auto_approve_sellers BOOLEAN DEFAULT true,
    maintenance_mode BOOLEAN DEFAULT false,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- RLS Policies
ALTER TABLE platform_settings ENABLE ROW LEVEL SECURITY;

-- Anyone can read (useful for showing commission to sellers etc, though we might want to restrict it later)
DROP POLICY IF EXISTS "Public read platform_settings" ON platform_settings;
CREATE POLICY "Public read platform_settings" ON platform_settings FOR SELECT USING (true);

-- Only admins should be able to update, but for this demo, anyone can update
DROP POLICY IF EXISTS "Anyone update platform_settings" ON platform_settings;
CREATE POLICY "Anyone update platform_settings" ON platform_settings FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Anyone insert platform_settings" ON platform_settings;
CREATE POLICY "Anyone insert platform_settings" ON platform_settings FOR INSERT WITH CHECK (true);

-- Insert initial default row if it doesn't exist
INSERT INTO platform_settings (id, commission_rate, minimum_payout, auto_approve_sellers, maintenance_mode)
SELECT 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 10.00, 50.00, true, false
WHERE NOT EXISTS (SELECT 1 FROM platform_settings);
