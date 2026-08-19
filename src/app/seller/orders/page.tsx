"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useCurrentUser } from "@/hooks/useCurrentUser";

const STATUS_STYLES: Record<string, string> = {
  Processing: "bg-amber-100 text-amber-700 border-amber-200",
  Shipped: "bg-blue-100 text-blue-700 border-blue-200",
  Delivered: "bg-emerald-100 text-emerald-700 border-emerald-200",
  Released: "bg-emerald-100 text-emerald-800 border-emerald-300 font-bold",
  Cancelled: "bg-red-100 text-red-700 border-red-200",
};

const STATUS_ACTIONS: Record<string, string> = {
  Processing: "Mark as Shipped",
  Shipped: "Mark as Delivered",
  Delivered: "",
  Released: "",
  Cancelled: "",
};

export default function SellerOrdersPage() {
  const { userId, loading: userLoading } = useCurrentUser();
  const supabase = createClient();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({ all: 0, processing: 0, shipped: 0, delivered: 0 });

  useEffect(() => {
    if (userLoading) return;
    
    async function fetchOrders() {
      try {
        let sellerId = userId;
        if (!sellerId) {
          const { data: sellers } = await supabase.from('users').select('id').eq('role', 'seller').limit(1);
          sellerId = sellers?.[0]?.id;
        }
        if (!sellerId) return;

        const [{ data: orderItems, error }, { data: escrowData }] = await Promise.all([
          supabase.from('order_items')
            .select('*, orders!inner(id, status, created_at, shipping_address, users!inner(name, email)), products(name)')
            .eq('seller_id', sellerId),
          supabase.from('escrow')
            .select('id, amount, status, description, created_at, from_seller:users!from_seller_id(name, address)')
            .eq('to_seller_id', sellerId)
            .eq('status', 'released')
        ]);

        if (error) throw error;
        
        const formattedOrders = (orderItems || []).map(r => {
          let loc = 'Dhaka';
          if (r.orders?.shipping_address) {
            const raw = r.orders.shipping_address;
            if (raw.startsWith('{')) {
              try { loc = JSON.parse(raw).city || 'Dhaka'; } catch { loc = raw; }
            } else {
              const parts = raw.split(',');
              loc = parts.length > 1 ? parts[1].trim() : raw;
            }
          }
          return {
            id: `#ORD-${r.order_id}`,
            product: r.products?.name || 'Unknown Product',
            buyer: r.orders?.users?.name || 'Guest',
            buyerLocation: loc,
            qty: r.quantity,
            total: r.quantity * r.unit_price,
            status: r.orders?.status || 'Processing',
            date: new Date(r.orders?.created_at || r.created_at).toLocaleDateString('en-GB', { timeZone: 'Asia/Dhaka' }),
            createdAt: r.orders?.created_at || r.created_at,
            negotiated: false
          };
        });

        const formattedEscrows = (escrowData || []).map(e => ({
          id: `#ESC-${e.id.slice(0, 8).toUpperCase()}`,
          product: e.description || 'Stock Exchange Escrow Settlement',
          buyer: (e.from_seller as any)?.name || 'Partner Seller',
          buyerLocation: (e.from_seller as any)?.address || 'Exchange Hub',
          qty: 1,
          total: Number(e.amount),
          status: 'Released',
          date: new Date(e.created_at).toLocaleDateString('en-GB', { timeZone: 'Asia/Dhaka' }),
          createdAt: e.created_at,
          negotiated: true,
        }));

        const combined = [...formattedOrders, ...formattedEscrows].sort((a: any, b: any) => {
          const timeA = new Date(a.createdAt || 0).getTime();
          const timeB = new Date(b.createdAt || 0).getTime();
          return timeB - timeA;
        });

        setOrders(combined);
        
        setSummary({
          all: combined.length,
          processing: combined.filter(o => ['processing', 'pending', 'placed'].includes(String(o.status).toLowerCase())).length,
          shipped: combined.filter(o => String(o.status).toLowerCase() === 'shipped').length,
          delivered: combined.filter(o => ['delivered', 'released'].includes(String(o.status).toLowerCase())).length,
        });
      } catch (err) {
        console.error("Orders fetch error:", err);
      } finally {
        setLoading(false);
      }
    }
    
    fetchOrders();
  }, [userId, userLoading]);

  if (loading || userLoading) {
    return <div className="p-8 text-center text-slate-500">Database connecting... Loading orders data.</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Orders</h1>
        <p className="text-slate-500 text-sm mt-1">Manage and track all incoming orders</p>
      </div>

      {/* Summary row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "All Orders", count: summary.all, color: "bg-slate-100 text-slate-700" },
          { label: "Processing", count: summary.processing, color: "bg-amber-100 text-amber-700" },
          { label: "Shipped", count: summary.shipped, color: "bg-blue-100 text-blue-700" },
          { label: "Delivered", count: summary.delivered, color: "bg-emerald-100 text-emerald-700" },
        ].map(s => (
          <div key={s.label} className={`rounded-xl px-4 py-3 ${s.color} flex items-center justify-between`}>
            <span className="text-sm font-semibold">{s.label}</span>
            <span className="text-xl font-extrabold">{s.count}</span>
          </div>
        ))}
      </div>

      {/* Orders List */}
      <div className="space-y-3">
        {orders.map((order, idx) => (
          <div key={idx} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 hover:shadow-md transition-shadow">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              {/* Order info */}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="font-bold text-slate-900">{order.id}</span>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${STATUS_STYLES[order.status] || STATUS_STYLES.Processing}`}>
                    {order.status}
                  </span>
                  {order.negotiated && (
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-purple-100 text-purple-700 border border-purple-200">
                      💬 Negotiated Price
                    </span>
                  )}
                </div>
                <p className="font-semibold text-slate-800">{order.product}</p>
                <div className="flex items-center gap-4 mt-1 text-sm text-slate-500">
                  <span className="flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                    {order.buyerLocation}
                  </span>
                  <span>{order.buyer}</span>
                  <span>Qty: {order.qty}</span>
                  <span>{order.date}</span>
                </div>
              </div>

              {/* Price & Actions */}
              <div className="flex sm:flex-col items-center sm:items-end gap-3">
                <p className="text-lg font-bold text-slate-900">৳{order.total.toLocaleString()}</p>
                <div className="flex gap-2">
                  {STATUS_ACTIONS[order.status] && (
                    <button className="px-4 py-2 bg-primary hover:bg-primary-dark text-white text-xs font-bold rounded-lg transition-colors">
                      {STATUS_ACTIONS[order.status]}
                    </button>
                  )}
                  <button className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors">
                    Details
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
        {orders.length === 0 && (
          <div className="p-8 text-center text-slate-500 bg-white rounded-2xl border border-slate-200">
            No orders found.
          </div>
        )}
      </div>
    </div>
  );
}
