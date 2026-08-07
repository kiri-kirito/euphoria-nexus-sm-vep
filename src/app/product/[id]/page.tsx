import Link from "next/link";
import { notFound } from "next/navigation";

// Mock data (In production, this would be fetched from Supabase)
const MOCK_PRODUCTS = [
  { 
    id: "1", 
    name: "Sony WH-1000XM5 Headphones", 
    price: 32000, 
    originalPrice: 35000,
    store: "AudioWorld", 
    moq: 5, 
    category: "Electronics", 
    image: "https://placehold.co/800x800/f8fafc/475569.png?text=Headphones",
    description: "Industry-leading noise cancellation. Two processors control 8 microphones for unprecedented noise cancellation. With Auto NC Optimizer, noise canceling is automatically optimized based on your wearing conditions and environment.",
    features: [
      "Industry-leading noise cancellation",
      "30-hour battery life",
      "Touch sensor controls",
      "Speak-to-chat technology"
    ],
    inStock: true
  },
  { 
    id: "2", 
    name: "Logitech MX Master 3S", 
    price: 9500, 
    originalPrice: 10500,
    store: "Tech Haven BD", 
    moq: 10, 
    category: "Electronics", 
    image: "https://placehold.co/800x800/f8fafc/475569.png?text=Logitech+Mouse", 
    local: true,
    description: "The ultimate precision mouse for creators and coders. Features MagSpeed scrolling, ergonomic design, and App-specific customizations.",
    features: [
      "8000 DPI track-on-glass sensor",
      "Quiet clicks",
      "MagSpeed electromagnetic scrolling",
      "USB-C rechargeable"
    ],
    inStock: true
  },
];

export default async function ProductDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  // In a real app, you would fetch the product from the database here
  // const product = await supabase.from('products').select('*').eq('id', resolvedParams.id).single();
  
  // For now, we'll use our mock data (or fallback to the first one if not found for demo purposes)
  const product = MOCK_PRODUCTS.find(p => p.id === resolvedParams.id) || MOCK_PRODUCTS[0];

  if (!product) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="text-sm text-slate-500 mb-8">
        <ol className="list-none p-0 inline-flex">
          <li className="flex items-center">
            <Link href="/" className="hover:text-primary">Home</Link>
            <span className="mx-2">/</span>
          </li>
          <li className="flex items-center">
            <Link href="/explore" className="hover:text-primary">{product.category}</Link>
            <span className="mx-2">/</span>
          </li>
          <li className="text-slate-900 font-medium truncate max-w-[200px] sm:max-w-md">
            {product.name}
          </li>
        </ol>
      </nav>

      <div className="flex flex-col lg:flex-row gap-12">
        {/* Product Image Gallery */}
        <div className="w-full lg:w-1/2">
          <div className="bg-slate-50 rounded-2xl p-8 border border-slate-200 aspect-square flex items-center justify-center relative overflow-hidden group">
            <img 
              src={product.image} 
              alt={product.name}
              className="object-contain w-full h-full max-h-[500px] group-hover:scale-105 transition-transform duration-500"
            />
            {product.local && (
              <div className="absolute top-4 left-4 bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1 shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                Local Seller
              </div>
            )}
          </div>
          
          {/* Thumbnails (Mock) */}
          <div className="flex gap-4 mt-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className={`w-20 h-20 rounded-lg border-2 cursor-pointer overflow-hidden ${i === 1 ? 'border-primary' : 'border-slate-200 hover:border-slate-300'}`}>
                <img src={product.image} alt={`Thumbnail ${i}`} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </div>

        {/* Product Info */}
        <div className="w-full lg:w-1/2 flex flex-col">
          <div className="mb-2">
            <Link href={`/store/${product.store.toLowerCase().replace(/\s+/g, '-')}`} className="text-primary font-medium hover:underline flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
              {product.store}
            </Link>
          </div>
          
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4 leading-tight">
            {product.name}
          </h1>

          <div className="flex items-center gap-4 mb-6">
            <div className="flex text-amber-400">
              {[1, 2, 3, 4, 5].map(star => (
                <svg key={star} xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
              ))}
            </div>
            <span className="text-slate-500 text-sm">(128 Reviews)</span>
          </div>

          <div className="mb-8">
            <div className="flex items-baseline gap-3">
              <span className="text-4xl font-bold text-primary">৳{product.price.toLocaleString()}</span>
              {product.originalPrice && (
                <span className="text-xl text-slate-400 line-through">৳{product.originalPrice.toLocaleString()}</span>
              )}
            </div>
            
            {/* Wholesale Info Box */}
            {product.moq && (
              <div className="mt-4 bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
                <svg className="text-amber-500 mt-0.5" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="7.5 4.21 12 6.81 16.5 4.21"></polyline><polyline points="7.5 19.79 7.5 14.6 3 12"></polyline><polyline points="21 12 16.5 14.6 16.5 19.79"></polyline><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
                <div>
                  <h4 className="font-bold text-amber-900">Wholesale Available</h4>
                  <p className="text-sm text-amber-800">Minimum Order Quantity (MOQ): {product.moq} units</p>
                  <button className="mt-2 text-sm font-bold text-amber-600 hover:text-amber-700 underline">Negotiate Price with Seller</button>
                </div>
              </div>
            )}
          </div>

          <div className="prose prose-slate mb-8">
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Description</h3>
            <p className="text-slate-600 leading-relaxed">
              {product.description}
            </p>
          </div>

          <div className="mb-8">
            <h3 className="text-lg font-semibold text-slate-900 mb-3">Key Features</h3>
            <ul className="space-y-2">
              {product.features.map((feature, idx) => (
                <li key={idx} className="flex items-center gap-2 text-slate-600">
                  <svg className="text-emerald-500" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  {feature}
                </li>
              ))}
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mt-auto pt-6 border-t border-slate-200">
            <div className="flex items-center border border-slate-300 rounded-xl overflow-hidden h-14 w-32">
              <button className="flex-1 hover:bg-slate-100 transition-colors h-full flex items-center justify-center font-bold text-slate-600">-</button>
              <span className="flex-1 text-center font-bold">1</span>
              <button className="flex-1 hover:bg-slate-100 transition-colors h-full flex items-center justify-center font-bold text-slate-600">+</button>
            </div>
            
            <button className="flex-1 bg-primary hover:bg-primary-dark text-white h-14 rounded-xl font-bold text-lg shadow-lg shadow-primary/30 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
