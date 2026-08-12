'use client';

import React, { useState, Suspense, useEffect, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import BulkDealModal from '@/components/products/BulkDealModal';
import { createClient } from '@/utils/supabase/client';
import { resolveProductImage } from '@/utils/productImages';
import { useCartStore } from '@/store/useCartStore';
import Link from 'next/link';

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  unit: string;
  minOrder: string;
  store: string;
  rating: number;
  reviews: number;
  inStock: boolean;
  image: string;
  description: string;
  specs: Record<string, string>;
  bulkTiers: { qty: string; price: number }[];
}

const PRODUCTS: Product[] = [
  {
    id: 'p1',
    name: 'Industrial High-Purity Copper Wire (99.99%)',
    category: 'Industrial & Metals',
    price: 450,
    unit: 'kg',
    minOrder: '500 kg',
    store: 'MetalCraft BD Ltd.',
    rating: 4.9,
    reviews: 128,
    inStock: true,
    image: 'https://images.unsplash.com/photo-1574345371569-b5413bc7cb9f?w=600&h=600&fit=crop&q=80',
    description: 'Electrolytic tough pitch copper wire for electrical wiring, motors, and high-performance manufacturing. Tested for high conductivity and durability.',
    specs: { Grade: 'ETP Grade A', Purity: '99.99%', Diameter: '1.2mm - 4.5mm', Standard: 'ASTM B3' },
    bulkTiers: [
      { qty: '500 - 1,000 kg', price: 450 },
      { qty: '1,001 - 5,000 kg', price: 420 },
      { qty: '5,000+ kg', price: 390 }
    ]
  },
  {
    id: 'p2',
    name: 'Sony WH-1000XM5 Wireless Headphones',
    category: 'Electronics & Gadgets',
    price: 32000,
    unit: 'unit',
    minOrder: '5 units',
    store: 'AudioWorld BD',
    rating: 4.8,
    reviews: 94,
    inStock: true,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=600&fit=crop&q=80',
    description: 'Industry-leading noise canceling headphones with dual processors and 8 microphones. Crystal clear hands-free calling and up to 30-hour battery life.',
    specs: { Brand: 'Sony', Connectivity: 'Bluetooth 5.2', Battery: '30 Hours', Warranty: '1 Year Official' },
    bulkTiers: [
      { qty: '5 - 10 units', price: 32000 },
      { qty: '11 - 25 units', price: 29800 },
      { qty: '25+ units', price: 28000 }
    ]
  },
  {
    id: 'p3',
    name: 'Structural Steel Beams (I-Beam Grade 50)',
    category: 'Industrial & Metals',
    price: 95000,
    unit: 'ton',
    minOrder: '2 tons',
    store: 'SteelCo Bangladesh',
    rating: 4.7,
    reviews: 62,
    inStock: true,
    image: 'https://images.unsplash.com/photo-1518349542013-176b6a03cc09?w=600&h=600&fit=crop&q=80',
    description: 'High-tensile structural steel I-beams for commercial building frames, bridges, and infrastructure projects.',
    specs: { Length: '12 Meters', Coating: 'Anti-corrosion primer', 'Yield Strength': '345 MPa' },
    bulkTiers: [
      { qty: '2 - 10 tons', price: 95000 },
      { qty: '11 - 50 tons', price: 91000 },
      { qty: '50+ tons', price: 86000 }
    ]
  },
  {
    id: 'p4',
    name: 'Ergonomic Mesh Executive Chair',
    category: 'Home & Furniture',
    price: 14500,
    unit: 'unit',
    minOrder: '5 units',
    store: 'WoodWorks Furniture',
    rating: 4.6,
    reviews: 43,
    inStock: true,
    image: 'https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=600&h=600&fit=crop&q=80',
    description: 'Premium breathable mesh office chair with 3D lumbar support, adjustable armrests, and 135-degree recline.',
    specs: { Material: 'Breathable Nylon Mesh', Base: 'Aluminum Heavy Duty', 'Max Weight': '150 kg' },
    bulkTiers: [
      { qty: '5 - 15 units', price: 14500 },
      { qty: '16 - 50 units', price: 13200 },
      { qty: '50+ units', price: 12000 }
    ]
  },
  {
    id: 'p5',
    name: 'Monocrystalline Solar Panels (550W)',
    category: 'Electronics & Gadgets',
    price: 18500,
    unit: 'panel',
    minOrder: '10 panels',
    store: 'GreenTech Energy Solutions',
    rating: 4.9,
    reviews: 110,
    inStock: true,
    image: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=600&h=600&fit=crop&q=80',
    description: 'High-efficiency PERC monocrystalline solar panels. Designed for industrial solar rooftops and off-grid solar farms.',
    specs: { Wattage: '550W', Efficiency: '21.3%', Glass: 'Tempered Anti-reflective', Warranty: '25 Years' },
    bulkTiers: [
      { qty: '10 - 50 panels', price: 18500 },
      { qty: '51 - 200 panels', price: 16800 },
      { qty: '200+ panels', price: 15500 }
    ]
  },
  {
    id: 'p6',
    name: 'Custom RGB Mechanical Keyboard Kit',
    category: 'Electronics & Gadgets',
    price: 4800,
    unit: 'unit',
    minOrder: '10 units',
    store: 'GamerZone BD',
    rating: 4.8,
    reviews: 76,
    inStock: true,
    image: 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=600&h=600&fit=crop&q=80',
    description: 'Hot-swappable gasket-mounted mechanical keyboard with south-facing RGB and sound dampening foam.',
    specs: { Layout: '75% Compact', Connection: 'Tri-Mode (BT/2.4G/Type-C)', Switches: 'Pre-lubed Linear' },
    bulkTiers: [
      { qty: '10 - 30 units', price: 4800 },
      { qty: '31 - 100 units', price: 4300 },
      { qty: '100+ units', price: 3900 }
    ]
  }
];

function ExploreContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get('category');
  const urlSearch = searchParams.get('search') || '';
  const urlNearby = searchParams.get('nearby') === '1';
  const urlSeller = searchParams.get('seller') || '';

  const categories = ['All', 'Electronics', 'Fashion', 'Home', 'Sports', 'Food', 'Industrial'];
  const matchedCategory = categories.find(c => c.toLowerCase() === initialCategory?.toLowerCase()) || 'All';

  const [selectedCategory, setSelectedCategory] = useState<string>(matchedCategory);
  const [searchQuery, setSearchQuery] = useState<string>(urlSearch);
  const [nearbyOnly, setNearbyOnly] = useState(urlNearby);
  const [sellerFilter, setSellerFilter] = useState(urlSeller);
  const [sortBy, setSortBy] = useState('popular');
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [isNegotiateOpen, setIsNegotiateOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();
  const addItem = useCartStore((s) => s.addItem);

  useEffect(() => {
    setSearchQuery(urlSearch);
    setNearbyOnly(urlNearby);
    setSellerFilter(urlSeller);
  }, [urlSearch, urlNearby, urlSeller]);

  const fetchExploreProducts = async (category?: string, search?: string, sellerId?: string) => {
    const supabase = createClient();
    try {
      let query = supabase
        .from('products')
        .select('*, users!seller_id(name, id)')
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
      if (error || !data) return [];

      return data.map((p: Record<string, unknown>) => ({
        ...p,
        seller: (p.users as { name?: string })?.name || 'Unknown Seller',
        store: (p.users as { name?: string })?.name || 'Unknown Seller',
        image: resolveProductImage(p as { name?: string; category?: string; images?: unknown }),
        minOrder: `${(p.moq as number) || 1} units`,
        unit: 'unit',
        inStock: (p.quantity as number) > 0,
      }));
    } catch {
      return [];
    }
  };

  useEffect(() => {
    const loadProducts = async () => {
      setIsLoading(true);
      const data = await fetchExploreProducts(selectedCategory, searchQuery, sellerFilter || undefined);
      setProducts(data);
      setIsLoading(false);
    };

    const debounceTimer = setTimeout(loadProducts, searchQuery ? 400 : 0);
    return () => clearTimeout(debounceTimer);
  }, [selectedCategory, searchQuery, sellerFilter]);

  const filteredProducts = useMemo(() => {
    let list = [...products];
    const min = priceMin ? Number(priceMin) : null;
    const max = priceMax ? Number(priceMax) : null;
    if (min != null) list = list.filter((p) => Number(p.price) >= min);
    if (max != null) list = list.filter((p) => Number(p.price) <= max);
    if (sortBy === 'price-asc') list.sort((a, b) => Number(a.price) - Number(b.price));
    if (sortBy === 'price-desc') list.sort((a, b) => Number(b.price) - Number(a.price));
    return list;
  }, [products, priceMin, priceMax, sortBy]);

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
              Discover verified Bangladesh suppliers, negotiate bulk prices directly, or place direct orders.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Filter Sidebar */}
          <aside className="w-full lg:w-64 flex-shrink-0">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm sticky top-24">
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100">
                <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                  <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                  </svg>
                  Filters
                </h3>
                <button 
                  onClick={() => { setSelectedCategory('All'); setSearchQuery(''); }} 
                  className="text-xs text-primary font-medium hover:underline"
                >
                  Reset
                </button>
              </div>

              {/* Category Filter */}
              <div className="mb-6">
                <h4 className="font-semibold text-slate-800 text-sm mb-3">Categories</h4>
                <div className="space-y-2">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`w-full text-left px-3 py-2 rounded-xl text-sm font-medium transition-all flex justify-between items-center ${
                        selectedCategory === cat 
                          ? 'bg-primary text-white shadow-md shadow-primary/20' 
                          : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <span>{cat}</span>
                      {selectedCategory === cat && (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range Filter */}
              <div className="mb-6 border-t border-slate-100 pt-5">
                <h4 className="font-semibold text-slate-800 text-sm mb-3">Price Range (৳)</h4>
                <div className="grid grid-cols-2 gap-2">
                  <input type="number" placeholder="Min" value={priceMin} onChange={(e) => setPriceMin(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs outline-none focus:border-primary" />
                  <input type="number" placeholder="Max" value={priceMax} onChange={(e) => setPriceMax(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs outline-none focus:border-primary" />
                </div>
              </div>

              <div className="mb-6 border-t border-slate-100 pt-5 space-y-3">
                <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                  <input type="checkbox" checked={nearbyOnly} onChange={(e) => setNearbyOnly(e.target.checked)} className="rounded" />
                  Nearby sellers only
                </label>
                <Link href="/bundles" className="block text-sm font-semibold text-primary hover:underline">
                  🎁 Find Bundle Deals
                </Link>
              </div>

              {/* Location Filter */}
              <div className="border-t border-slate-100 pt-5">
                <h4 className="font-semibold text-slate-800 text-sm mb-3">Supplier Zone</h4>
                <select className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-700 outline-none focus:border-primary">
                  <option>All Bangladesh</option>
                  <option>Dhaka Division</option>
                  <option>Chittagong Division</option>
                  <option>Sylhet Division</option>
                </select>
              </div>
            </div>
          </aside>

          {/* Product Grid Area */}
          <main className="flex-1">
            <div className="flex justify-between items-center mb-6">
              <p className="text-slate-600 text-sm font-medium">
                Showing <span className="font-bold text-slate-900">{filteredProducts.length}</span> verified items
              </p>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 font-medium">Sort by:</span>
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="bg-white border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg px-3 py-1.5 outline-none focus:border-primary">
                  <option value="popular">Most Popular</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                </select>
              </div>
            </div>

            {/* Product Grid */}
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm animate-pulse">
                    <div className="h-52 bg-slate-200"></div>
                    <div className="p-5 space-y-3">
                      <div className="h-3 bg-slate-200 rounded w-1/3"></div>
                      <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                      <div className="h-6 bg-slate-200 rounded w-1/2"></div>
                      <div className="h-3 bg-slate-200 rounded w-full"></div>
                      <div className="h-8 bg-slate-200 rounded w-full mt-4"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-20 text-slate-400">
                <svg className="w-16 h-16 mx-auto mb-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0H4" /></svg>
                <p className="font-semibold text-lg">No products found</p>
                <p className="text-sm mt-1">Try a different category or search term.</p>
              </div>
            ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col group cursor-pointer"
                  onClick={() => router.push(`/product/${product.id}`)}
                >

                  <div className="relative h-52 bg-slate-100 overflow-hidden">
                    <img 
                      src={product.image} 
                      alt={product.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-full border border-white/20">
                      MOQ: {product.minOrder}
                    </div>
                  </div>

                  <div className="p-5 flex flex-col flex-1">
                    <p className="text-xs font-semibold text-primary mb-1">{product.store || product.seller}</p>
                    <h3 className="font-bold text-slate-900 text-base mb-2 line-clamp-1 group-hover:text-primary transition-colors">
                      {product.name}
                    </h3>
                    
                    <div className="flex items-baseline gap-1 mb-3">
                      <span className="text-2xl font-extrabold text-slate-900">৳{(product.price || 0).toLocaleString()}</span>
                      <span className="text-xs text-slate-500">/{product.unit || 'unit'}</span>
                    </div>

                    <p className="text-xs text-slate-500 line-clamp-2 mb-4 leading-relaxed">
                      {product.description || 'No description available.'}
                    </p>

                    <div className="mt-auto pt-4 border-t border-slate-100 flex gap-2">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
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
                        <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 11h14l1 12H4L5 11z" />
                        </svg>
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            )} {/* end ternary */}
          </main>

        </div>
      </div>

      {/* Product Details Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden border border-slate-100 flex flex-col md:flex-row max-h-[90vh]">
            
            {/* Modal Image */}
            <div className="w-full md:w-1/2 bg-slate-100 relative min-h-[260px] md:min-h-full">
              <img 
                src={selectedProduct.image} 
                alt={selectedProduct.name} 
                className="w-full h-full object-cover"
              />
              <button 
                onClick={() => setSelectedProduct(null)}
                className="absolute top-4 left-4 bg-slate-900/70 text-white p-2 rounded-full md:hidden hover:bg-slate-900"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="w-full md:w-1/2 p-6 sm:p-8 flex flex-col overflow-y-auto">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <span className="text-xs font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-full">
                    {selectedProduct.category || 'Category'}
                  </span>
                  <p className="text-xs text-slate-500 font-semibold mt-2">{selectedProduct.store || selectedProduct.seller}</p>
                </div>
                <button 
                  onClick={() => setSelectedProduct(null)}
                  className="hidden md:flex text-slate-400 hover:text-slate-600 p-1.5 hover:bg-slate-100 rounded-full transition"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <h2 className="text-xl font-bold text-slate-900 mb-2">{selectedProduct.name}</h2>

              <div className="flex items-baseline gap-2 mb-4">
                <span className="text-3xl font-extrabold text-slate-900">৳{(selectedProduct.price || 0).toLocaleString()}</span>
                <span className="text-sm text-slate-500">/{selectedProduct.unit || 'unit'}</span>
                <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded ml-2">In Stock</span>
              </div>

              <p className="text-xs text-slate-600 mb-6 leading-relaxed">
                {selectedProduct.description || 'No description available.'}
              </p>

              {/* Bulk Pricing Tiers */}
              {selectedProduct.bulkTiers && (
                <div className="mb-6 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">Bulk Pricing Tiers</h4>
                  <div className="space-y-2">
                    {selectedProduct.bulkTiers.map((tier: any, idx: number) => (
                      <div key={idx} className="flex justify-between text-xs font-medium">
                        <span className="text-slate-600">{tier.qty}</span>
                        <span className="font-bold text-slate-900">৳{tier.price.toLocaleString()} /{selectedProduct.unit || 'unit'}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="mt-auto flex flex-col gap-3 pt-4 border-t border-slate-100">
                <button 
                  onClick={() => {
                    showToast(`Added ${selectedProduct.name} to Cart!`);
                    setSelectedProduct(null);
                  }}
                  className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3 rounded-xl transition shadow-md shadow-primary/20 flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 11h14l1 12H4L5 11z" />
                  </svg>
                  Add to Cart
                </button>
                
                <button 
                  onClick={() => {
                    setIsNegotiateOpen(true);
                  }}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded-xl transition shadow-sm flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  Negotiate Bulk Deal
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* Bulk Deal Negotiation / Modals */}
      <BulkDealModal
        isOpen={isNegotiateOpen}
        onClose={() => setIsNegotiateOpen(false)}
        productName={selectedProduct?.name || ''}
        productId={selectedProduct?.id}
      />
    </div>
  );
}

export default function ExplorePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center">Loading...</div>}>
      <ExploreContent />
    </Suspense>
  );
}
