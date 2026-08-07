const MOCK_SELLERS = [
  {
    id: "s1",
    name: "Tech Haven BD",
    category: "Electronics",
    distance: "2.1 km",
    rating: 4.8,
    isSameDay: true
  },
  {
    id: "s2",
    name: "Organic Foods Ltd",
    category: "Groceries",
    distance: "3.5 km",
    rating: 4.5,
    isSameDay: true
  },
  {
    id: "s3",
    name: "StyleZone",
    category: "Fashion",
    distance: "4.2 km",
    rating: 4.9,
    isSameDay: false
  }
];

export default function LocalSellers() {
  return (
    <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto mb-12">
      <div className="bg-gradient-to-r from-slate-100 to-slate-50 rounded-3xl p-6 sm:p-10 border border-slate-200">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
              <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Sellers Near You</h2>
            </div>
            <p className="text-slate-500">Discover local stores and get your items delivered within hours.</p>
          </div>
          <button className="px-6 py-2 bg-white border border-slate-300 rounded-full text-slate-700 font-medium hover:bg-slate-50 transition-colors shadow-sm">
            Update Location
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {MOCK_SELLERS.map((seller) => (
            <div key={seller.id} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xl shrink-0">
                {seller.name.charAt(0)}
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-slate-900">{seller.name}</h3>
                <p className="text-xs text-slate-500 mb-2">{seller.category}</p>
                <div className="flex items-center gap-3 text-xs font-medium">
                  <span className="flex items-center gap-1 text-slate-600">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400">
                      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
                    </svg>
                    {seller.distance}
                  </span>
                  <span className="flex items-center gap-1 text-amber-500">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none" className="text-amber-400">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                    </svg>
                    {seller.rating}
                  </span>
                </div>
                {seller.isSameDay && (
                  <div className="mt-3 inline-block px-2 py-1 bg-green-100 text-green-700 text-[10px] font-bold rounded">
                    SAME-DAY DELIVERY
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
