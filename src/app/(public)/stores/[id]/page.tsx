'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';
import { resolveProductImage } from '@/utils/productImages';
import { useCartStore } from '@/store/useCartStore';
import NegotiateButton from '@/components/products/NegotiateButton';

export default function StorefrontPage() {
  const params = useParams();
  const sellerId = params?.id as string;
  const supabase = createClient();
  const addItem = useCartStore((s) => s.addItem);

  const [store, setStore] = useState<any>(null);
  const [sellerUser, setSellerUser] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!sellerId) return;

    async function loadStoreData() {
      setLoading(true);
      try {
        // Fetch store info
        const [{ data: storeData }, { data: userData }, { data: productsData }] = await Promise.all([
          supabase
            .from('stores')
            .select('*')
            .eq('user_id', sellerId)
            .maybeSingle(),
          supabase
            .from('users')
            .select('id, name, email, address, phone')
            .eq('id', sellerId)
            .maybeSingle(),
          supabase
            .from('products')
            .select('*')
            .eq('seller_id', sellerId)
            .eq('status', 'active')
            .order('created_at', { ascending: false }),
        ]);

        setStore(storeData || {
          store_name: userData?.name ? `${userData.name}'s Shop` : 'Official Store',
          description: 'Trusted seller on Euphoria Nexus providing verified products and fast delivery.',
          rating: 4.8,
          total_sales: 150,
        });
        setSellerUser(userData);
        setProducts(productsData || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadStoreData();
  }, [sellerId, supabase]);

  const handleAddToCart = (product: any) => {
    addItem({
      id: product.id,
      name: product.name,
      price: Number(product.price),
      quantity: 1,
      image: resolveProductImage(product),
      sellerId: product.seller_id,
    });
    setToast(`Added ${product.name} to cart!`);
    setTimeout(() => setToast(null), 2500);
  };

  const categories = ['All', ...Array.from(new Set(products.map((p) => p.category).filter(Boolean)))];

  const filteredProducts = products.filter((p) => {
    const matchesCat = selectedCategory === 'All' || p.category === selectedCategory;
    const matchesSearch = !searchQuery.trim() || p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-500 font-medium animate-pulse">
        Loading Storefront...
      </div>
    );
  }

  const storeName = store?.store_name || sellerUser?.name || 'Euphoria Partner Store';
  const rating = store?.rating ? Number(store.rating).toFixed(1) : '4.9';
  const sales = store?.total_sales || 120;
  const address = sellerUser?.address || 'Dhaka, Bangladesh';

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-16 relative">
      {toast && (
        <div className="fixed bottom-6 right-6 bg-slate-900 text-white text-xs font-bold px-5 py-3 rounded-2xl shadow-2xl z-50 animate-bounce">
          {toast}
        </div>
      )}

      {/* Store Header Banner */}
      <section className="bg-gradient-to-r from-slate-900 via-primary-dark to-slate-900 text-white py-14 px-4 sm:px-6 lg:px-8 shadow-xl relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]"></div>
        
        <div className="max-w-7xl mx-auto relative z-10 flex flex-col md:flex-row items-center md:items-start gap-6">
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-white/10 backdrop-blur-md border-2 border-white/20 flex items-center justify-center text-4xl shadow-2xl shrink-0">
            🏪
          </div>

          <div className="flex-1 text-center md:text-left space-y-2">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight">{storeName}</h1>
              <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold px-3 py-1 rounded-full">
                ✓ Verified Seller
              </span>
            </div>

            <p className="text-sm text-slate-300 max-w-2xl">
              {store?.description || 'Quality products, responsive customer support, and local delivery available.'}
            </p>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-5 pt-2 text-xs text-slate-300">
              <div className="flex items-center gap-1.5 font-bold text-amber-400">
                <span>⭐</span> {rating} Rating
              </div>
              <div>📦 {sales}+ Orders Completed</div>
              <div>📍 {address}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Store Catalog & Filter Bar */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Products Catalog ({filteredProducts.length})</h2>
            <p className="text-xs text-slate-500 mt-0.5">Direct from {storeName}</p>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            {/* Search Input */}
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search store inventory..."
              className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs text-slate-800 outline-none focus:border-primary w-full sm:w-56"
            />

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 outline-none focus:border-primary"
            >
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Product Grid */}
        {filteredProducts.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 text-slate-500 text-sm">
            No products found matching your search.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.map((prod) => {
              const img = resolveProductImage(prod);
              return (
                <div
                  key={prod.id}
                  className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group"
                >
                  <div>
                    <div className="relative aspect-square rounded-2xl overflow-hidden mb-4 bg-slate-100">
                      <img
                        src={img}
                        alt={prod.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                      />
                      {prod.compare_price && Number(prod.compare_price) > Number(prod.price) && (
                        <span className="absolute top-2.5 left-2.5 bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-lg shadow-sm">
                          SAVE {Math.round(((prod.compare_price - prod.price) / prod.compare_price) * 100)}%
                        </span>
                      )}
                    </div>

                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      {prod.category || 'Wholesale'}
                    </span>
                    <Link href={`/product/${prod.id}`}>
                      <h3 className="font-bold text-sm text-slate-900 hover:text-primary transition line-clamp-1 mt-0.5">
                        {prod.name}
                      </h3>
                    </Link>
                    <p className="text-xs text-slate-500 line-clamp-2 mt-1">{prod.description}</p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100">
                    <div className="flex items-baseline justify-between mb-3">
                      <div>
                        <span className="text-lg font-black text-slate-900">৳{Number(prod.price).toLocaleString()}</span>
                        {prod.compare_price && (
                          <span className="text-xs text-slate-400 line-through ml-2">
                            ৳{Number(prod.compare_price).toLocaleString()}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-500 font-medium">
                        Stock: {prod.quantity > 0 ? `${prod.quantity} left` : 'Out of stock'}
                      </span>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAddToCart(prod)}
                        disabled={prod.quantity <= 0}
                        className="flex-1 bg-primary hover:bg-primary-dark text-white font-bold text-xs py-2.5 rounded-xl transition shadow-md shadow-primary/20 disabled:opacity-50"
                      >
                        Add to Cart
                      </button>
                      <NegotiateButton
                        productId={prod.id}
                        productName={prod.name}
                        sellerId={prod.seller_id}
                        price={Number(prod.price)}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
