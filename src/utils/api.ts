import { createClient } from '@/utils/supabase/client'

// MOCK FALLBACK DATA
export const MOCK_PRODUCTS = [
  { id: '1', name: 'Wireless Noise-Cancelling Headphones', price: 299.99, image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80', seller: 'AudioTech', rating: 4.8 },
  { id: '2', name: 'Mechanical Keyboard', price: 149.99, image: 'https://images.unsplash.com/photo-1595225476474-87563907a212?w=500&q=80', seller: 'KeyMaster', rating: 4.9 },
  { id: '3', name: 'Smart Fitness Watch', price: 199.99, image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&q=80', seller: 'FitLife', rating: 4.7 },
  { id: '4', name: 'Ultra HD 4K Monitor', price: 399.99, image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=500&q=80', seller: 'VisionPro', rating: 4.6 }
];

export const MOCK_BUNDLES = [
  { id: 'b1', title: 'The Ultimate WFH Setup', price: 449.99, originalPrice: 550.00, items: 3, sellers: 2, image: 'https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=500&q=80' },
  { id: 'b2', title: 'Fitness Starter Kit', price: 129.99, originalPrice: 180.00, items: 4, sellers: 3, image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=500&q=80' },
];

export const MOCK_SELLERS = [
  { id: 's1', name: 'TechHaven', distance: '1.2 miles', rating: 4.9, products: 124, image: 'https://images.unsplash.com/photo-1556740738-b6a63e27c4df?w=200&q=80' },
  { id: 's2', name: 'Fresh Grocer', distance: '0.8 miles', rating: 4.7, products: 500, image: 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=200&q=80' },
  { id: 's3', name: 'Local Artisan', distance: '2.5 miles', rating: 5.0, products: 42, image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=200&q=80' }
];

// API FETCHERS
export async function fetchProducts() {
  const supabase = createClient();
  const { data, error } = await supabase.from('products').select('*').limit(10);
  if (error || !data || data.length === 0) {
    console.warn("DB not connected or empty. Falling back to MOCK_PRODUCTS.");
    return MOCK_PRODUCTS;
  }
  return data;
}

export async function fetchBundles() {
  const supabase = createClient();
  const { data, error } = await supabase.from('product_bundles').select('*').limit(10);
  if (error || !data || data.length === 0) {
    return MOCK_BUNDLES;
  }
  return data;
}

export async function fetchLocalSellers(lat: number, lng: number, radius = 5000) {
  const supabase = createClient();
  // Call the PostGIS function we created in schema
  const { data, error } = await supabase.rpc('get_sellers_within_radius', {
    lat: lat,
    lng: lng,
    radius_meters: radius
  });
  if (error || !data || data.length === 0) {
    return MOCK_SELLERS;
  }
  return data;
}
