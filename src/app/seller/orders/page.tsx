const MOCK_ORDERS = [
  { id: "#ORD-1042", product: "Logitech MX Master 3S", buyer: "Rahim Store", buyerLocation: "Dhaka", qty: 10, total: 95000, status: "Processing", date: "Aug 7, 2026", negotiated: true },
  { id: "#ORD-1041", product: "Sony WH-1000XM5", buyer: "Dhaka Gadgets", buyerLocation: "Chittagong", qty: 5, total: 160000, status: "Shipped", date: "Aug 6, 2026", negotiated: false },
  { id: "#ORD-1040", product: "Mechanical Keycaps", buyer: "GamerZone", buyerLocation: "Sylhet", qty: 30, total: 75000, status: "Delivered", date: "Aug 5, 2026", negotiated: true },
  { id: "#ORD-1039", product: "4K Web Camera", buyer: "Office Mart", buyerLocation: "Dhaka", qty: 8, total: 68000, status: "Delivered", date: "Aug 4, 2026", negotiated: false },
  { id: "#ORD-1038", product: "RGB Gaming Mouse Pad XL", buyer: "PCWave", buyerLocation: "Rajshahi", qty: 20, total: 36000, status: "Cancelled", date: "Aug 3, 2026", negotiated: false },
];

const STATUS_STYLES: Record<string, string> = {
  Processing: "bg-amber-100 text-amber-700 border-amber-200",
  Shipped: "bg-blue-100 text-blue-700 border-blue-200",
  Delivered: "bg-emerald-100 text-emerald-700 border-emerald-200",
  Cancelled: "bg-red-100 text-red-700 border-red-200",
};

const STATUS_ACTIONS: Record<string, string> = {
  Processing: "Mark as Shipped",
  Shipped: "Mark as Delivered",
  Delivered: "",
  Cancelled: "",
};

export default function SellerOrdersPage() {
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
          { label: "All Orders", count: 5, color: "bg-slate-100 text-slate-700" },
          { label: "Processing", count: 1, color: "bg-amber-100 text-amber-700" },
          { label: "Shipped", count: 1, color: "bg-blue-100 text-blue-700" },
          { label: "Delivered", count: 2, color: "bg-emerald-100 text-emerald-700" },
        ].map(s => (
          <div key={s.label} className={`rounded-xl px-4 py-3 ${s.color} flex items-center justify-between`}>
            <span className="text-sm font-semibold">{s.label}</span>
            <span className="text-xl font-extrabold">{s.count}</span>
          </div>
        ))}
      </div>

      {/* Orders List */}
      <div className="space-y-3">
        {MOCK_ORDERS.map((order) => (
          <div key={order.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 hover:shadow-md transition-shadow">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              {/* Order info */}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="font-bold text-slate-900">{order.id}</span>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${STATUS_STYLES[order.status]}`}>
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
      </div>
    </div>
  );
}
