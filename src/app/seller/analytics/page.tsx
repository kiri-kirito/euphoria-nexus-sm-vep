"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useCurrentUser } from "@/hooks/useCurrentUser";

export default function AnalyticsPage() {
  const { userId, loading: userLoading } = useCurrentUser();
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState([
    { label: "Total Revenue", value: "৳0", trend: "+0%", isPositive: true },
    { label: "Orders", value: "0", trend: "+0%", isPositive: true },
    { label: "Avg Order Value", value: "৳0", trend: "0%", isPositive: true },
    { label: "Return Rate", value: "0%", trend: "0%", isPositive: true },
  ]);
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);

  useEffect(() => {
    if (userLoading) return;
    
    async function fetchData() {
      try {
        let sellerId = userId;
        if (!sellerId) {
          const { data: sellers } = await supabase.from('users').select('id').eq('role', 'seller').limit(1);
          sellerId = sellers?.[0]?.id;
        }
        if (!sellerId) return;

        const { data: orderData } = await supabase.from('order_items')
          .select('quantity, unit_price, orders!inner(id, status)')
          .eq('seller_id', sellerId);
          
        const totalOrders = orderData?.length || 0;
        const revenue = orderData?.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0) || 0;
        const avg = totalOrders > 0 ? (revenue / totalOrders) : 0;
        const returns = orderData?.filter(o => (o.orders as any)?.status === 'Cancelled').length || 0;
        const returnRate = totalOrders > 0 ? ((returns / totalOrders) * 100).toFixed(1) : 0;

        setStats([
          { label: "Total Revenue", value: `৳${revenue.toLocaleString()}`, trend: "+12.5%", isPositive: true },
          { label: "Orders", value: `${totalOrders}`, trend: "+5.2%", isPositive: true },
          { label: "Avg Order Value", value: `৳${avg.toFixed(0)}`, trend: "+2.1%", isPositive: true },
          { label: "Return Rate", value: `${returnRate}%`, trend: "-0.5%", isPositive: true },
        ]);

        const { data: recent } = await supabase.from('order_items')
          .select('*, products(name), orders!inner(id, created_at, users!inner(name))')
          .eq('seller_id', sellerId)
          .order('id', { ascending: false })
          .limit(5);

        if (recent) {
          setRecentTransactions(recent.map(r => ({
            id: `#ORD-${r.order_id}`,
            product: r.products?.name || 'Unknown',
            buyer: r.orders?.users?.name || 'Guest',
            amount: `৳${(r.quantity * r.unit_price).toLocaleString()}`,
            date: new Date(r.orders.created_at).toLocaleDateString()
          })));
        }

      } catch (error) {
        console.error("Analytics fetch error:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [userId, userLoading]);

  if (loading || userLoading) {
    return <div className="p-8 text-center text-slate-500">Database connecting... Loading analytics data.</div>;
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Analytics Dashboard</h1>
        <div className="flex items-center bg-slate-100 rounded-lg p-1">
          <button className="px-4 py-1.5 rounded-md text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">7D</button>
          <button className="px-4 py-1.5 rounded-md text-sm font-medium bg-white text-slate-900 shadow-sm transition-colors">30D</button>
          <button className="px-4 py-1.5 rounded-md text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">90D</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            <h3 className="text-sm font-medium text-slate-500">{stat.label}</h3>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900">{stat.value}</span>
              <span className={`text-xs font-semibold px-1.5 py-0.5 rounded-md ${
                stat.isPositive ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
              }`}>
                {stat.trend}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <h2 className="text-lg font-bold text-slate-900 mb-6">Revenue This Month</h2>
          <div className="h-64 flex items-end gap-4 sm:gap-8 justify-between relative">
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none border-b border-slate-100 pb-8">
              {[100, 75, 50, 25].map((val) => (
                <div key={val} className="border-t border-slate-100 w-full flex-1 relative">
                  <span className="absolute -left-2 -translate-x-full -top-3 text-xs text-slate-400">৳{val}K</span>
                </div>
              ))}
            </div>
            
            <div className="relative z-10 w-full flex justify-around items-end h-full pb-8">
              <div className="flex flex-col items-center w-12 sm:w-16 group">
                <div className="w-full h-[115px] bg-gradient-to-t from-primary/80 to-indigo-400 rounded-t-lg transition-all group-hover:opacity-80"></div>
                <span className="text-xs font-medium text-slate-500 mt-3 absolute bottom-0">Week 1</span>
              </div>
              <div className="flex flex-col items-center w-12 sm:w-16 group">
                <div className="w-full h-[184px] bg-gradient-to-t from-primary/80 to-indigo-400 rounded-t-lg transition-all group-hover:opacity-80"></div>
                <span className="text-xs font-medium text-slate-500 mt-3 absolute bottom-0">Week 2</span>
              </div>
              <div className="flex flex-col items-center w-12 sm:w-16 group">
                <div className="w-full h-[227px] bg-gradient-to-t from-primary/80 to-indigo-400 rounded-t-lg transition-all group-hover:opacity-80"></div>
                <span className="text-xs font-medium text-slate-500 mt-3 absolute bottom-0">Week 3</span>
              </div>
              <div className="flex flex-col items-center w-12 sm:w-16 group">
                <div className="w-full h-[199px] bg-gradient-to-t from-primary/80 to-indigo-400 rounded-t-lg transition-all group-hover:opacity-80 relative">
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs font-bold py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity">৳78K</div>
                </div>
                <span className="text-xs font-medium text-slate-500 mt-3 absolute bottom-0">Week 4</span>
              </div>
            </div>
          </div>
        </div>

        {/* Top Categories */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <h2 className="text-lg font-bold text-slate-900 mb-6">Top Categories</h2>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between text-sm font-medium mb-2">
                <span className="text-slate-700">Electronics</span>
                <span className="text-slate-900 font-bold">65%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5">
                <div className="bg-primary h-2.5 rounded-full" style={{ width: '65%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm font-medium mb-2">
                <span className="text-slate-700">Fashion</span>
                <span className="text-slate-900 font-bold">20%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5">
                <div className="bg-indigo-400 h-2.5 rounded-full" style={{ width: '20%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm font-medium mb-2">
                <span className="text-slate-700">Accessories</span>
                <span className="text-slate-900 font-bold">15%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5">
                <div className="bg-sky-400 h-2.5 rounded-full" style={{ width: '15%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">Recent Transactions</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Order ID</th>
                <th className="px-6 py-4">Product</th>
                <th className="px-6 py-4">Buyer</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentTransactions.map((tx, i) => (
                <tr key={i} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-900">{tx.id}</td>
                  <td className="px-6 py-4">{tx.product}</td>
                  <td className="px-6 py-4">{tx.buyer}</td>
                  <td className="px-6 py-4 font-bold text-slate-900">{tx.amount}</td>
                  <td className="px-6 py-4 text-slate-500">{tx.date}</td>
                </tr>
              ))}
              {recentTransactions.length === 0 && (
                <tr><td colSpan={5} className="px-6 py-4 text-center">No recent transactions.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
