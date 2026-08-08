import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';

const getFirstImage = (images: any): string => {
  try {
    if (Array.isArray(images)) return images[0] || '';
    if (typeof images === 'string') {
      const parsed = JSON.parse(images);
      return Array.isArray(parsed) ? parsed[0] : '';
    }
    return '';
  } catch {
    return '';
  }
};

async function getProduct(id: string) {
  // Use client-side supabase (anon key) — public products are readable
  const supabase = createClient();
  const { data, error } = await supabase
    .from('products')
    .select('*, users!seller_id(name, email, phone)')
    .eq('id', id)
    .single();
    
  if (error) {
    console.error('Error fetching product:', error.message);
  }
  return data;
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await getProduct(id);

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center p-8 bg-white rounded-2xl shadow-sm border border-slate-200">
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Product Not Found</h2>
          <p className="text-slate-500 mb-6">The product you're looking for doesn't exist or has been removed.</p>
          <Link href="/explore" className="bg-primary text-white px-6 py-2 rounded-xl font-medium hover:bg-primary-dark transition-colors">
            Back to Explore
          </Link>
        </div>
      </div>
    );
  }

  const image = getFirstImage(product.images) || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=600&fit=crop&q=80';
  const sellerName = product.users?.name || 'Unknown Seller';
  const storeName = sellerName; // Fallback to user name since store is in a different table without direct FK

  return (
    <div className="bg-slate-50 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <Link href="/explore" className="text-primary hover:underline text-sm font-semibold mb-6 inline-flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
          Back to Products
        </Link>
        
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden mt-4">
          <div className="flex flex-col md:flex-row">
            {/* Product Image */}
            <div className="w-full md:w-1/2 bg-slate-100 p-8 flex items-center justify-center">
              <img src={image} alt={product.name} className="w-full max-w-md h-auto rounded-xl shadow-lg object-cover" />
            </div>

            {/* Product Details */}
            <div className="w-full md:w-1/2 p-8 lg:p-12">
              <span className="inline-block bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-full mb-4">
                {product.category || 'General'}
              </span>
              <h1 className="text-3xl font-extrabold text-slate-900 mb-2">{product.name}</h1>
              
              <div className="flex items-center gap-2 mb-6">
                <span className="text-sm text-slate-500 font-medium">Sold by:</span>
                <span className="text-sm font-bold text-slate-800">{storeName}</span>
              </div>

              <div className="flex items-end gap-3 mb-6 border-b border-slate-100 pb-6">
                <span className="text-4xl font-black text-slate-900">৳{product.price?.toLocaleString()}</span>
                <span className="text-sm text-slate-500 font-medium mb-1">/{product.unit || 'unit'}</span>
              </div>

              <div className="mb-6">
                <h3 className="text-sm font-bold text-slate-900 mb-2 uppercase tracking-wider">Description</h3>
                <p className="text-slate-600 leading-relaxed text-sm">
                  {product.description || 'No detailed description provided for this product.'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <span className="block text-xs font-semibold text-slate-500 mb-1">Stock Available</span>
                  <span className="font-bold text-emerald-600">{product.stock_quantity || 'In Stock'}</span>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <span className="block text-xs font-semibold text-slate-500 mb-1">Minimum Order</span>
                  <span className="font-bold text-slate-800">{product.min_order_quantity || 1} {product.unit || 'units'}</span>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <button className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-4 rounded-xl transition-all shadow-md shadow-primary/20 flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 11h14l1 12H4L5 11z" /></svg>
                  Add to Cart
                </button>
                <button className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2">
                  <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                  Negotiate Price
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
