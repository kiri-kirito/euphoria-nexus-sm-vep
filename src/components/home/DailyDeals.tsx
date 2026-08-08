// Using standard img tag for mock data to bypass Next.js security policies
import { fetchProducts } from "@/utils/api";

export default async function DailyDeals() {
  const products = await fetchProducts();

  return (
    <section className="py-16 border-t border-slate-100">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">Daily Flash Deals</h2>
          <p className="text-slate-500 mt-2">Grab these bargains before they're gone!</p>
        </div>
        <button className="text-primary font-semibold hover:text-primary-dark flex items-center gap-1 transition-colors">
          View All Deals <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"></path></svg>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.slice(0, 4).map((product: any) => (
          <div key={product.id} className="group bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-xl transition-all duration-300">
            <div className="relative h-48 overflow-hidden bg-slate-100">
              <img 
                src={product.image} 
                alt={product.name}
                className="object-cover w-full h-full p-4 group-hover:scale-110 transition-transform duration-500"
              />
              {/* Badge for Bulk Negotiation */}
              <div className="absolute top-2 left-2 bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded">
                MOQ: {product.moq} for Bulk Price
              </div>
            </div>
            
            <div className="p-4">
              <p className="text-xs text-slate-500 mb-1">{product.seller || product.store}</p>
              <h3 className="font-semibold text-slate-900 text-sm mb-2 line-clamp-1">{product.name}</h3>
              <div className="flex items-center justify-between">
                <span className="font-bold text-lg text-slate-900">৳{product.price}</span>
                <button className="text-slate-400 hover:text-primary transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                    <line x1="3" y1="6" x2="21" y2="6"></line>
                    <path d="M16 10a4 4 0 0 1-8 0"></path>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
