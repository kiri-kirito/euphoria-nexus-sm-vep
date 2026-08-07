import Link from "next/link";

const STATS = [
  { label: "Total Revenue", value: "৳2,84,500", change: "+12.5%", up: true, icon: "💰" },
  { label: "Active Products", value: "24", change: "+3 this week", up: true, icon: "📦" },
  { label: "Pending Orders", value: "8", change: "2 urgent", up: false, icon: "🕐" },
  { label: "Negotiations", value: "3", change: "Awaiting reply", up: null, icon: "💬" },
];

const RECENT_ORDERS = [
  { id: "#ORD-1042", product: "Logitech MX Master 3S", buyer: "Rahim Store", qty: 10, total: 95000, status: "Processing" },
  { id: "#ORD-1041", product: "Sony WH-1000XM5", qty: 5, buyer: "Dhaka Gadgets", total: 160000, status: "Shipped" },
  { id: "#ORD-1040", product: "Mechanical Keycaps", qty: 30, buyer: "GamerZone", total: 75000, status: "Delivered" },
  { id: "#ORD-1039", product: "4K Web Camera", qty: 8, buyer: "Office Mart", total: 68000, status: "Delivered" },
];

const STATUS_STYLES: Record<string, string> = {
  Processing: "bg-amber-100 text-amber-700",
  Shipped: "bg-blue-100 text-blue-700",
  Delivered: "bg-emerald-100 text-emerald-700",
  Cancelled: "bg-red-100 text-red-700",
};

const TOP_PRODUCTS = [
  { name: "Logitech MX Master 3S", sales: 48, revenue: 456000, img: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=80&h=80&fit=crop&q=80" },
  { name: "Sony WH-1000XM5", sales: 31, revenue: 992000, img: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=80&h=80&fit=crop&q=80" },
  { name: "Mechanical Keycaps", sales: 112, revenue: 280000, img: "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=80&h=80&fit=crop&q=80" },
];

export default function SellerDashboardPage() {
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
        {STATS.map((stat) => (
          <div key={stat.label} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <span className="text-3xl">{stat.icon}</span>
              <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                stat.up === true ? "bg-emerald-100 text-emerald-700" :
                stat.up === false ? "bg-red-100 text-red-700" :
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
            {RECENT_ORDERS.map((order) => (
              <div key={order.id} className="px-6 py-4 flex items-center gap-4 hover:bg-slate-50 transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-slate-400">{order.id}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${STATUS_STYLES[order.status]}`}>
                      {order.status}
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-slate-900 truncate">{order.product}</p>
                  <p className="text-xs text-slate-500">{order.buyer} · Qty: {order.qty}</p>
                </div>
                <p className="text-sm font-bold text-slate-900 flex-shrink-0">৳{order.total.toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100">
            <h3 className="font-bold text-slate-900">Top Products</h3>
          </div>
          <div className="divide-y divide-slate-100">
            {TOP_PRODUCTS.map((product, i) => (
              <div key={product.name} className="px-6 py-4 flex items-center gap-3">
                <span className="text-lg font-extrabold text-slate-200 w-5 flex-shrink-0">#{i + 1}</span>
                <img src={product.img} alt={product.name} className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900 truncate">{product.name}</p>
                  <p className="text-xs text-slate-500">{product.sales} sold</p>
                </div>
                <p className="text-xs font-bold text-primary flex-shrink-0">৳{(product.revenue / 1000).toFixed(0)}K</p>
              </div>
            ))}
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
              View pending orders
            </Link>
            <Link href="/seller/negotiations" className="flex items-center gap-2 text-sm text-slate-700 hover:text-primary transition-colors py-1">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              Respond to negotiations
              <span className="ml-auto bg-primary text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">3</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
