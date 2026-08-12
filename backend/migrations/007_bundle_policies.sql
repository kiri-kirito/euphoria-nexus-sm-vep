-- Bundle create/join policies for seller bundling page

ALTER TABLE product_bundles ENABLE ROW LEVEL SECURITY;
ALTER TABLE bundle_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view product_bundles" ON product_bundles;
CREATE POLICY "Anyone can view product_bundles"
    ON product_bundles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Sellers can create product_bundles" ON product_bundles;
CREATE POLICY "Sellers can create product_bundles"
    ON product_bundles FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Anyone can view bundle_items" ON bundle_items;
CREATE POLICY "Anyone can view bundle_items"
    ON bundle_items FOR SELECT USING (true);

DROP POLICY IF EXISTS "Sellers can insert bundle_items" ON bundle_items;
CREATE POLICY "Sellers can insert bundle_items"
    ON bundle_items FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);
