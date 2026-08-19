import { createClient } from '@/utils/supabase/client';
import { resolveProductImage } from '@/utils/productImages';

export interface ExploreProduct {
  id: string;
  name: string;
  category: string;
  price: number;
  unit: string;
  minOrder: string;
  store: string;
  seller: string;
  rating: number;
  reviews: number;
  inStock: boolean;
  image: string;
  description: string;
  specs: Record<string, string>;
  bulkTiers: { qty: string; price: number }[];
  quantity?: number;
  moq?: number;
  seller_id?: string;
  [key: string]: unknown;
}

export interface ExploreProductsParams {
  category?: string;
  search?: string;
  sellerId?: string;
  region?: string;
}

export async function fetchExploreProducts({
  category,
  search,
  sellerId,
  region,
}: ExploreProductsParams): Promise<ExploreProduct[]> {
  const supabase = createClient();

  let query = supabase
    .from('products')
    .select('*, users!seller_id(name, id, address)')
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(80);

  if (category && category !== 'All') {
    query = query.ilike('category', `%${category}%`);
  }
  if (search) {
    query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
  }
  if (sellerId) {
    query = query.eq('seller_id', sellerId);
  }

  const { data, error } = await query;
  if (error) throw error;
  if (!data) return [];
  
  let results = data;
  if (region && region !== 'All Bangladesh') {
    const regionFilter = region.replace(' Division', '');
    results = results.filter((p: any) => {
      const address = p.users?.address || '';
      return address.toLowerCase().includes(regionFilter.toLowerCase());
    });
  }

  return results.map((p: Record<string, unknown>) => ({
    id: String(p.id),
    name: String(p.name || 'Product'),
    category: String(p.category || 'General'),
    price: Number(p.price) || 0,
    seller: (p.users as { name?: string })?.name || 'Unknown Seller',
    store: (p.users as { name?: string })?.name || 'Unknown Seller',
    image: resolveProductImage(p as { name?: string; category?: string; images?: unknown }),
    minOrder: `${(p.moq as number) || 1} units`,
    unit: 'unit',
    inStock: (p.quantity as number) > 0,
    rating: (p.rating as number) || 4.5,
    reviews: (p.reviews as number) || 0,
    description: (p.description as string) || '',
    specs: (p.specs as Record<string, string>) || {},
    bulkTiers: [],
    quantity: p.quantity as number | undefined,
    moq: p.moq as number | undefined,
    seller_id: p.seller_id as string | undefined,
  }));
}

export const exploreProductsQueryKey = (params: ExploreProductsParams) =>
  ['explore-products', params] as const;
