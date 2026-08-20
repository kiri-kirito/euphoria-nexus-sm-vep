"use client";

import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useAuthStore } from "@/store/useAuthStore";
import { resolveProductImage } from "@/utils/productImages";

const STATUS_STYLES: Record<string, string> = {
  Active: "bg-emerald-100 text-emerald-700",
  active: "bg-emerald-100 text-emerald-700",
  "Out of Stock": "bg-red-100 text-red-700",
  "out of stock": "bg-red-100 text-red-700",
  Draft: "bg-slate-100 text-slate-600",
  draft: "bg-slate-100 text-slate-600",
};

export default function SellerProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");

  const { userId, loading: userLoading } = useCurrentUser();
  const { user } = useAuthStore();
  const supabase = createClient();

  const loadProducts = useCallback(async () => {
    try {
      const activeSellerId = user?.id || userId;
      if (!activeSellerId && userLoading) return;

      let query = supabase.from('products').select('*');
      if (activeSellerId) {
        query = query.eq('seller_id', activeSellerId);
      } else {
        // Fallback for dev demo
        const { data: sellers } = await supabase.from('users').select('id').eq('role', 'seller').limit(1);
        if (sellers && sellers.length > 0) {
          query = query.eq('seller_id', sellers[0].id);
        } else {
          query = query.limit(30);
        }
      }
      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;
      
      const formatted = (data || []).map((p: any) => ({
        ...p,
        sku: `SKU-${String(p.id).substring(0, 4).toUpperCase()}`,
        stock: Number(p.quantity ?? 0),
        moq: Number(p.moq ?? 1),
        status: p.status || "active",
        img: resolveProductImage(p) || "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=80&h=80&fit=crop&q=80",
      }));
      setProducts(formatted);
    } catch (err) {
      console.error("Products load error:", err);
    } finally {
      setLoading(false);
    }
  }, [user?.id, userId, userLoading, supabase]);

  useEffect(() => {
    if (!userLoading) {
      loadProducts();
    }
  }, [userLoading, user?.id, userId, loadProducts]);

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this product?")) {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (!error) loadProducts();
    }
  };

  const categories = Array.from(new Set(products.map((p) => p.category).filter(Boolean)));

  const filteredProducts = products.filter((p) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchName = String(p.name || '').toLowerCase().includes(q);
      const matchSku = String(p.sku || '').toLowerCase().includes(q);
      if (!matchName && !matchSku) return false;
    }
    if (statusFilter !== "All") {
      if (statusFilter === "Out of Stock" && p.stock > 0) return false;
      if (statusFilter === "Active" && (p.stock <= 0 || String(p.status).toLowerCase() !== 'active')) return false;
      if (statusFilter === "Draft" && String(p.status).toLowerCase() !== 'draft') return false;
    }
    if (categoryFilter !== "All") {
      if (p.category !== categoryFilter) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Products</h1>
          <p className="text-slate-500 text-sm mt-1">{products.length} products listed in your store</p>
        </div>
        <Link
          href="/seller/products/new"
          className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-5 py-2.5 rounded-xl font-semibold text-sm shadow-lg shadow-primary/30 transition-all hover:scale-105"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Add Product
        </Link>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search products by name or SKU..."
            className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white text-slate-700"
        >
          <option value="All">All Status</option>
          <option value="Active">Active</option>
          <option value="Out of Stock">Out of Stock</option>
          <option value="Draft">Draft</option>
        </select>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white text-slate-700"
        >
          <option value="All">All Categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-x-auto">
        {loading || userLoading ? (
          <div className="p-8 text-center text-slate-500 animate-pulse font-medium">Loading your store catalog...</div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left text-xs font-bold text-slate-500 uppercase tracking-wider px-6 py-4">Product</th>
                <th className="text-left text-xs font-bold text-slate-500 uppercase tracking-wider px-4 py-4">SKU</th>
                <th className="text-left text-xs font-bold text-slate-500 uppercase tracking-wider px-4 py-4">Price</th>
                <th className="text-left text-xs font-bold text-slate-500 uppercase tracking-wider px-4 py-4">Available Stock</th>
                <th className="text-left text-xs font-bold text-slate-500 uppercase tracking-wider px-4 py-4">MOQ</th>
                <th className="text-left text-xs font-bold text-slate-500 uppercase tracking-wider px-4 py-4">Status</th>
                <th className="text-right text-xs font-bold text-slate-500 uppercase tracking-wider px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img src={product.img} alt={product.name} className="w-12 h-12 rounded-xl object-cover flex-shrink-0 border border-slate-100 bg-slate-50" />
                      <div>
                        <p className="font-semibold text-slate-900 text-sm">{product.name}</p>
                        <p className="text-xs text-slate-500">{product.category || 'General'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2 py-1 rounded">{product.sku}</span>
                  </td>
                  <td className="px-4 py-4">
                    <span className="font-bold text-slate-900 text-sm">৳{(product.price || 0).toLocaleString()}</span>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`text-sm font-bold ${product.stock === 0 ? "text-red-600 bg-red-50 px-2 py-0.5 rounded" : product.stock < 20 ? "text-amber-600 bg-amber-50 px-2 py-0.5 rounded" : "text-emerald-700 font-semibold"}`}>
                      {product.stock === 0 ? "Out of Stock" : `${product.stock} units`}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <span className="text-sm text-slate-600">{product.moq} units</span>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full capitalize ${product.stock === 0 ? STATUS_STYLES["Out of Stock"] : (STATUS_STYLES[product.status] || STATUS_STYLES["Active"])}`}>
                      {product.stock === 0 ? "Out of Stock" : product.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <Link href={`/seller/products/${product.id}/edit`} className="p-2 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors" title="Edit Product">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                      </Link>
                      <button onClick={() => handleDelete(product.id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Delete Product">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredProducts.length === 0 && (
                <tr><td colSpan={7} className="px-6 py-8 text-center text-slate-400 text-sm">No products matching your search or filters.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
