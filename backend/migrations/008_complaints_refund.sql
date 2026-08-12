-- Return/refund complaint fields

ALTER TABLE complaints ADD COLUMN IF NOT EXISTS complaint_type VARCHAR(50) DEFAULT 'general';
ALTER TABLE complaints ADD COLUMN IF NOT EXISTS refund_amount NUMERIC(10, 2);
