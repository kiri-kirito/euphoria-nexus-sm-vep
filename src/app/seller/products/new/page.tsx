"use client";

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { createAdminClient } from '@/utils/supabase/server-admin'; // Only if needed on server, but we are in use client

import { useAuthStore } from '@/store/useAuthStore';

export default function NewProductPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    category: 'Electronics',
    description: '',
    price: '',
    comparePrice: '',
    quantity: '',
    moq: '1',
    status: 'Active',
    selectedImage: ''
  });
  
  const [imageSuggestions, setImageSuggestions] = useState<string[]>([]);
  
  // Debounced Image Auto-Suggest
  useEffect(() => {
    const handler = setTimeout(() => {
      suggestImages(formData.name);
    }, 800);
    return () => clearTimeout(handler);
  }, [formData.name]);

  const suggestImages = async (name: string) => {
    if (name.length < 3) return;
    const keywords = name.toLowerCase().replace(/[^a-z0-9 ]/g, '').split(' ').slice(0, 3).join(',');
    const suggestions = [
      `https://source.unsplash.com/400x400/?${encodeURIComponent(name)}`,
      `https://source.unsplash.com/400x400/?${encodeURIComponent(keywords)},product`,
      `https://source.unsplash.com/400x400/?${encodeURIComponent(name.split(' ')[0])}`,
    ];
    setImageSuggestions(suggestions);
  };

  const handleRefreshSuggestions = () => {
    suggestImages(formData.name + ' ' + Math.random().toString(36).substring(7));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert("You must be logged in to add a product.");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    
    // We are passing JSON string to JSONB column in Supabase
    // But supabase-js handles objects natively for JSONB columns, so we don't need JSON.stringify!
    // Actually wait, earlier the blueprint said it's JSON string. The DB migration says JSONB.
    // If it's JSONB, passing a raw array `[url]` is better. Let's try raw array.
    
    const { data, error } = await supabase.from('products').insert({
      seller_id: user.id,
      name: formData.name,
      description: formData.description,
      price: parseFloat(formData.price) || 0,
      quantity: parseInt(formData.quantity) || 0,
      category: formData.category,
      moq: parseInt(formData.moq) || 1,
      status: formData.status,
      images: [formData.selectedImage || `https://source.unsplash.com/400x400/?${encodeURIComponent(formData.name)}`],
    });
    
    setLoading(false);
    if (!error) {
      router.push('/seller/products?success=1');
    } else {
      console.error(error);
      alert("Error: " + error.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/seller/products" className="text-slate-500 hover:text-primary transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/></svg>
          </Link>
          <h1 className="text-2xl font-bold text-slate-900">Add New Product</h1>
        </div>
        <div className="flex items-center gap-4">
          <button 
            type="button"
            className="px-6 py-2.5 rounded-lg font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 transition-colors"
          >
            Save as Draft
          </button>
          <button 
            type="submit" 
            disabled={loading}
            className="px-6 py-2.5 rounded-lg font-medium text-white bg-primary hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-50"
          >
            {loading ? 'Publishing...' : 'Publish Product'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
            <h2 className="font-bold text-slate-900 text-lg">General Information</h2>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Product Name</label>
              <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all" placeholder="e.g. Wireless Noise-Cancelling Headphones" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
              <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all">
                <option>Electronics</option>
                <option>Fashion</option>
                <option>Furniture</option>
                <option>Food</option>
                <option>Sports</option>
                <option>Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
              <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} rows={5} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all" placeholder="Describe your product..."></textarea>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
            <h2 className="font-bold text-slate-900 text-lg">Pricing & Inventory</h2>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Price (৳)</label>
                <input required type="number" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all" placeholder="0.00" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Compare-at Price</label>
                <input type="number" value={formData.comparePrice} onChange={e => setFormData({...formData, comparePrice: e.target.value})} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all" placeholder="0.00" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Stock Qty</label>
                <input required type="number" value={formData.quantity} onChange={e => setFormData({...formData, quantity: e.target.value})} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all" placeholder="0" />
              </div>
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Minimum Order Quantity (MOQ)</label>
                <input required type="number" value={formData.moq} onChange={e => setFormData({...formData, moq: e.target.value})} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all" placeholder="1" />
            </div>
          </div>
        </div>

        <div className="col-span-1 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-slate-900 text-lg">Product Images</h2>
              {imageSuggestions.length > 0 && (
                <button type="button" onClick={handleRefreshSuggestions} className="text-xs font-semibold text-primary">Refresh Suggestions</button>
              )}
            </div>
            
            {imageSuggestions.length > 0 ? (
              <div className="grid grid-cols-2 gap-2 mb-4">
                {imageSuggestions.map((img, idx) => (
                  <img 
                    key={idx} 
                    src={img} 
                    alt="suggested" 
                    className={`w-full h-24 object-cover rounded-lg cursor-pointer border-2 ${formData.selectedImage === img ? 'border-primary' : 'border-transparent'}`}
                    onClick={() => setFormData({...formData, selectedImage: img})}
                  />
                ))}
              </div>
            ) : (
              <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 flex flex-col items-center justify-center text-center mb-4 cursor-pointer hover:bg-slate-50 transition-colors">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-3">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                </div>
                <p className="text-sm font-semibold text-slate-700">Type product name for suggestions</p>
                <p className="text-xs text-slate-500 mt-1">or drag & drop images</p>
              </div>
            )}
            
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Selected / Custom Image URL</label>
                <input type="text" value={formData.selectedImage} onChange={e => setFormData({...formData, selectedImage: e.target.value})} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all" placeholder="https://..." />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <h2 className="font-bold text-slate-900 text-lg mb-4">Status</h2>
            <div className="flex items-center gap-3 bg-slate-50 p-4 rounded-lg border border-slate-100">
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" checked={formData.status === 'Active'} onChange={e => setFormData({...formData, status: e.target.checked ? 'Active' : 'Draft'})} className="sr-only peer" />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                <span className="ml-3 text-sm font-medium text-slate-700">{formData.status} Product</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
