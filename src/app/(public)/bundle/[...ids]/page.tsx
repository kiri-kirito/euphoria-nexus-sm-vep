import { notFound } from 'next/navigation';
import { fetchProducts } from '@/utils/api';
import Link from 'next/link';
import BundleAddToCartButton from '@/components/products/BundleAddToCartButton';
import { resolveProductImage } from '@/utils/productImages';

export const revalidate = 0; // Dynamic rendering

const getFirstImage = (product: { images?: unknown; name?: string; category?: string }) =>
  resolveProductImage(product);

export default async function BundleDealPage({ params }: { params: Promise<{ ids: string[] }> }) {
  const resolvedParams = await params;
  const { ids } = resolvedParams;
  
  if (!ids || ids.length < 2) return notFound();

  const [id1, id2] = ids;
  
  // Fetch all products to find the two items (in a real app, you'd fetch just those two by ID)
  const products = await fetchProducts();
  const item1 = products.find(p => p.id === id1);
  const item2 = products.find(p => p.id === id2);

  if (!item1 || !item2) return notFound();

  const originalTotal = Number(item1.price || 0) + Number(item2.price || 0);
  const bundlePrice = Math.round(originalTotal * 0.85); // 15% savings
  const savings = originalTotal - bundlePrice;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-6">
        <Link href="/" className="text-primary hover:underline text-sm font-medium">
          &larr; Back to Home
        </Link>
      </div>

      <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100 flex flex-col lg:flex-row">
        {/* Left Side: Images */}
        <div className="w-full lg:w-1/2 bg-slate-50 p-8 flex flex-col sm:flex-row items-center justify-center gap-6 relative">
          <div className="absolute top-4 left-4 bg-red-500 text-white font-extrabold px-3 py-1 rounded-full shadow-lg z-10">
            Combo Offer: Save 15%
          </div>
          
          {/* Image 1 */}
          <div className="relative w-full max-w-[240px] aspect-square rounded-2xl overflow-hidden shadow-lg border-4 border-white transform hover:scale-105 transition-transform">
            <img 
              src={getFirstImage(item1)} 
              alt={item1.name} 
              className="object-cover w-full h-full"
            />
          </div>

          <div className="text-4xl font-black text-slate-300 mx-2">+</div>

          {/* Image 2 */}
          <div className="relative w-full max-w-[240px] aspect-square rounded-2xl overflow-hidden shadow-lg border-4 border-white transform hover:scale-105 transition-transform">
            <img 
              src={getFirstImage(item2)} 
              alt={item2.name} 
              className="object-cover w-full h-full"
            />
          </div>
        </div>

        {/* Right Side: Details & Add to Cart */}
        <div className="w-full lg:w-1/2 p-8 lg:p-12 flex flex-col justify-center">
          <h1 className="text-3xl lg:text-4xl font-extrabold text-slate-900 mb-2 leading-tight">
            {item1.name.split(' ')[0]} & {item2.name.split(' ')[0]} Combo
          </h1>
          <p className="text-slate-500 text-lg mb-8">
            Buy these two verified items together and get an exclusive bundle discount!
          </p>

          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 mb-8 space-y-4">
            <div className="flex justify-between items-center text-slate-600">
              <span className="font-medium">{item1.name}</span>
              <span>৳{Number(item1.price).toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center text-slate-600">
              <span className="font-medium">{item2.name}</span>
              <span>৳{Number(item2.price).toLocaleString()}</span>
            </div>
            <div className="h-px bg-slate-200 w-full my-2"></div>
            <div className="flex justify-between items-center text-slate-500 line-through">
              <span>Original Total</span>
              <span>৳{originalTotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center text-2xl font-black text-slate-900">
              <span>Bundle Price</span>
              <span>৳{bundlePrice.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center text-sm font-bold text-red-500">
              <span>Your Savings</span>
              <span>- ৳{savings.toLocaleString()}</span>
            </div>
          </div>

          <BundleAddToCartButton item1={item1} item2={item2} />
          <p className="text-xs text-slate-500 text-center mt-3">
            Cross-seller bundles ship together — you pay one delivery fee for this combo.
          </p>
        </div>
      </div>
    </div>
  );
}
