import Link from "next/link";
import { fetchBundles } from "@/utils/api";

export default async function FeaturedBundles() {
  const bundles = await fetchBundles();
  return (
    <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Cross-Seller Bundles</h2>
          <p className="text-slate-500 mt-2">Buy combinations from different sellers for a massive discount.</p>
        </div>
        <button className="hidden sm:block text-primary font-semibold hover:text-primary-dark">View All</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {bundles.map((bundle: any) => (
          <Link href={`/product/${bundle.id}`} key={bundle.id} className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-xl transition-all group cursor-pointer block">
            <div className="relative h-48 overflow-hidden bg-slate-100">
              <img 
                src={bundle.image} 
                alt={bundle.title || bundle.name}
                className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-3 right-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-md">
                SAVE ৳{(bundle.originalPrice || bundle.price) - (bundle.bundlePrice || bundle.price)}
              </div>
            </div>
            <div className="p-5">
              <h3 className="font-bold text-lg text-slate-900 mb-1">{bundle.title || bundle.name}</h3>
              <p className="text-xs text-slate-500 font-medium mb-3">By {bundle.sellers || bundle.sellerNames} Sellers</p>
              <p className="text-sm text-slate-600 mb-4 line-clamp-2">{bundle.items} items included</p>
              
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xl font-bold text-slate-900">৳{bundle.price || bundle.bundlePrice}</span>
                  <span className="text-sm text-slate-400 line-through ml-2">৳{bundle.originalPrice}</span>
                </div>
                <button className="bg-slate-900 text-white p-2 rounded-full hover:bg-primary transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14"></path>
                    <path d="M12 5v14"></path>
                  </svg>
                </button>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
