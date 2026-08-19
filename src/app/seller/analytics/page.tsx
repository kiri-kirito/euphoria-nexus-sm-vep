"use client";

import { useEffect, useState, useMemo } from "react";
import { createClient } from "@/utils/supabase/client";
import { useCurrentUser } from "@/hooks/useCurrentUser";

type Timeframe = "7d" | "30d" | "90d" | "all";

interface OrderItemRecord {
  id: string;
  order_id: string;
  quantity: number;
  unit_price: number;
  products?: {
    name?: string;
    category?: string;
  };
  orders?: {
    id: string;
    status?: string;
    created_at: string;
    users?: {
      name?: string;
    };
  };
}

interface ChartBar {
  label: string;
  subLabel?: string;
  revenue: number;
  heightPercent: number;
}

const CATEGORY_COLORS = [
  "from-primary to-indigo-500",
  "from-emerald-500 to-teal-400",
  "from-amber-500 to-orange-400",
  "from-rose-500 to-pink-400",
  "from-sky-500 to-cyan-400",
  "from-violet-500 to-purple-400",
];

export default function AnalyticsPage() {
  const { userId, loading: userLoading } = useCurrentUser();
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState<Timeframe>("30d");
  const [allOrderItems, setAllOrderItems] = useState<OrderItemRecord[]>([]);

  useEffect(() => {
    if (userLoading) return;

    async function fetchData() {
      try {
        let sellerId = userId;
        if (!sellerId) {
          const { data: sellers } = await supabase.from("users").select("id").eq("role", "seller").limit(1);
          sellerId = sellers?.[0]?.id;
        }
        if (!sellerId) {
          setLoading(false);
          return;
        }

        const [{ data: orderData, error: orderErr }, { data: escrowData, error: escrowErr }] = await Promise.all([
          supabase
            .from("order_items")
            .select("id, order_id, quantity, unit_price, products(name, category), orders!inner(id, status, created_at, users!inner(name))")
            .eq("seller_id", sellerId),
          supabase
            .from("escrow")
            .select("id, amount, status, description, created_at, from_seller:users!from_seller_id(name)")
            .eq("to_seller_id", sellerId)
            .eq("status", "released")
        ]);

        if (orderErr) throw orderErr;

        const orderItems: OrderItemRecord[] = (orderData as any[]) || [];
        const escrowItems: OrderItemRecord[] = (escrowData || []).map((e: any) => ({
          id: e.id,
          order_id: `ESC-${e.id.slice(0, 8)}`,
          quantity: 1,
          unit_price: Number(e.amount),
          products: {
            name: e.description || "Stock Exchange Escrow",
            category: "Stock Exchange",
          },
          orders: {
            id: e.id,
            status: "Released",
            created_at: e.created_at,
            users: {
              name: (e.from_seller as any)?.name || "Partner Seller",
            },
          },
        }));

        const sortedItems = [...orderItems, ...escrowItems].sort((a, b) => {
          const timeA = new Date(a.orders?.created_at || 0).getTime();
          const timeB = new Date(b.orders?.created_at || 0).getTime();
          return timeB - timeA;
        });

        setAllOrderItems(sortedItems);
      } catch (error) {
        console.error("Analytics fetch error:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [userId, userLoading, supabase]);

  // Compute metrics, chart bars, categories, and transactions based on timeframe
  const analytics = useMemo(() => {
    const now = new Date();
    let currentCutoff: Date;
    let previousCutoff: Date;
    let chartIntervalsCount = 7;

    if (timeframe === "7d") {
      currentCutoff = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      previousCutoff = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
      chartIntervalsCount = 7;
    } else if (timeframe === "30d") {
      currentCutoff = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      previousCutoff = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
      chartIntervalsCount = 4;
    } else if (timeframe === "90d") {
      currentCutoff = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      previousCutoff = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);
      chartIntervalsCount = 3;
    } else {
      currentCutoff = new Date(0);
      previousCutoff = new Date(0);
      chartIntervalsCount = 6;
    }

    // Filter items for current and previous period
    const currentItems = allOrderItems.filter((item) => {
      const orderDate = new Date(item.orders?.created_at || 0);
      return orderDate >= currentCutoff;
    });

    const previousItems = allOrderItems.filter((item) => {
      const orderDate = new Date(item.orders?.created_at || 0);
      return orderDate >= previousCutoff && orderDate < currentCutoff;
    });

    // 1. Calculations for Current Period
    const currentRevenue = currentItems.reduce(
      (sum, item) => sum + Number(item.quantity || 1) * Number(item.unit_price || 0),
      0
    );

    const currentOrderIds = new Set(currentItems.map((i) => i.order_id));
    const currentOrdersCount = currentOrderIds.size;
    const currentAOV = currentOrdersCount > 0 ? currentRevenue / currentOrdersCount : 0;

    const cancelledCount = currentItems.filter((item) => {
      const st = String(item.orders?.status || "").toLowerCase();
      return st === "cancelled" || st === "refunded";
    }).length;
    const returnRate = currentItems.length > 0 ? (cancelledCount / currentItems.length) * 100 : 0;

    // 2. Calculations for Previous Period
    const prevRevenue = previousItems.reduce(
      (sum, item) => sum + Number(item.quantity || 1) * Number(item.unit_price || 0),
      0
    );
    const prevOrderIds = new Set(previousItems.map((i) => i.order_id));
    const prevOrdersCount = prevOrderIds.size;
    const prevAOV = prevOrdersCount > 0 ? prevRevenue / prevOrdersCount : 0;

    // 3. Trends calculation
    const calcTrend = (curr: number, prev: number) => {
      if (prev === 0) return { text: curr > 0 ? "+100%" : "0%", isPos: curr >= 0 };
      const diff = ((curr - prev) / prev) * 100;
      const isPos = diff >= 0;
      return { text: `${isPos ? "+" : ""}${diff.toFixed(1)}%`, isPos };
    };

    const revTrend = calcTrend(currentRevenue, prevRevenue);
    const ordTrend = calcTrend(currentOrdersCount, prevOrdersCount);
    const aovTrend = calcTrend(currentAOV, prevAOV);

    // 4. Generate Chart Bars
    let chartBars: ChartBar[] = [];

    if (timeframe === "7d") {
      // 7 Daily bars
      const dailyBuckets: { [key: string]: { label: string; subLabel: string; revenue: number } } = {};
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        const key = d.toISOString().split("T")[0];
        const dayName = d.toLocaleDateString("en-US", { weekday: "short" });
        const dateStr = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
        dailyBuckets[key] = { label: dayName, subLabel: dateStr, revenue: 0 };
      }

      currentItems.forEach((item) => {
        const key = new Date(item.orders?.created_at || 0).toISOString().split("T")[0];
        if (dailyBuckets[key]) {
          dailyBuckets[key].revenue += Number(item.quantity || 1) * Number(item.unit_price || 0);
        }
      });

      const maxRev = Math.max(...Object.values(dailyBuckets).map((b) => b.revenue), 1000);
      chartBars = Object.values(dailyBuckets).map((b) => ({
        label: b.label,
        subLabel: b.subLabel,
        revenue: b.revenue,
        heightPercent: Math.max(Math.round((b.revenue / maxRev) * 100), b.revenue > 0 ? 12 : 4),
      }));
    } else if (timeframe === "30d") {
      // 4 Weekly bars
      const weekBuckets = [
        { label: "Week 1", rangeDays: [22, 30], revenue: 0 },
        { label: "Week 2", rangeDays: [15, 21], revenue: 0 },
        { label: "Week 3", rangeDays: [8, 14], revenue: 0 },
        { label: "Week 4", rangeDays: [0, 7], revenue: 0 },
      ];

      currentItems.forEach((item) => {
        const diffDays = Math.floor((now.getTime() - new Date(item.orders?.created_at || 0).getTime()) / (24 * 60 * 60 * 1000));
        const rev = Number(item.quantity || 1) * Number(item.unit_price || 0);
        for (const w of weekBuckets) {
          if (diffDays >= w.rangeDays[0] && diffDays <= w.rangeDays[1]) {
            w.revenue += rev;
            break;
          }
        }
      });

      const maxRev = Math.max(...weekBuckets.map((b) => b.revenue), 1000);
      chartBars = weekBuckets.map((b) => ({
        label: b.label,
        revenue: b.revenue,
        heightPercent: Math.max(Math.round((b.revenue / maxRev) * 100), b.revenue > 0 ? 12 : 4),
      }));
    } else if (timeframe === "90d") {
      // 3 Monthly bars
      const monthNames = ["Month 1", "Month 2", "Month 3"];
      const monthBuckets = [
        { label: "60-90D", subLabel: "2 months ago", revenue: 0 },
        { label: "30-60D", subLabel: "Last month", revenue: 0 },
        { label: "0-30D", subLabel: "This month", revenue: 0 },
      ];

      currentItems.forEach((item) => {
        const diffDays = Math.floor((now.getTime() - new Date(item.orders?.created_at || 0).getTime()) / (24 * 60 * 60 * 1000));
        const rev = Number(item.quantity || 1) * Number(item.unit_price || 0);
        if (diffDays > 60) monthBuckets[0].revenue += rev;
        else if (diffDays > 30) monthBuckets[1].revenue += rev;
        else monthBuckets[2].revenue += rev;
      });

      const maxRev = Math.max(...monthBuckets.map((b) => b.revenue), 1000);
      chartBars = monthBuckets.map((b) => ({
        label: b.label,
        subLabel: b.subLabel,
        revenue: b.revenue,
        heightPercent: Math.max(Math.round((b.revenue / maxRev) * 100), b.revenue > 0 ? 12 : 4),
      }));
    } else {
      // All time - 6 intervals
      const buckets = [
        { label: "Period 1", revenue: 0 },
        { label: "Period 2", revenue: 0 },
        { label: "Period 3", revenue: 0 },
        { label: "Period 4", revenue: 0 },
        { label: "Period 5", revenue: 0 },
        { label: "Recent", revenue: 0 },
      ];

      const totalItems = allOrderItems.length;
      allOrderItems.forEach((item, idx) => {
        const bIdx = Math.min(Math.floor((idx / (totalItems || 1)) * 6), 5);
        buckets[5 - bIdx].revenue += Number(item.quantity || 1) * Number(item.unit_price || 0);
      });

      const maxRev = Math.max(...buckets.map((b) => b.revenue), 1000);
      chartBars = buckets.map((b) => ({
        label: b.label,
        revenue: b.revenue,
        heightPercent: Math.max(Math.round((b.revenue / maxRev) * 100), b.revenue > 0 ? 12 : 4),
      }));
    }

    // Max revenue on Y axis scale
    const maxChartRev = Math.max(...chartBars.map((b) => b.revenue), 10000);

    // 5. Category Breakdown
    const catMap = new Map<string, number>();
    const itemsForCategory = currentItems.length > 0 ? currentItems : allOrderItems;

    itemsForCategory.forEach((item) => {
      const cat = item.products?.category || "General";
      const rev = Number(item.quantity || 1) * Number(item.unit_price || 0);
      catMap.set(cat, (catMap.get(cat) || 0) + rev);
    });

    const totalCatRev = Array.from(catMap.values()).reduce((a, b) => a + b, 0) || 1;
    const sortedCategories = Array.from(catMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, rev], i) => ({
        name,
        revenue: rev,
        percent: Math.max(Math.round((rev / totalCatRev) * 100), 1),
        color: CATEGORY_COLORS[i % CATEGORY_COLORS.length],
      }));

    // 6. Recent Transactions in this timeframe
    const txItems = (currentItems.length > 0 ? currentItems : allOrderItems).slice(0, 8);
    const transactions = txItems.map((item) => ({
      id: `#ORD-${String(item.order_id).substring(0, 8).toUpperCase()}`,
      product: item.products?.name || "Wholesale Product",
      buyer: item.orders?.users?.name || "Customer",
      amount: `৳${(Number(item.quantity || 1) * Number(item.unit_price || 0)).toLocaleString()}`,
      date: item.orders?.created_at
        ? new Date(item.orders.created_at).toLocaleDateString("en-GB", { timeZone: "Asia/Dhaka" })
        : "Recent",
      status: item.orders?.status || "Processing",
    }));

    return {
      revenue: currentRevenue,
      ordersCount: currentOrdersCount,
      aov: currentAOV,
      returnRate,
      revTrend,
      ordTrend,
      aovTrend,
      chartBars,
      maxChartRev,
      categories: sortedCategories,
      transactions,
    };
  }, [allOrderItems, timeframe]);

  if (loading || userLoading) {
    return <div className="p-8 text-center text-slate-500 font-medium animate-pulse">Loading analytics data...</div>;
  }

  const formatK = (val: number) => {
    if (val >= 1000000) return `৳${(val / 1000000).toFixed(1)}M`;
    if (val >= 1000) return `৳${(val / 1000).toFixed(1)}K`;
    return `৳${val.toLocaleString()}`;
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Top Header & Interactive Timeframe Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Analytics Dashboard</h1>
          <p className="text-slate-500 text-sm mt-0.5">Real-time revenue, orders performance, and product category trends</p>
        </div>
        <div className="flex items-center bg-slate-200/70 p-1 rounded-xl shadow-inner border border-slate-200 self-start sm:self-auto">
          {(
            [
              { id: "7d", label: "7 Days" },
              { id: "30d", label: "30 Days" },
              { id: "90d", label: "90 Days" },
              { id: "all", label: "All Time" },
            ] as const
          ).map((t) => (
            <button
              key={t.id}
              onClick={() => setTimeframe(t.id)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                timeframe === t.id
                  ? "bg-white text-slate-900 shadow-sm scale-105"
                  : "text-slate-600 hover:text-slate-900 hover:bg-white/40"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* 4 Dynamic Key Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 hover:shadow-md transition-shadow">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Revenue</h3>
          <div className="mt-2 flex items-baseline justify-between gap-2">
            <span className="text-2xl font-black text-slate-900">৳{analytics.revenue.toLocaleString()}</span>
            <span
              className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                analytics.revTrend.isPos ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
              }`}
            >
              {analytics.revTrend.text}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">vs. previous period</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 hover:shadow-md transition-shadow">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Orders</h3>
          <div className="mt-2 flex items-baseline justify-between gap-2">
            <span className="text-2xl font-black text-slate-900">{analytics.ordersCount}</span>
            <span
              className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                analytics.ordTrend.isPos ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
              }`}
            >
              {analytics.ordTrend.text}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">Orders fulfilled</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 hover:shadow-md transition-shadow">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Avg Order Value</h3>
          <div className="mt-2 flex items-baseline justify-between gap-2">
            <span className="text-2xl font-black text-slate-900">৳{Math.round(analytics.aov).toLocaleString()}</span>
            <span
              className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                analytics.aovTrend.isPos ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
              }`}
            >
              {analytics.aovTrend.text}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">Revenue per order</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 hover:shadow-md transition-shadow">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Return / Cancel Rate</h3>
          <div className="mt-2 flex items-baseline justify-between gap-2">
            <span className="text-2xl font-black text-slate-900">{analytics.returnRate.toFixed(1)}%</span>
            <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
              {analytics.returnRate < 5 ? "Healthy" : "Attention"}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">Cancellation percentage</p>
        </div>
      </div>

      {/* Main Charts & Categories Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Dynamic Revenue Bar Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Revenue Breakdown</h2>
              <p className="text-xs text-slate-400">Periodic revenue distribution in selected timeframe</p>
            </div>
            <span className="text-xs font-bold bg-primary/10 text-primary px-3 py-1 rounded-full">
              Max: {formatK(analytics.maxChartRev)}
            </span>
          </div>

          <div className="h-64 flex items-end justify-between relative pt-8 pb-8 px-4 sm:px-6">
            {/* Horizontal Gridlines */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-8 pt-4">
              {[1, 0.75, 0.5, 0.25, 0].map((multiplier) => (
                <div key={multiplier} className="border-t border-slate-100 w-full relative flex items-center">
                  <span className="absolute -left-3 -translate-x-full text-[10px] font-semibold text-slate-400">
                    {formatK(analytics.maxChartRev * multiplier)}
                  </span>
                </div>
              ))}
            </div>

            {/* Bars */}
            <div className="relative z-10 w-full flex justify-around items-end h-full">
              {analytics.chartBars.map((bar, i) => (
                <div key={bar.label + i} className="flex flex-col items-center flex-1 max-w-[56px] group relative h-full justify-end">
                  {/* Tooltip on hover */}
                  <div className="absolute -top-9 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[11px] font-bold py-1 px-2.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-xl z-20">
                    ৳{bar.revenue.toLocaleString()}
                  </div>

                  {/* The bar element with dynamic height percentage */}
                  <div
                    className="w-full bg-gradient-to-t from-primary to-indigo-400 rounded-t-xl transition-all duration-500 group-hover:brightness-110 shadow-sm"
                    style={{ height: `${bar.heightPercent}%` }}
                  />

                  {/* Bar Label */}
                  <div className="text-center mt-2 absolute -bottom-7 w-20">
                    <p className="text-[11px] font-bold text-slate-600 truncate">{bar.label}</p>
                    {bar.subLabel && <p className="text-[9px] text-slate-400 truncate">{bar.subLabel}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Dynamic Top Categories Breakdown */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 mb-1">Top Categories</h2>
            <p className="text-xs text-slate-400 mb-6">Revenue share by catalog category</p>
          </div>

          <div className="space-y-5 flex-1 flex flex-col justify-center">
            {analytics.categories.length > 0 ? (
              analytics.categories.map((cat) => (
                <div key={cat.name}>
                  <div className="flex justify-between text-xs font-semibold mb-1.5">
                    <span className="text-slate-700">{cat.name}</span>
                    <span className="text-slate-900 font-bold">
                      {cat.percent}% <span className="text-slate-400 font-normal">({formatK(cat.revenue)})</span>
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                    <div
                      className={`bg-gradient-to-r ${cat.color} h-2.5 rounded-full transition-all duration-700`}
                      style={{ width: `${cat.percent}%` }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-slate-400 text-xs py-8">No category sales in this period.</div>
            )}
          </div>
        </div>
      </div>

      {/* Dynamic Recent Transactions Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Period Transactions</h2>
            <p className="text-xs text-slate-400">Orders placed during the selected timeframe</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs uppercase font-bold text-slate-400 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3.5">Order ID</th>
                <th className="px-6 py-3.5">Product</th>
                <th className="px-6 py-3.5">Buyer</th>
                <th className="px-6 py-3.5">Amount</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {analytics.transactions.map((tx, i) => (
                <tr key={tx.id + i} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-900 text-xs">{tx.id}</td>
                  <td className="px-6 py-4 font-medium text-slate-800 truncate max-w-xs">{tx.product}</td>
                  <td className="px-6 py-4 text-slate-600">{tx.buyer}</td>
                  <td className="px-6 py-4 font-bold text-slate-900">{tx.amount}</td>
                  <td className="px-6 py-4">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 capitalize">
                      {tx.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-500">{tx.date}</td>
                </tr>
              ))}
              {analytics.transactions.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-400 text-xs">
                    No transactions found for this timeframe.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
