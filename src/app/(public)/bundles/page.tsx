import Link from "next/link";
import { bundleDetailPath } from "@/utils/bundles";
import { fetchBundles } from "@/utils/api";

export const revalidate = 0;
export const dynamic = 'force-dynamic';

export default async function BundlesPage() {
  const bundles = await fetchBundles(24);

  return (
    <div className="bg-slate-50 min-h-screen pb-12">
      <div className="bg-gradient-to-r from-purple-900 via-slate-900 to-purple-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <span className="inline-block bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full border border-white/30 mb-3">
            🎁 Exclusive Deals
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Cross-Seller Value Bundles</h1>
          <p className="text-purple-200 mt-2 max-w-2xl mx-auto text-sm sm:text-base">
            Save up to 15% by buying complementary items together. We handle the logistics so you get a single delivery.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {bundles.length === 0 ? (
          <p className="text-center text-slate-500 py-16">No bundle deals available yet. Check back soon!</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bundles.map((bundle) => (
              <div key={bundle.id} className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-xl transition-all flex flex-col">
                <div className="relative h-48 bg-slate-100 grid grid-cols-2 gap-0.5 p-0.5">
                  <img src={bundle.item1.image} alt={bundle.item1.name} className="object-cover w-full h-full" />
                  <img src={bundle.item2.image} alt={bundle.item2.name} className="object-cover w-full h-full" />
                  <div className="absolute top-3 right-3 bg-red-500 text-white text-xs font-extrabold px-2.5 py-1 rounded-full shadow-md">
                    SAVE ৳{bundle.savings.toLocaleString()}
                  </div>
                </div>
                <div className="p-6 flex flex-col flex-1">
                  <h3 className="font-extrabold text-base text-slate-900 mb-2">{bundle.title}</h3>
                  <ul className="text-xs text-slate-600 space-y-1 mb-4">
                    <li>✓ {bundle.item1.name}</li>
                    <li>✓ {bundle.item2.name}</li>
                  </ul>
                  <div className="mt-auto flex items-center justify-between pt-4 border-t">
                    <div>
                      <span className="text-2xl font-black">৳{bundle.bundlePrice.toLocaleString()}</span>
                      <span className="text-xs text-slate-400 line-through ml-2">৳{bundle.originalTotal.toLocaleString()}</span>
                    </div>
                    <Link href={bundleDetailPath(bundle.productIds)} className="bg-primary text-white text-xs font-bold px-4 py-2.5 rounded-xl">
                      View Bundle
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
