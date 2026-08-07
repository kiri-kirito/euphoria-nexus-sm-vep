export default function FilterSidebar() {
  return (
    <aside className="w-full md:w-64 shrink-0 space-y-8">
      {/* Categories */}
      <div>
        <h3 className="text-lg font-bold text-slate-900 mb-4">Categories</h3>
        <ul className="space-y-3 text-sm font-medium text-slate-600">
          <li>
            <label className="flex items-center gap-2 cursor-pointer hover:text-primary">
              <input type="checkbox" className="rounded border-slate-300 text-primary focus:ring-primary" defaultChecked />
              <span>All Categories</span>
            </label>
          </li>
          <li>
            <label className="flex items-center gap-2 cursor-pointer hover:text-primary">
              <input type="checkbox" className="rounded border-slate-300 text-primary focus:ring-primary" />
              <span>Electronics</span>
            </label>
          </li>
          <li>
            <label className="flex items-center gap-2 cursor-pointer hover:text-primary">
              <input type="checkbox" className="rounded border-slate-300 text-primary focus:ring-primary" />
              <span>Fashion</span>
            </label>
          </li>
          <li>
            <label className="flex items-center gap-2 cursor-pointer hover:text-primary">
              <input type="checkbox" className="rounded border-slate-300 text-primary focus:ring-primary" />
              <span>Groceries</span>
            </label>
          </li>
        </ul>
      </div>

      <hr className="border-slate-200" />

      {/* Special Filters */}
      <div>
        <h3 className="text-lg font-bold text-slate-900 mb-4">Features</h3>
        <ul className="space-y-4 text-sm font-medium text-slate-600">
          <li>
            <label className="flex items-center gap-3 cursor-pointer p-3 border border-slate-200 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
              <input type="checkbox" className="rounded border-slate-300 text-primary focus:ring-primary w-4 h-4" />
              <div className="flex flex-col">
                <span className="text-slate-900 font-bold">Local Fast Delivery</span>
                <span className="text-xs text-slate-500 font-normal">Sellers near you (Same-Day)</span>
              </div>
            </label>
          </li>
          <li>
            <label className="flex items-center gap-3 cursor-pointer p-3 border border-slate-200 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
              <input type="checkbox" className="rounded border-slate-300 text-primary focus:ring-primary w-4 h-4" />
              <div className="flex flex-col">
                <span className="text-slate-900 font-bold">Bulk Negotiable</span>
                <span className="text-xs text-slate-500 font-normal">Items with MOQ enabled</span>
              </div>
            </label>
          </li>
        </ul>
      </div>

      <hr className="border-slate-200" />

      {/* Price Range */}
      <div>
        <h3 className="text-lg font-bold text-slate-900 mb-4">Price Range (৳)</h3>
        <div className="flex items-center gap-2">
          <input type="number" placeholder="Min" className="w-full px-3 py-2 border border-slate-300 rounded text-sm focus:outline-none focus:border-primary" />
          <span className="text-slate-400">-</span>
          <input type="number" placeholder="Max" className="w-full px-3 py-2 border border-slate-300 rounded text-sm focus:outline-none focus:border-primary" />
        </div>
      </div>
    </aside>
  );
}
