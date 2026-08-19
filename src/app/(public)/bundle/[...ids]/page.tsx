import { notFound } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';
import BundleAddToCartButton from '@/components/products/BundleAddToCartButton';
import { resolveProductImage } from '@/utils/productImages';

export const revalidate = 0; // Dynamic rendering

interface ProductData {
  id: string;
  name: string;
  price: number;
  image: string;
  seller_id?: string;
  seller?: string;
  category?: string;
}

function mapProduct(raw: any): ProductData {
  return {
    id: raw.id,
    name: raw.name,
    price: Number(raw.price || 0),
    image: resolveProductImage(raw),
    seller_id: raw.seller_id,
    seller: raw.users?.name || raw.seller || 'Verified Seller',
    category: raw.category || 'General',
  };
}

export default async function BundleDealPage({ params }: { params: Promise<{ ids: string[] }> }) {
  const resolvedParams = await params;
  const { ids } = resolvedParams;

  if (!ids || ids.length === 0) return notFound();

  const supabase = createClient();
  let item1: ProductData | null = null;
  let item2: ProductData | null = null;
  let bundleTitle = 'Exclusive Combo Bundle';
  let bundlePrice = 0;
  let originalTotal = 0;
  let savings = 0;
  let customDiscountPercent = 15;

  if (ids.length === 1) {
    // 1. Single bundle UUID requested (/bundle/[bundleId])
    const bundleId = ids[0];
    const { data: bundleData, error } = await supabase
      .from('product_bundles')
      .select(`
        id, bundle_name, total_price, revenue_split,
        bundle_items (
          product_id,
          products (*, users!seller_id(name))
        )
      `)
      .eq('id', bundleId)
      .maybeSingle();

    if (error || !bundleData) return notFound();

    const prods = (bundleData.bundle_items || []).map((bi: any) => bi.products).filter(Boolean);
    if (prods.length < 2) return notFound();

    item1 = mapProduct(prods[0]);
    item2 = mapProduct(prods[1]);
    bundleTitle = bundleData.bundle_name || `${item1.name.split(' ')[0]} + ${item2.name.split(' ')[0]} Combo Pack`;
    originalTotal = item1.price + item2.price;
    bundlePrice = Number(bundleData.total_price) || Math.round(originalTotal * 0.85);
    savings = Math.max(0, originalTotal - bundlePrice);
    customDiscountPercent = originalTotal > 0 ? Math.round((savings / originalTotal) * 100) : 15;
  } else {
    // 2. Pair of product IDs requested (/bundle/[id1]/[id2])
    const [id1, id2] = ids;

    const { data: prods, error } = await supabase
      .from('products')
      .select('*, users!seller_id(name)')
      .in('id', [id1, id2]);

    if (error || !prods || prods.length < 2) return notFound();

    const p1 = prods.find((p) => p.id === id1);
    const p2 = prods.find((p) => p.id === id2);
    if (!p1 || !p2) return notFound();

    item1 = mapProduct(p1);
    item2 = mapProduct(p2);

    // Check if there is an existing approved product_bundle row for these items
    const { data: existingBundle } = await supabase
      .from('bundle_items')
      .select('bundle_id, product_bundles(id, bundle_name, total_price, revenue_split)')
      .eq('product_id', id1)
      .limit(10);

    let matchedDbBundle: any = null;
    if (existingBundle) {
      for (const eb of existingBundle) {
        const { data: otherItem } = await supabase
          .from('bundle_items')
          .select('product_id')
          .eq('bundle_id', eb.bundle_id)
          .eq('product_id', id2)
          .maybeSingle();
        if (otherItem) {
          matchedDbBundle = eb.product_bundles;
          break;
        }
      }
    }

    originalTotal = item1.price + item2.price;
    if (matchedDbBundle?.total_price) {
      bundlePrice = Number(matchedDbBundle.total_price);
      bundleTitle = matchedDbBundle.bundle_name || `${item1.name.split(' ')[0]} + ${item2.name.split(' ')[0]} Combo Pack`;
    } else {
      bundlePrice = Math.round(originalTotal * 0.85);
      bundleTitle = `${item1.name.split(' ')[0]} + ${item2.name.split(' ')[0]} Combo Pack`;
    }
    savings = Math.max(0, originalTotal - bundlePrice);
    customDiscountPercent = originalTotal > 0 ? Math.round((savings / originalTotal) * 100) : 15;
  }

  if (!item1 || !item2) return notFound();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-6">
        <Link href="/explore" className="text-primary hover:underline text-sm font-semibold inline-flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
          Back to Explore
        </Link>
      </div>

      <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-200 flex flex-col lg:flex-row">
        {/* Left Side: Product Images */}
        <div className="w-full lg:w-1/2 bg-slate-50 p-8 sm:p-12 flex flex-col sm:flex-row items-center justify-center gap-6 relative border-b lg:border-b-0 lg:border-r border-slate-200">
          <div className="absolute top-4 left-4 bg-red-600 text-white font-extrabold text-xs px-3.5 py-1.5 rounded-full shadow-md z-10 flex items-center gap-1">
            <span>🔥</span> Combo Offer: Save {customDiscountPercent}%
          </div>

          {/* Image 1 */}
          <div className="relative w-full max-w-[220px] aspect-square rounded-2xl overflow-hidden shadow-lg border-4 border-white transform hover:scale-105 transition-transform bg-white">
            <img
              src={item1.image}
              alt={item1.name}
              className="object-cover w-full h-full"
            />
          </div>

          <div className="text-4xl font-black text-slate-300 mx-2 shrink-0">+</div>

          {/* Image 2 */}
          <div className="relative w-full max-w-[220px] aspect-square rounded-2xl overflow-hidden shadow-lg border-4 border-white transform hover:scale-105 transition-transform bg-white">
            <img
              src={item2.image}
              alt={item2.name}
              className="object-cover w-full h-full"
            />
          </div>
        </div>

        {/* Right Side: Details & Add to Cart */}
        <div className="w-full lg:w-1/2 p-8 lg:p-12 flex flex-col justify-center">
          <span className="inline-block bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-full mb-3 w-fit">
            Cross-Seller Co-Bundle Deal
          </span>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mb-2 leading-tight">
            {bundleTitle}
          </h1>
          <p className="text-slate-500 text-sm mb-6">
            Get these two complementary items together at an exclusive verified combo discount with a single unified delivery fee.
          </p>

          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 mb-6 space-y-3">
            <div className="flex justify-between items-center text-xs">
              <div>
                <span className="font-bold text-slate-900">{item1.name}</span>
                <p className="text-[10px] text-slate-400">Sold by {item1.seller}</p>
              </div>
              <span className="font-bold text-slate-900">৳{item1.price.toLocaleString()}</span>
            </div>

            <div className="flex justify-between items-center text-xs">
              <div>
                <span className="font-bold text-slate-900">{item2.name}</span>
                <p className="text-[10px] text-slate-400">Sold by {item2.seller}</p>
              </div>
              <span className="font-bold text-slate-900">৳{item2.price.toLocaleString()}</span>
            </div>

            <div className="h-px bg-slate-200 w-full my-2"></div>

            <div className="flex justify-between items-center text-xs text-slate-400 line-through">
              <span>Original Combined Total</span>
              <span>৳{originalTotal.toLocaleString()}</span>
            </div>

            <div className="flex justify-between items-center text-2xl font-black text-slate-900">
              <span>Combo Price</span>
              <span className="text-emerald-700">৳{bundlePrice.toLocaleString()}</span>
            </div>

            <div className="flex justify-between items-center text-xs font-bold text-red-600 bg-red-50 p-2 rounded-xl">
              <span>Your Total Savings</span>
              <span>- ৳{savings.toLocaleString()} ({customDiscountPercent}% OFF)</span>
            </div>
          </div>

          <BundleAddToCartButton item1={item1} item2={item2} bundlePrice={bundlePrice} />

          <p className="text-xs text-slate-500 text-center mt-3 font-medium">
            🚚 Cross-seller bundles ship together — you pay <strong className="text-slate-800">only one delivery fee</strong> for this combo.
          </p>

          <div className="mt-4 p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900">
            <p className="font-bold mb-1">Bundle return policy</p>
            <p className="text-[11px] leading-relaxed">
              If you return only one item from this bundle, the {customDiscountPercent}% combo discount is voided. Refunds are
              calculated as: Total Bundle Price Paid minus the regular price of the kept item.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
