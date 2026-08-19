import { createClient } from '@/utils/supabase/client';

export async function fetchWishlistProducts(userId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('wishlists')
    .select(`
      id,
      product_id,
      created_at,
      products (
        id, name, price, category, images, seller_id,
        users!seller_id (name)
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('fetchWishlistProducts:', error.message);
    return [];
  }
  return data || [];
}

export async function addToWishlist(userId: string, productId: string) {
  const supabase = createClient();
  const { data } = await supabase
    .from('wishlists')
    .select('id')
    .eq('user_id', userId)
    .eq('product_id', productId)
    .maybeSingle();
    
  if (data) return true; // Already exists
  
  const { error } = await supabase.from('wishlists').insert(
    { user_id: userId, product_id: productId }
  );
  return !error;
}

export async function removeFromWishlist(userId: string, productId: string) {
  const supabase = createClient();
  const { error } = await supabase
    .from('wishlists')
    .delete()
    .eq('user_id', userId)
    .eq('product_id', productId);
  return !error;
}

export async function isInWishlist(userId: string, productId: string) {
  const supabase = createClient();
  const { data } = await supabase
    .from('wishlists')
    .select('id')
    .eq('user_id', userId)
    .eq('product_id', productId)
    .maybeSingle();
  return !!data;
}
