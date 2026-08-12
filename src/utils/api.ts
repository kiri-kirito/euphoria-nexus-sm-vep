import { createClient } from '@/utils/supabase/client';
import { resolveProductImage } from '@/utils/productImages';
import { buildPairBundles, normalizeDbBundles, type NormalizedBundle } from '@/utils/bundles';

export type ProductWithSeller = {
  id: string;
  name: string;
  price: number;
  category?: string;
  description?: string;
  moq?: number;
  quantity?: number;
  seller_id?: string;
  seller: string;
  rating: number;
  image: string;
  images?: unknown;
  users?: { name?: string };
};

function mapProductRow(p: Record<string, unknown>): ProductWithSeller {
  return {
    ...(p as ProductWithSeller),
    seller: (p.users as { name?: string })?.name || 'Unknown Seller',
    rating: 4.5,
    image: resolveProductImage(p as { name?: string; category?: string; images?: unknown }),
  };
}

export async function fetchProducts(limit = 50): Promise<ProductWithSeller[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('products')
    .select('*, users!seller_id(name)')
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('fetchProducts error:', error.message);
    return [];
  }
  return (data || []).map(mapProductRow);
}

export async function fetchProductById(id: string): Promise<ProductWithSeller | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('products')
    .select('*, users!seller_id(name)')
    .eq('id', id)
    .maybeSingle();

  if (error || !data) return null;
  return mapProductRow(data);
}

export async function fetchBundles(limit = 12): Promise<NormalizedBundle[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('product_bundles')
    .select(`
      id,
      bundle_name,
      total_price,
      revenue_split,
      bundle_items (
        product_id,
        products (
          id, name, price, seller_id, category, images,
          users!seller_id (name)
        )
      )
    `)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (!error && data && data.length > 0) {
    const normalized = normalizeDbBundles(data);
    if (normalized.length > 0) return normalized;
  }

  const products = await fetchProducts(30);
  return buildPairBundles(products, limit);
}

export interface LocalSeller {
  id: string;
  name: string;
  store_name?: string;
  distance: string;
  rating: number;
  products: number;
  image?: string;
  isSameDay: boolean;
  category?: string;
}

export async function fetchLocalSellers(
  lat: number,
  lng: number,
  radiusMeters = 15000
): Promise<LocalSeller[]> {
  const supabase = createClient();
  const { data, error } = await supabase.rpc('get_sellers_within_radius', {
    lat,
    lng,
    radius_meters: radiusMeters,
  });

  if (error) {
    console.error('fetchLocalSellers RPC error:', error.message);
    return [];
  }

  if (!data || data.length === 0) return [];

  return data.map((row: Record<string, unknown>) => ({
    id: row.id as string,
    name: (row.store_name as string) || (row.name as string),
    store_name: row.store_name as string,
    distance: `${row.distance_km} km`,
    rating: Number(row.rating) || 4.5,
    products: Number(row.product_count) || 0,
    image: (row.image as string) || undefined,
    isSameDay: row.is_same_day !== false,
    category: row.category as string,
  }));
}

export async function fetchCategories(): Promise<string[]> {
  const supabase = createClient();
  const { data } = await supabase.from('products').select('category').eq('status', 'active');
  const set = new Set<string>();
  (data || []).forEach((row: { category?: string }) => {
    if (row.category) set.add(row.category);
  });
  return ['All', ...Array.from(set).sort()];
}
