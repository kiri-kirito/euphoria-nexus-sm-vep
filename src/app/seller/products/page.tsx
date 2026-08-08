"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { fetchProducts, MOCK_PRODUCTS } from "@/utils/api";

const STATUS_STYLES: Record<string, string> = {
  Active: "bg-emerald-100 text-emerald-700",
  "Out of Stock": "bg-red-100 text-red-700",
  Draft: "bg-slate-100 text-slate-600",
};

export default function SellerProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProducts() {
      try {
        const data = await fetchProducts();
        // Just map them a bit to fit the UI if needed
        const formatted = data.map((p: any) => ({
          ...p,
          sku: p.sku || `SKU-${p.id.substring(0, 4)}`,
          stock: p.stock ?? p.quantity ?? 10,
          moq: p.moq ?? 5,
          status: p.status || "Active",
          img: p.image || p.img || "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=80&h=80&fit=crop&q=80",
        }));
        setProducts(formatted.length > 0 ? formatted : MOCK_PRODUCTS);
      } catch (err) {
        console.error(err);
        setProducts(MOCK_PRODUCTS);
      } finally {
        setLoading(false);
      }
    }
    loadProducts();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Products</h1>
          <p className="text-slate-500 text-sm mt-1">{products.length} products in your store</p>
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
            placeholder="Search products..."
            className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white"
          />
        </div>
        <select className="px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white text-slate-700">
          <option>All Status</option>
          <option>Active</option>
          <option>Out of Stock</option>
          <option>Draft</option>
        </select>
        <select className="px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white text-slate-700">
          <option>All Categories</option>
          <option>Electronics</option>
          <option>Fashion</option>
          <option>Furniture</option>
        </select>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-500">Loading products...</div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left text-xs font-bold text-slate-500 uppercase tracking-wider px-6 py-4">Product</th>
                <th className="text-left text-xs font-bold text-slate-500 uppercase tracking-wider px-4 py-4">SKU</th>
                <th className="text-left text-xs font-bold text-slate-500 uppercase tracking-wider px-4 py-4">Price</th>
                <th className="text-left text-xs font-bold text-slate-500 uppercase tracking-wider px-4 py-4">Stock</th>
                <th className="text-left text-xs font-bold text-slate-500 uppercase tracking-wider px-4 py-4">MOQ</th>
                <th className="text-left text-xs font-bold text-slate-500 uppercase tracking-wider px-4 py-4">Status</th>
                <th className="text-right text-xs font-bold text-slate-500 uppercase tracking-wider px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img src={product.img} alt={product.name} className="w-12 h-12 rounded-xl object-cover flex-shrink-0 border border-slate-100" />
                      <div>
                        <p className="font-semibold text-slate-900 text-sm">{product.name}</p>
                        <p className="text-xs text-slate-500">{product.category || 'Category'}</p>
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
                    <span className={`text-sm font-semibold ${product.stock === 0 ? "text-red-600" : product.stock < 20 ? "text-amber-600" : "text-slate-900"}`}>
                      {product.stock === 0 ? "Out" : product.stock}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <span className="text-sm text-slate-600">{product.moq} units</span>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${STATUS_STYLES[product.status] || STATUS_STYLES["Draft"]}`}>
                      {product.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-2 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                      </button>
                      <button className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

