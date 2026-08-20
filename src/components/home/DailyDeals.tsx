import { fetchProducts } from "@/utils/api";
import Link from "next/link";
import ProductImage from "@/components/products/ProductImage";

export default async function DailyDeals() {
  const products = await fetchProducts(50);
  const inStock = products.filter((p: { quantity?: number }) => (p.quantity ?? 0) > 0);
  const shuffled = inStock.sort(() => 0.5 - Math.random());
  const deals = shuffled.slice(0, 4);

  return (
    <section className="py-8 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-100">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-8">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-800">Daily Flash Deals</h2>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">Lowest-priced in-stock picks — updated from live catalog</p>
        </div>
        <Link href="/explore?tab=deals" className="text-primary font-semibold hover:text-primary-dark flex items-center gap-1 transition-colors text-xs sm:text-sm shrink-0">
          View All Deals
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m9 18 6-6-6-6"></path>
          </svg>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {deals.map((product: any) => {
          const price = Number(product.price);
          const was = Math.round(price * 1.15);
          return (
          <Link
            href={`/product/${product.id}`}
            key={product.id}
            className="block group bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-xl transition-all duration-300"
          >
            <div className="relative h-48 overflow-hidden bg-slate-100">
              <ProductImage
                product={product}
                alt={product.name}
                className="object-cover w-full h-full p-4 group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute top-2 left-2 bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded">
                FLASH · ~15% OFF
              </div>
              <div className="absolute top-2 right-2 bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded">
                MOQ: {product.min_order_quantity || product.moq || 10}
              </div>
            </div>

            <div className="p-4">
              <p className="text-xs text-slate-500 mb-1">{product.seller || product.store || 'Seller'}</p>
              <h3 className="font-semibold text-slate-900 text-sm mb-2 line-clamp-1">{product.name}</h3>
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-bold text-lg text-slate-900">৳{price.toLocaleString()}</span>
                  <span className="text-xs text-slate-400 line-through ml-2">৳{was.toLocaleString()}</span>
                </div>
                <span className="text-xs bg-primary/10 text-primary font-bold px-2 py-1 rounded-full">
                  {product.category || 'General'}
                </span>
              </div>
            </div>
          </Link>
        );})}
        {deals.length === 0 && (
          <p className="col-span-full text-center text-slate-500 py-8">No deals available right now.</p>
        )}
      </div>
    </section>
  );
}
