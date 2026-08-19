'use client';

import { useState, useMemo, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useExploreProducts } from '@/hooks/useExploreProducts';
import { fetchLocalSellers } from '@/utils/api';
import { useCartStore } from '@/store/useCartStore';
import BulkDealModal from '@/components/products/BulkDealModal';
import { createClient } from '@/utils/supabase/client';
import ProductImage from '@/components/products/ProductImage';

const CATEGORIES = [
  'All',
  'Electronics',
  'Fashion',
  'Home & Kitchen',
  'Sports',
  'Food & Groceries',
  'Industrial & Tools',
];

function ExploreContent() {
  const searchParams = useSearchParams();
  const urlCategory = searchParams.get('category') || 'All';
  const urlSearch = searchParams.get('search') || '';
  const urlNearby = searchParams.get('nearby') === '1';
  const urlSeller = searchParams.get('seller') || '';
  const urlTab = searchParams.get('tab') === 'stores' ? 'stores' : 'products';

  const [exploreTab, setExploreTab] = useState<'products' | 'stores'>(urlTab);
  const [selectedCategory, setSelectedCategory] = useState<string>(urlCategory);
  const [searchQuery, setSearchQuery] = useState<string>(urlSearch);
  const [debouncedSearch, setDebouncedSearch] = useState<string>(urlSearch);
  const [priceMin, setPriceMin] = useState<string>('');
  const [priceMax, setPriceMax] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('newest');
  const [nearbyOnly, setNearbyOnly] = useState<boolean>(urlNearby);
  const [sellerFilter, setSellerFilter] = useState<string>(urlSeller);
  const [regionFilter, setRegionFilter] = useState<string>('all');
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [isNegotiateOpen, setIsNegotiateOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [nearbySellerIds, setNearbySellerIds] = useState<Set<string>>(new Set());
  const [sellerStoreName, setSellerStoreName] = useState<string | null>(null);
  
  // Stores Tab State
  const [storesList, setStoresList] = useState<any[]>([]);
  const [storesLoading, setStoresLoading] = useState(false);

  const router = useRouter();
  const addItem = useCartStore((s) => s.addItem);

  useEffect(() => {
    setSearchQuery(urlSearch);
    setDebouncedSearch(urlSearch);
    setNearbyOnly(urlNearby);
    setSellerFilter(urlSeller);
    if (urlCategory && CATEGORIES.includes(urlCategory)) {
      setSelectedCategory(urlCategory);
    }
  }, [urlSearch, urlNearby, urlSeller, urlCategory]);

  useEffect(() => {
    const debounceTimer = setTimeout(() => setDebouncedSearch(searchQuery), searchQuery ? 400 : 0);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  const {
    data: products = [],
    isLoading,
    isError,
  } = useExploreProducts({
    category: selectedCategory,
    search: debouncedSearch,
    sellerId: sellerFilter || undefined,
    region: regionFilter,
  });

  const fetchError = isError
    ? 'Product catalog could not be loaded from the database. Please refresh or try again later.'
    : null;

  // Load Stores list when stores tab is active
  useEffect(() => {
    if (exploreTab !== 'stores') return;
    async function loadStores() {
      setStoresLoading(true);
      const supabase = createClient();
      let query = supabase
        .from('stores')
        .select(`
          *,
          users!user_id (name, email, address, phone)
        `)
        .eq('is_approved', true)
        .order('rating', { ascending: false });

      if (debouncedSearch) {
        query = query.ilike('store_name', `%${debouncedSearch}%`);
      }

      const { data } = await query;
      setStoresList(data || []);
      setStoresLoading(false);
    }
    loadStores();
  }, [exploreTab, debouncedSearch]);

  useEffect(() => {
    if (!sellerFilter) {
      setSellerStoreName(null);
      return;
    }
    const supabase = createClient();
    supabase
      .from('stores')
      .select('store_name')
      .eq('user_id', sellerFilter)
      .maybeSingle()
      .then(({ data }) => {
        setSellerStoreName(data?.store_name || 'Selected Seller');
      });
  }, [sellerFilter]);

  useEffect(() => {
    if (!nearbyOnly) {
      setNearbySellerIds(new Set());
      return;
    }
    const loadNearby = (lat: number, lng: number) => {
      fetchLocalSellers(lat, lng).then((sellers) => {
        setNearbySellerIds(new Set(sellers.map((s) => s.id)));
      });
    };
    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => loadNearby(pos.coords.latitude, pos.coords.longitude),
        () => loadNearby(23.8103, 90.4125)
      );
    } else {
      loadNearby(23.8103, 90.4125);
    }
  }, [nearbyOnly]);

  const filteredProducts = useMemo(() => {
    let list = [...products];
    if (nearbyOnly && nearbySellerIds.size > 0) {
      list = list.filter((p) => p.seller_id && nearbySellerIds.has(p.seller_id));
    }
    const min = priceMin ? Number(priceMin) : null;
    const max = priceMax ? Number(priceMax) : null;
    if (min != null) list = list.filter((p) => Number(p.price) >= min);
    if (max != null) list = list.filter((p) => Number(p.price) <= max);
    if (sortBy === 'price-asc') list.sort((a, b) => Number(a.price) - Number(b.price));
    if (sortBy === 'price-desc') list.sort((a, b) => Number(b.price) - Number(a.price));
    return list;
  }, [products, priceMin, priceMax, sortBy, nearbyOnly, nearbySellerIds]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-slate-700 animate-bounce">
          <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-purple-950 to-slate-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <span className="inline-block bg-primary/20 text-primary-light text-xs font-bold px-3 py-1 rounded-full border border-primary/30 mb-3">
              B2B Marketplace & Retail Catalog
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Explore Wholesale & Retail Products</h1>
            <p className="text-slate-400 mt-2 max-w-2xl text-sm sm:text-base">
              Discover verified Bangladesh suppliers, visit online seller stores, and negotiate bulk prices directly.
            </p>
          </div>

          {/* Tab Switcher: Products vs Stores */}
          <div className="flex bg-white/10 backdrop-blur-md p-1.5 rounded-2xl border border-white/20">
            <button
              onClick={() => setExploreTab('products')}
              className={`px-5 py-2 rounded-xl text-xs font-bold transition ${
                exploreTab === 'products' ? 'bg-primary text-white shadow-lg' : 'text-slate-300 hover:text-white'
              }`}
            >
              🛍️ Products ({products.length})
            </button>
            <button
              onClick={() => setExploreTab('stores')}
              className={`px-5 py-2 rounded-xl text-xs font-bold transition ${
                exploreTab === 'stores' ? 'bg-primary text-white shadow-lg' : 'text-slate-300 hover:text-white'
              }`}
            >
              🏪 Sellers & Stores
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {sellerFilter && sellerStoreName && (
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3 bg-primary/5 border border-primary/20 rounded-xl px-4 py-3">
            <p className="text-sm font-semibold text-slate-800">
              Showing products from <span className="text-primary">{sellerStoreName}</span>
            </p>
            <button
              type="button"
              onClick={() => {
                setSellerFilter('');
                router.push('/explore');
              }}
              className="text-xs font-bold text-primary hover:underline"
            >
              Clear store filter (show all)
            </button>
          </div>
        )}

        {/* STORES TAB VIEW */}
        {exploreTab === 'stores' ? (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Verified Seller Stores</h2>
                <p className="text-xs text-slate-500 mt-1">Browse vendor shops and view their complete wholesale listings</p>
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search store name..."
                className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 outline-none focus:border-primary w-full sm:w-72"
              />
            </div>

            {storesLoading ? (
              <div className="text-center py-12 text-slate-500 font-medium animate-pulse">Loading stores...</div>
            ) : storesList.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 text-slate-500 text-sm">
                No stores found matching your search.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {storesList.map((store) => {
                  const rating = store.rating ? Number(store.rating).toFixed(1) : '4.8';
                  const sales = store.total_sales || 80;
                  const address = store.users?.address || 'Dhaka, Bangladesh';

                  return (
                    <div
                      key={store.id || store.user_id}
                      className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center gap-4 mb-4">
                          <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center text-2xl font-bold shrink-0">
                            🏪
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-bold text-slate-900 text-base">{store.store_name}</h3>
                              <span className="text-[10px] bg-emerald-100 text-emerald-700 font-bold px-2 py-0.5 rounded-full">
                                Verified
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 mt-0.5">Owner: {store.users?.name || 'Seller'}</p>
                          </div>
                        </div>

                        <p className="text-xs text-slate-600 line-clamp-2 mb-4 leading-relaxed">
                          {store.description || 'Quality wholesale vendor on Euphoria Nexus.'}
                        </p>

                        <div className="bg-slate-50 p-3 rounded-2xl flex items-center justify-between text-xs text-slate-600 mb-4">
                          <div className="font-bold text-amber-500 flex items-center gap-1">
                            <span>⭐</span> {rating}
                          </div>
                          <div>📦 {sales}+ Sales</div>
                          <div>📍 {address.split(',')[0]}</div>
                        </div>
                      </div>

                      <Link
                        href={`/stores/${store.user_id}`}
                        className="w-full py-3 bg-slate-900 hover:bg-primary text-white text-center rounded-xl font-bold text-xs transition-colors shadow-md"
                      >
                        Visit Store & Catalog →
                      </Link>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          /* PRODUCTS TAB VIEW */
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar Filters */}
            <aside className="w-full lg:w-64 space-y-6 shrink-0">
              {/* Category Filter */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <h3 className="text-sm font-bold text-slate-900 mb-3">Categories</h3>
                <div className="space-y-1">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center justify-between ${
                        selectedCategory === cat ? 'bg-primary text-white' : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <span>{cat}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range Filter */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <h3 className="text-sm font-bold text-slate-900 mb-3">Price Range (৳)</h3>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={priceMin}
                    onChange={(e) => setPriceMin(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs outline-none focus:border-primary"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={priceMax}
                    onChange={(e) => setPriceMax(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs outline-none focus:border-primary"
                  />
                </div>
              </div>
            </aside>

            {/* Product Grid */}
            <main className="flex-1">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
                <div className="w-full sm:w-80">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search products..."
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 outline-none focus:border-primary shadow-sm"
                  />
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 outline-none focus:border-primary shadow-sm"
                  >
                    <option value="newest">Sort by: Newest</option>
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                  </select>
                </div>
              </div>

              {isLoading ? (
                <div className="text-center py-16 text-slate-500 font-medium animate-pulse">Loading catalog...</div>
              ) : fetchError ? (
                <div className="bg-red-50 text-red-600 p-6 rounded-2xl border border-red-200 text-center text-sm">
                  {fetchError}
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="bg-white rounded-3xl p-16 text-center border border-slate-200 text-slate-500">
                  <p className="font-bold text-base text-slate-800">No products found</p>
                  <p className="text-xs mt-1">Try adjusting your filters or search keywords.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredProducts.map((product) => (
                    <div
                      key={product.id}
                      className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col group"
                    >
                      <div
                        className="relative h-52 bg-slate-100 overflow-hidden cursor-pointer"
                        onClick={() => router.push(`/product/${product.id}`)}
                      >
                        <ProductImage
                          product={{ name: product.name, category: product.category, images: product.images }}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-full border border-white/20">
                          MOQ: {product.minOrder || 1}
                        </div>
                      </div>

                      <div className="p-5 flex flex-col flex-1">
                        {/* Store Link */}
                        <Link
                          href={`/stores/${product.seller_id}`}
                          onClick={(e) => e.stopPropagation()}
                          className="text-xs font-bold text-primary hover:underline mb-1 inline-flex items-center gap-1 w-fit"
                        >
                          <span>🏪</span> {product.store || product.seller || 'Verified Seller'}
                        </Link>

                        <h3
                          onClick={() => router.push(`/product/${product.id}`)}
                          className="font-bold text-slate-900 text-base mb-2 line-clamp-1 group-hover:text-primary transition-colors cursor-pointer"
                        >
                          {product.name}
                        </h3>

                        <div className="flex items-baseline gap-1 mb-3">
                          <span className="text-2xl font-black text-slate-900">৳{(product.price || 0).toLocaleString()}</span>
                          <span className="text-xs text-slate-500">/{product.unit || 'unit'}</span>
                        </div>

                        <p className="text-xs text-slate-500 line-clamp-2 mb-4 leading-relaxed">
                          {product.description || 'No description available.'}
                        </p>

                        <div className="mt-auto pt-4 border-t border-slate-100 flex gap-2">
                          <button
                            onClick={() => {
                              addItem({
                                id: product.id,
                                name: product.name,
                                price: Number(product.price),
                                quantity: 1,
                                image: product.image,
                                sellerId: product.seller_id,
                              });
                              showToast(`Added ${product.name} to cart!`);
                            }}
                            className="flex-1 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold py-2.5 px-3 rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5"
                          >
                            Add to Cart
                          </button>
                          <button
                            onClick={() => {
                              setSelectedProduct(product);
                              setIsNegotiateOpen(true);
                            }}
                            className="px-3.5 py-2.5 bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold text-xs rounded-xl transition-all border border-purple-200"
                          >
                            Negotiate
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </main>
          </div>
        )}
      </div>

      {/* Bulk Deal Negotiate Modal */}
      {selectedProduct && isNegotiateOpen && (
        <BulkDealModal
          isOpen={isNegotiateOpen}
          onClose={() => {
            setIsNegotiateOpen(false);
            setSelectedProduct(null);
          }}
          productId={selectedProduct.id}
          productName={selectedProduct.name}
          sellerId={selectedProduct.seller_id}
          originalPrice={Number(selectedProduct.price)}
        />
      )}
    </div>
  );
}

export default function ExplorePage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-slate-500">Loading catalog...</div>}>
      <ExploreContent />
    </Suspense>
  );
}
