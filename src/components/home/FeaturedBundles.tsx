import Link from "next/link";
import { bundleDetailPath } from "@/utils/bundles";
import { fetchBundles } from "@/utils/api";

export const revalidate = 0;
export const dynamic = 'force-dynamic';

export default async function FeaturedBundles() {
  const bundles = (await fetchBundles(3)).slice(0, 3);
  if (bundles.length === 0) return null;

  return (
    <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-end mb-8">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-purple-600 bg-purple-50 px-3 py-1 rounded-full border border-purple-200 mb-2 inline-block">
            🎁 Cross-Seller Collaborative Bundles
          </span>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Featured Value Bundles</h2>
          <p className="text-slate-500 mt-1">Multi-product bundles combined from verified sellers for maximum savings with single delivery.</p>
        </div>
        <Link href="/bundles" className="hidden sm:block text-primary font-semibold hover:text-primary-dark transition-colors">
          Explore All Deals →
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {bundles.map((bundle) => (
          <div
            key={bundle.id}
            className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group"
          >
            <div className="relative h-48 bg-slate-100 grid grid-cols-2 gap-0.5 p-0.5">
              <img src={bundle.item1.image} alt={bundle.item1.name} className="object-cover w-full h-full" />
              <img src={bundle.item2.image} alt={bundle.item2.name} className="object-cover w-full h-full" />
              <div className="absolute top-3 right-3 bg-red-500 text-white text-xs font-extrabold px-2.5 py-1 rounded-full shadow-md">
                SAVE ৳{bundle.savings.toLocaleString()}
              </div>
              <div className="absolute bottom-3 left-3 bg-slate-900/90 text-white text-[10px] font-bold px-2.5 py-1 rounded-full backdrop-blur-sm border border-white/20">
                🤝 {bundle.sellerCount} Seller{bundle.sellerCount > 1 ? 's' : ''} Combined
              </div>
            </div>

            <div className="p-6 flex flex-col flex-1">
              <h3 className="font-extrabold text-base text-slate-900 mb-2 line-clamp-1 group-hover:text-primary transition-colors">
                {bundle.title}
              </h3>
              <ul className="text-xs text-slate-600 space-y-1 mb-4">
                <li className="flex items-center gap-1 line-clamp-1">✓ {bundle.item1.name}</li>
                <li className="flex items-center gap-1 line-clamp-1">✓ {bundle.item2.name}</li>
              </ul>
              <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-2xl font-black text-slate-900">৳{bundle.bundlePrice.toLocaleString()}</span>
                  <span className="text-xs text-slate-400 line-through ml-2">৳{bundle.originalTotal.toLocaleString()}</span>
                </div>
                <Link
                  href={bundleDetailPath(bundle.productIds)}
                  className="bg-primary hover:bg-primary-dark text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-md shadow-primary/20"
                >
                  View Bundle
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
