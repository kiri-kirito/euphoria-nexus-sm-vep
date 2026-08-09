import Link from "next/link";
import { fetchProducts } from "@/utils/api";

const getFirstImage = (images: any): string => {
  try {
    if (Array.isArray(images)) return images[0] || '';
    if (typeof images === 'string') {
      const parsed = JSON.parse(images);
      return Array.isArray(parsed) ? parsed[0] : '';
    }
    return '';
  } catch {
    return '';
  }
};

export const revalidate = 0;

export default async function BundlesPage() {
  const products = await fetchProducts();
  
  // Create combinations for bundles
  const bundlePairs = [];
  for (let i = 0; i < products.length - 1; i += 2) {
    const p1 = products[i];
    const p2 = products[i + 1];
    if (p1 && p2) {
      const originalTotal = Number(p1.price || 0) + Number(p2.price || 0);
      const bundlePrice = Math.round(originalTotal * 0.85); // 15% Bundle Savings
      const savings = originalTotal - bundlePrice;
      
      bundlePairs.push({
        id: `bundle-${p1.id}-${p2.id}`,
        title: `${p1.name.split(' ')[0]} & ${p2.name.split(' ')[0]} Combo Pack`,
        item1: { ...p1, image: getFirstImage(p1.images) },
        item2: { ...p2, image: getFirstImage(p2.images) },
        bundlePrice,
        originalTotal,
        savings,
        sellerCount: p1.seller_id === p2.seller_id ? 1 : 2
      });
    }
  }

  return (
    <div className="bg-slate-50 min-h-screen pb-12">
      {/* Header Banner */}
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bundlePairs.map((bundle) => (
            <div
              key={bundle.id}
              className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group"
            >
              <div className="relative h-48 bg-slate-100 grid grid-cols-2 gap-0.5 p-0.5">
                <img
                  src={bundle.item1.image || 'https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=600&h=600&fit=crop&q=80'}
                  alt={bundle.item1.name}
                  className="object-cover w-full h-full"
                />
                <img
                  src={bundle.item2.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=600&fit=crop&q=80'}
                  alt={bundle.item2.name}
                  className="object-cover w-full h-full"
                />
                <div className="absolute top-3 right-3 bg-red-500 text-white text-xs font-extrabold px-2.5 py-1 rounded-full shadow-md">
                  SAVE ৳{bundle.savings.toLocaleString()}
                </div>
                <div className="absolute bottom-3 left-3 bg-slate-900/90 text-white text-[10px] font-bold px-2.5 py-1 rounded-full backdrop-blur-sm border border-white/20">
                  🤝 {bundle.sellerCount} Sellers Combined
                </div>
              </div>
              
              <div className="p-6 flex flex-col flex-1">
                <h3 className="font-extrabold text-lg text-slate-900 mb-2 line-clamp-1 group-hover:text-primary transition-colors">
                  {bundle.title}
                </h3>
                
                <ul className="text-sm text-slate-600 space-y-1 mb-4">
                  <li className="flex items-center gap-1 line-clamp-1">✓ {bundle.item1.name}</li>
                  <li className="flex items-center gap-1 line-clamp-1">✓ {bundle.item2.name}</li>
                </ul>

                <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-2xl font-black text-slate-900">৳{bundle.bundlePrice.toLocaleString()}</span>
                    <div className="text-xs text-slate-400 line-through">Original: ৳{bundle.originalTotal.toLocaleString()}</div>
                  </div>
                  
                  <Link
                    href={`/bundle/${bundle.item1.id}/${bundle.item2.id}`}
                    className="bg-primary hover:bg-primary-dark text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-all shadow-md shadow-primary/20"
                  >
                    View Offer
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
