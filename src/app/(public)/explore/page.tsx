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
  'Home',
  'Sports',
  'Food',
  'Industrial',
  'Accessories',
  'Health',
];

const REGIONS = [
  'All Bangladesh',
  'Dhaka',
  'Chittagong',
  'Sylhet',
  'Khulna',
  'Rajshahi',
  'Barisal',
  'Rangpur',
  'Mymensingh',
  'Narayanganj',
];

function ExploreContent() {
  const searchParams = useSearchParams();
  const urlCategory = searchParams.get('category') || 'All';
  const urlSearch = searchParams.get('search') || '';
  const urlNearby = searchParams.get('nearby') === '1';
  const urlSeller = searchParams.get('seller') || '';
  const urlTab = searchParams.get('tab') === 'stores' ? 'stores' : 'products';

  const [exploreTab, setExploreTab] = useState<'products' | 'stores' | 'deals'>(urlTab as 'products' | 'stores');
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
  const [showMobileFilters, setShowMobileFilters] = useState<boolean>(false);
  
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

  // Handle Nearby Geolocation
  const toggleNearby = () => {
    if (nearbyOnly) {
      setNearbyOnly(false);
      setNearbySellerIds(new Set());
      showToast('Nearby filter deactivated (showing all regions)');
      return;
    }

    showToast('Locating sellers near you...');
    const loadNearby = (lat: number, lng: number) => {
      fetchLocalSellers(lat, lng).then((sellers) => {
        const idSet = new Set(sellers.map((s) => s.id));
        setNearbySellerIds(idSet);
        setNearbyOnly(true);
        showToast(`Found ${sellers.length} verified sellers near your location!`);
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
  };

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

  const activeFilterCount = (selectedCategory !== 'All' ? 1 : 0) + (nearbyOnly ? 1 : 0) + (priceMin || priceMax ? 1 : 0) + (regionFilter !== 'all' ? 1 : 0);

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-slate-700 animate-bounce">
          <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-purple-950 to-slate-900 text-white py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="w-full md:max-w-xl">
            <span className="inline-block bg-primary/20 text-primary-light text-xs font-bold px-3 py-1 rounded-full border border-primary/30 mb-3">
              B2B Marketplace & Retail Catalog
            </span>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight">Explore Wholesale & Retail Products</h1>
            <p className="text-slate-400 mt-2 text-xs sm:text-sm md:text-base">
              Discover verified Bangladesh suppliers, visit online seller stores, and negotiate bulk prices directly.
            </p>
          </div>

          {/* Tab Switcher: Products vs Stores vs Deals */}
          <div className="w-full md:w-auto max-w-full flex items-center gap-1.5 bg-white/10 backdrop-blur-md p-1.5 rounded-2xl border border-white/20 overflow-x-auto">
            <button
              onClick={() => setExploreTab('products')}
              className={`px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl text-[11px] sm:text-xs font-bold transition whitespace-nowrap flex-1 md:flex-initial text-center justify-center flex items-center ${
                exploreTab === 'products' ? 'bg-primary text-white shadow-lg' : 'text-slate-300 hover:text-white'
              }`}
            >
              🛍️ Products ({products.length})
            </button>
            <button
              onClick={() => setExploreTab('stores')}
              className={`px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl text-[11px] sm:text-xs font-bold transition whitespace-nowrap flex-1 md:flex-initial text-center justify-center flex items-center ${
                exploreTab === 'stores' ? 'bg-primary text-white shadow-lg' : 'text-slate-300 hover:text-white'
              }`}
            >
              🏪 Sellers & Stores
            </button>
            <button
              onClick={() => setExploreTab('deals')}
              className={`px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl text-[11px] sm:text-xs font-bold transition whitespace-nowrap flex-1 md:flex-initial text-center justify-center flex items-center ${
                exploreTab === 'deals' ? 'bg-primary text-white shadow-lg' : 'text-slate-300 hover:text-white'
              }`}
            >
              🎁 Bundles & Deals
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
        ) : exploreTab === 'products' ? (
          /* PRODUCTS TAB VIEW */
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            {/* Mobile Filter Toggle Button */}
            <div className="w-full lg:hidden flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
              <button
                type="button"
                onClick={() => setShowMobileFilters(!showMobileFilters)}
                className="flex items-center gap-2 text-xs font-bold text-slate-800"
              >
                <span>⚙️ Filters & Categories</span>
                {activeFilterCount > 0 && (
                  <span className="bg-primary text-white text-[10px] px-2 py-0.5 rounded-full">
                    {activeFilterCount} active
                  </span>
                )}
              </button>
              <span className="text-xs text-slate-500">{filteredProducts.length} items</span>
            </div>

            {/* Sidebar Filters — Responsive & Smooth Sticky */}
            <aside
              className={`w-full lg:w-64 space-y-5 shrink-0 ${
                showMobileFilters ? 'block' : 'hidden lg:block'
              } lg:sticky lg:top-20 max-h-[calc(100vh-6rem)] overflow-y-auto pr-1 pb-4`}
            >
              {/* Nearby Seller Quick Filter */}
              <div className={`p-4 rounded-2xl border transition-all ${
                nearbyOnly
                  ? 'bg-emerald-50 border-emerald-300 shadow-sm'
                  : 'bg-white border-slate-200 shadow-sm'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <span>📍</span> Sellers Near You
                  </span>
                  {nearbyOnly && (
                    <span className="text-[10px] bg-emerald-600 text-white font-bold px-2 py-0.5 rounded-full animate-pulse">
                      Active
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 mb-3 leading-relaxed">
                  Filter catalog by suppliers in your immediate local delivery radius.
                </p>
                <button
                  type="button"
                  onClick={toggleNearby}
                  className={`w-full py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                    nearbyOnly
                      ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm'
                      : 'bg-slate-900 text-white hover:bg-slate-800'
                  }`}
                >
                  {nearbyOnly ? '✓ Reset to All Bangladesh' : '⚡ Find Nearby Suppliers'}
                </button>
              </div>

              {/* Category Filter */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-sm font-bold text-slate-900">Categories</h3>
                  {selectedCategory !== 'All' && (
                    <button
                      onClick={() => setSelectedCategory('All')}
                      className="text-[10px] font-bold text-primary hover:underline"
                    >
                      Reset
                    </button>
                  )}
                </div>
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

              {/* Region Division Filter */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <h3 className="text-sm font-bold text-slate-900 mb-3">Division / Region</h3>
                <select
                  value={regionFilter}
                  onChange={(e) => setRegionFilter(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 outline-none focus:border-primary"
                >
                  <option value="all">All Bangladesh</option>
                  {REGIONS.slice(1).map((r) => (
                    <option key={r} value={r}>{r} Division</option>
                  ))}
                </select>
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

            {/* Product Grid & Top Search Bar */}
            <main className="flex-1 w-full">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                <div className="w-full sm:w-80 relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search wholesale & retail products..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-800 outline-none focus:border-primary"
                  />
                  <span className="absolute left-3 top-2.5 text-xs text-slate-400">🔍</span>
                </div>

                <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                  {/* Quick Nearby Button in toolbar */}
                  <button
                    type="button"
                    onClick={toggleNearby}
                    className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border ${
                      nearbyOnly
                        ? 'bg-emerald-100 border-emerald-300 text-emerald-800'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <span>📍</span> {nearbyOnly ? 'Nearby Active' : 'Find Nearby'}
                  </button>

                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 outline-none focus:border-primary"
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
                  <p className="text-xs mt-1">Try adjusting your filters, searching other keywords, or resetting the nearby toggle.</p>
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
                          product={product}
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
        ) : exploreTab === 'deals' ? (
          /* DEALS & BUNDLES TAB VIEW */
          <div className="space-y-12">
            <div className="bg-gradient-to-br from-purple-900 to-indigo-900 rounded-3xl p-8 sm:p-12 text-center shadow-xl border border-purple-700 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-10 blur-2xl">
                <div className="w-64 h-64 bg-white rounded-full"></div>
              </div>
              <div className="relative z-10">
                <span className="inline-block bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full mb-4 border border-white/30">
                  🎁 Exclusive Offers
                </span>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">Cross-Seller Value Bundles</h2>
                <p className="text-purple-200 max-w-2xl mx-auto mb-8 text-sm">
                  Save up to 15% by buying complementary items together. Verified sellers combine their products so you get maximum value with a single delivery.
                </p>
                <Link
                  href="/bundles"
                  className="inline-block bg-white text-purple-900 hover:bg-slate-100 font-bold px-8 py-4 rounded-xl shadow-lg transition-all hover:scale-105"
                >
                  View All Bundle Deals →
                </Link>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-end mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-slate-800">🔥 Daily Flash Deals</h2>
                  <p className="text-xs text-slate-500 mt-1">Lowest-priced products currently in stock</p>
                </div>
                <button
                  onClick={() => {
                    setExploreTab('products');
                    setSortBy('price-asc');
                  }}
                  className="text-xs font-bold text-primary hover:underline"
                >
                  View all low-price items
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {[...products]
                  .filter((p) => (p.quantity ?? 0) > 0)
                  .sort((a, b) => Number(a.price) - Number(b.price))
                  .slice(0, 8)
                  .map((product) => (
                    <div
                      key={product.id}
                      className="bg-white rounded-3xl border border-red-100 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col group relative"
                    >
                      <div className="absolute top-3 right-3 z-10 bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-md shadow-md animate-pulse">
                        HOT DEAL
                      </div>
                      <div
                        className="relative h-48 bg-slate-100 overflow-hidden cursor-pointer"
                        onClick={() => router.push(`/product/${product.id}`)}
                      >
                        <ProductImage
                          product={product}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                      <div className="p-4 flex flex-col flex-1">
                        <h3 className="font-bold text-slate-900 text-sm mb-1 line-clamp-1">{product.name}</h3>
                        <div className="flex items-baseline gap-1 mb-3">
                          <span className="text-xl font-black text-red-600">৳{(product.price || 0).toLocaleString()}</span>
                          <span className="text-[10px] text-slate-400">/{product.unit || 'unit'}</span>
                        </div>
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
                            showToast(`Added deal to cart!`);
                          }}
                          className="mt-auto w-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold py-2.5 rounded-xl transition-all shadow-sm"
                        >
                          Grab Deal
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        ) : null}
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
