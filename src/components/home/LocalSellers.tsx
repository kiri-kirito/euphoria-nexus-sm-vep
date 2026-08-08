import Link from "next/link";
import { fetchLocalSellers } from "@/utils/api";

export default async function LocalSellers() {
  const sellers = await fetchLocalSellers(23.8103, 90.4125); // Default Dhaka coordinates for now

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
          {sellers.map((seller: any) => (
            <Link 
              href={`/explore?search=${encodeURIComponent(seller.name)}`}
              key={seller.id} 
              className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-all duration-200 flex items-start gap-4 cursor-pointer group block"
            >
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xl shrink-0 overflow-hidden group-hover:scale-105 transition-transform">
                {seller.image ? <img src={seller.image} alt={seller.name} className="w-full h-full object-cover" /> : seller.name?.charAt(0) || 'S'}
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-slate-900 group-hover:text-primary transition-colors">{seller.name}</h3>
                <p className="text-xs text-slate-500 mb-2">{seller.category || 'Verified Local Seller'}</p>
                <div className="flex items-center gap-3 text-xs font-medium">
                  <span className="flex items-center gap-1 text-slate-600">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400">
                      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
                    </svg>
                    {seller.distance || '2.4 km near you'}
                  </span>
                  <span className="flex items-center gap-1 text-amber-500">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none" className="text-amber-400">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                    </svg>
                    {seller.rating || 4.8}
                  </span>
                </div>
                {seller.isSameDay !== false && (
                  <div className="mt-3 inline-block px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold rounded-full">
                    ⚡ SAME-DAY DELIVERY
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
