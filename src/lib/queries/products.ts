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
    .in('status', ['active', 'Active', 'ACTIVE'])
    .order('created_at', { ascending: false })
    .limit(120);

  if (category && category !== 'All' && category !== 'all') {
    const mainCat = category.split(' ')[0].replace(/[^a-zA-Z]/g, '');
    query = query.ilike('category', `%${mainCat}%`);
  }

  if (search) {
    query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
  }

  if (sellerId) {
    query = query.eq('seller_id', sellerId);
  }

  const [{ data, error }, { data: stores }] = await Promise.all([
    query,
    supabase.from('stores').select('user_id, store_name, rating, total_sales'),
  ]);

  if (error) throw error;
  if (!data) return [];

  const storeMap = new Map((stores || []).map((s) => [s.user_id, s]));

  let results = data;
  if (region && region.toLowerCase() !== 'all' && region !== 'All Bangladesh') {
    const regionFilter = region.replace(' Division', '').toLowerCase();
    results = results.filter((p: any) => {
      const address = (p.users?.address || '').toLowerCase();
      return address.includes(regionFilter);
    });
  }

  return results.map((p: Record<string, unknown>) => {
    const storeInfo = p.seller_id ? storeMap.get(p.seller_id as string) : undefined;
    const storeName = storeInfo?.store_name || (p.users as { name?: string })?.name || 'Verified Vendor';

    return {
      id: String(p.id),
      name: String(p.name || 'Product'),
      category: String(p.category || 'General'),
      price: Number(p.price) || 0,
      seller: (p.users as { name?: string })?.name || storeName,
      store: storeName,
      image: resolveProductImage(p as { name?: string; category?: string; images?: unknown }),
      minOrder: `${(p.moq as number) || 1} units`,
      unit: 'unit',
      inStock: (p.quantity as number) > 0,
      rating: storeInfo?.rating ? Number(storeInfo.rating) : (p.rating as number) || 4.8,
      reviews: (p.reviews as number) || (storeInfo?.total_sales as number) || 12,
      description: (p.description as string) || '',
      specs: (p.specs as Record<string, string>) || {},
      bulkTiers: [],
      quantity: p.quantity as number | undefined,
      moq: p.moq as number | undefined,
      seller_id: p.seller_id as string | undefined,
    };
  });
}

export const exploreProductsQueryKey = (params: ExploreProductsParams) =>
  ['explore-products', params] as const;
