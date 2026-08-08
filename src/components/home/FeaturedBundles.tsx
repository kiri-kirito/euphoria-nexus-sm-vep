import Link from "next/link";
import { fetchProducts } from "@/utils/api";

// Show Featured Products (previously FeaturedBundles — bundles table not in schema)
export default async function FeaturedBundles() {
  const products = await fetchProducts();
  // Take products 4-9 for this section (different from DailyDeals which shows 0-3)
  const featured = products.slice(4, 10);

  if (featured.length === 0) return null;

  return (
    <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Featured Products</h2>
          <p className="text-slate-500 mt-2">Top picks from our verified sellers across Bangladesh.</p>
        </div>
        <Link href="/explore" className="hidden sm:block text-primary font-semibold hover:text-primary-dark transition-colors">
          View All
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {featured.map((product: any) => (
          <Link
            href={`/product/${product.id}`}
            key={product.id}
            className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-xl transition-all group cursor-pointer block"
          >
            <div className="relative h-48 overflow-hidden bg-slate-100">
              <img
                src={product.image || 'https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=600&h=600&fit=crop&q=80'}
                alt={product.name}
                className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
              />
              {product.compare_price && product.compare_price > product.price && (
                <div className="absolute top-3 right-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-md">
                  SAVE ৳{(product.compare_price - product.price).toLocaleString()}
                </div>
              )}
              <div className="absolute top-3 left-3 bg-primary/90 text-white text-xs font-bold px-2 py-1 rounded-full">
                {product.category || 'General'}
              </div>
            </div>
            <div className="p-5">
              <p className="text-xs text-slate-500 font-medium mb-1">{product.seller || 'Unknown Seller'}</p>
              <h3 className="font-bold text-base text-slate-900 mb-2 line-clamp-2">{product.name}</h3>

              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xl font-bold text-slate-900">৳{Number(product.price).toLocaleString()}</span>
                  {product.compare_price && product.compare_price > product.price && (
                    <span className="text-sm text-slate-400 line-through ml-2">৳{Number(product.compare_price).toLocaleString()}</span>
                  )}
                </div>
                <div className="bg-slate-900 text-white p-2 rounded-full group-hover:bg-primary transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m9 18 6-6-6-6"></path>
                  </svg>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
