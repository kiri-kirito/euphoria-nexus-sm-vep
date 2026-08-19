"use client";

import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { resolveProductImage } from "@/utils/productImages";
import { useSupabaseRealtime } from "@/hooks/useSupabaseRealtime";

const STATUS_STYLES: Record<string, string> = {
  Processing: "bg-amber-100 text-amber-700",
  processing: "bg-amber-100 text-amber-700",
  Shipped: "bg-blue-100 text-blue-700",
  shipped: "bg-blue-100 text-blue-700",
  Delivered: "bg-emerald-100 text-emerald-700",
  delivered: "bg-emerald-100 text-emerald-700",
  Released: "bg-emerald-100 text-emerald-800 font-bold border border-emerald-300",
  released: "bg-emerald-100 text-emerald-800 font-bold border border-emerald-300",
  Cancelled: "bg-red-100 text-red-700",
  cancelled: "bg-red-100 text-red-700",
};

export default function SellerDashboardPage() {
  const { userId, loading: userLoading } = useCurrentUser();
  const supabase = createClient();
  
  const [stats, setStats] = useState([
    { label: "Total Revenue", value: "৳0", change: "Lifetime", up: true, icon: "💰" },
    { label: "Total Products", value: "0", change: "Active catalog", up: true, icon: "📦" },
    { label: "Active Orders", value: "0", change: "In fulfillment", up: false, icon: "🕐" },
    { label: "Pending Negotiations", value: "0", change: "Awaiting reply", up: null, icon: "💬" },
  ]);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = useCallback(async () => {
    if (userLoading) return;
    try {
      let sellerId = userId;
      if (!sellerId) {
        const { data: sellers } = await supabase.from('users').select('id').eq('role', 'seller').limit(1);
        sellerId = sellers?.[0]?.id;
      }
      
      if (!sellerId) return;

      // 1. Exact active products count
      const { count: productCount } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('seller_id', sellerId);

      // 2. Exact PENDING negotiations count (only active/unresolved negotiations)
      const { count: pendingNegotiationsCount } = await supabase
        .from('negotiations')
        .select('*', { count: 'exact', head: true })
        .eq('seller_id', sellerId)
        .in('status', ['open', 'pending', 'countered']);
      
      // 3. Orders and Released Escrow Revenue
      const [{ data: orderData }, { data: releasedEscrows }] = await Promise.all([
        supabase
          .from('order_items')
          .select('product_id, quantity, unit_price, orders!inner(id, status, created_at)')
          .eq('seller_id', sellerId),
        supabase
          .from('escrow')
          .select('id, amount, status, description, created_at, from_seller:users!from_seller_id(name)')
          .eq('to_seller_id', sellerId)
          .eq('status', 'released')
      ]);
        
      const ordersRevenue = orderData?.reduce((sum, item) => sum + (Number(item.quantity || 1) * Number(item.unit_price || 0)), 0) || 0;
      const escrowRevenue = (releasedEscrows || []).reduce((sum, e) => sum + Number(e.amount || 0), 0);
      const totalRevenue = ordersRevenue + escrowRevenue;
      
      const activeOrders = orderData?.filter(o => {
        const st = String((o.orders as any)?.status || '').toLowerCase();
        return st !== 'delivered' && st !== 'cancelled' && st !== 'refunded';
      }).length || 0;

      setStats([
        { 
          label: "Total Revenue", 
          value: `৳${totalRevenue.toLocaleString()}`, 
          change: escrowRevenue > 0 ? `Incl. ৳${escrowRevenue.toLocaleString()} escrow` : "Sales total", 
          up: true, 
          icon: "💰" 
        },
        { label: "Total Products", value: `${productCount || 0}`, change: "Active catalog", up: true, icon: "📦" },
        { label: "Active Orders", value: `${activeOrders}`, change: "In fulfillment", up: activeOrders > 0, icon: "🕐" },
        { label: "Pending Negotiations", value: `${pendingNegotiationsCount || 0}`, change: "Awaiting reply", up: null, icon: "💬" },
      ]);

      // 4. Recent Orders & Stock Exchange Escrow (sorted by created_at descending)
      const { data: recent } = await supabase
        .from('order_items')
        .select('*, products(name), orders!inner(id, status, created_at, users!inner(name))')
        .eq('seller_id', sellerId);
        
      const orderList = (recent || []).map((r: any) => ({
        id: `#ORD-${String(r.order_id).substring(0, 8).toUpperCase()}`,
        product: r.products?.name || 'Wholesale Product',
        buyer: r.orders?.users?.name || 'Customer',
        qty: r.quantity,
        total: r.quantity * r.unit_price,
        status: r.orders?.status || 'Processing',
        createdAt: r.orders?.created_at || r.created_at,
      }));

      const escrowList = (releasedEscrows || []).map((e: any) => ({
        id: `#ESC-${String(e.id).substring(0, 8).toUpperCase()}`,
        product: e.description || 'Stock Exchange Escrow',
        buyer: (e.from_seller as any)?.name || 'Partner Seller',
        qty: 1,
        total: Number(e.amount),
        status: 'Released',
        createdAt: e.created_at,
      }));

      const combinedRecent = [...orderList, ...escrowList].sort((a, b) => {
        const timeA = new Date(a.createdAt || 0).getTime();
        const timeB = new Date(b.createdAt || 0).getTime();
        return timeB - timeA;
      });

      setRecentOrders(combinedRecent.slice(0, 6));

      // 5. Top Products with real sales aggregation
      const productSalesMap = new Map<string, { qty: number; revenue: number }>();
      (orderData || []).forEach((item: any) => {
        if (item.product_id) {
          const prev = productSalesMap.get(item.product_id) || { qty: 0, revenue: 0 };
          productSalesMap.set(item.product_id, {
            qty: prev.qty + (Number(item.quantity) || 1),
            revenue: prev.revenue + (Number(item.quantity || 1) * Number(item.unit_price || 0)),
          });
        }
      });

      const topProductIds = Array.from(productSalesMap.entries())
        .sort((a, b) => b[1].revenue - a[1].revenue)
        .slice(0, 3)
        .map(([id]) => id);

      if (topProductIds.length > 0) {
        const { data: topProds } = await supabase
          .from('products')
          .select('id, name, price, images')
          .in('id', topProductIds);
          
        const formattedTop = (topProds || []).map(t => {
          const sales = productSalesMap.get(t.id) || { qty: 0, revenue: 0 };
          const img = resolveProductImage(t);
          return {
            name: t.name,
            sales: `${sales.qty} sold`,
            revenue: `৳${sales.revenue.toLocaleString()}`,
            img: img || "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=80&h=80&fit=crop&q=80",
          };
        });
        setTopProducts(formattedTop);
      } else {
        setTopProducts([]);
      }

    } catch (err) {
      console.error("Dashboard error:", err);
    } finally {
      setLoading(false);
    }
  }, [userId, userLoading, supabase]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  useSupabaseRealtime('escrow', fetchDashboard);
  useSupabaseRealtime('order_items', fetchDashboard);
  useSupabaseRealtime('products', fetchDashboard);

  if (loading || userLoading) {
    return <div className="p-8 text-center text-slate-500 font-medium animate-pulse">Loading dashboard overview...</div>;
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard Overview</h1>
          <p className="text-slate-500 text-sm mt-1">Here&apos;s what&apos;s happening with your store today.</p>
        </div>
        <Link
          href="/seller/products/new"
          className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-5 py-2.5 rounded-xl font-semibold text-sm shadow-lg shadow-primary/30 transition-all hover:scale-105"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Add New Product
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <span className="text-3xl">{stat.icon}</span>
              <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                stat.up === true ? "bg-emerald-100 text-emerald-700" :
                stat.up === false ? "bg-amber-100 text-amber-700" :
                "bg-slate-100 text-slate-600"
              }`}>
                {stat.change}
              </span>
            </div>
            <p className="text-slate-500 text-sm mb-1">{stat.label}</p>
            <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <div className="xl:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-slate-900">Recent Orders</h3>
            <Link href="/seller/orders" className="text-sm text-primary hover:underline font-medium">View all</Link>
          </div>
          <div className="divide-y divide-slate-100">
            {recentOrders.length > 0 ? recentOrders.map((order) => (
              <div key={order.id} className="px-6 py-4 flex items-center gap-4 hover:bg-slate-50 transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-slate-400">{order.id}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${STATUS_STYLES[order.status] || STATUS_STYLES.Processing}`}>
                      {order.status}
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-slate-900 truncate">{order.product}</p>
                  <p className="text-xs text-slate-500">{order.buyer} · Qty: {order.qty}</p>
                </div>
                <p className="text-sm font-bold text-slate-900 flex-shrink-0">৳{order.total.toLocaleString()}</p>
              </div>
            )) : (
              <div className="p-6 text-center text-slate-500">No recent orders found.</div>
            )}
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100">
            <h3 className="font-bold text-slate-900">Store Products</h3>
          </div>
          <div className="divide-y divide-slate-100">
            {topProducts.length > 0 ? topProducts.map((product, i) => (
              <div key={product.name + i} className="px-6 py-4 flex items-center gap-3">
                <span className="text-lg font-extrabold text-slate-200 w-5 flex-shrink-0">#{i + 1}</span>
                <img src={product.img} alt={product.name} className="w-10 h-10 rounded-lg object-cover flex-shrink-0 bg-slate-100" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900 truncate">{product.name}</p>
                  <p className="text-xs text-slate-500">{product.sales} sold</p>
                </div>
                <p className="text-xs font-bold text-primary flex-shrink-0">৳{Number(product.revenue || 0).toLocaleString()}</p>
              </div>
            )) : (
              <div className="p-6 text-center text-slate-500">Add products to see store catalog!</div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="px-6 py-4 border-t border-slate-100 space-y-2">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Quick Actions</p>
            <Link href="/seller/products/new" className="flex items-center gap-2 text-sm text-slate-700 hover:text-primary transition-colors py-1">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Add new product
            </Link>
            <Link href="/seller/orders" className="flex items-center gap-2 text-sm text-slate-700 hover:text-primary transition-colors py-1">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
              View orders
            </Link>
            <Link href="/seller/negotiations" className="flex items-center gap-2 text-sm text-slate-700 hover:text-primary transition-colors py-1">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              Respond to negotiations
            </Link>
            <Link href="/seller/bidding" className="flex items-center gap-2 text-sm text-slate-700 hover:text-primary transition-colors py-1">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 16V4M7 4L3 8M7 4L11 8M17 8V20M17 20L21 16M17 20L13 16"/></svg>
              Inter-Seller Stock Exchange
            </Link>
            <Link href="/seller/bundling" className="flex items-center gap-2 text-sm text-slate-700 hover:text-primary transition-colors py-1">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16.5 9.4 7.55 4.24a1.78 1.78 0 0 0-2.5 1.55v12.42a1.78 1.78 0 0 0 2.5 1.55L16.5 14.6a1.78 1.78 0 0 0 0-3.2z"/><path d="M21 12h-3"/></svg>
              Cross-Seller Bundles
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
