import Link from "next/link";

// Using standard img tag for mock data to bypass Next.js security policies

// Dummy data for featured bundles
const MOCK_BUNDLES = [
  {
    id: "1",
    name: "The Ultimate Gamer Pack",
    sellerNames: "Tech Haven & GearUp",
    originalPrice: 25000,
    bundlePrice: 21500,
    image: "https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=600&h=400&fit=crop&q=80",
    items: "Mechanical Keyboard + RGB Mouse + Headset"
  },
  {
    id: "2",
    name: "Winter Fashion Combo",
    sellerNames: "StyleZone & Kicks",
    originalPrice: 8500,
    bundlePrice: 6500,
    image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&h=400&fit=crop&q=80",
    items: "Leather Jacket + Winter Boots"
  },
  {
    id: "3",
    name: "Home Office Starter",
    sellerNames: "WoodWorks & GadgetPro",
    originalPrice: 18000,
    bundlePrice: 15000,
    image: "https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=600&h=400&fit=crop&q=80",
    items: "Ergonomic Desk + Desk Lamp + Organizer"
  }
];

export default function FeaturedBundles() {
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
        {MOCK_BUNDLES.map((bundle) => (
          <Link href={`/product/${bundle.id}`} key={bundle.id} className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-xl transition-all group cursor-pointer block">
            <div className="relative h-48 overflow-hidden bg-slate-100">
              <img 
                src={bundle.image} 
                alt={bundle.name}
                className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-3 right-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-md">
                SAVE ৳{bundle.originalPrice - bundle.bundlePrice}
              </div>
            </div>
            <div className="p-5">
              <h3 className="font-bold text-lg text-slate-900 mb-1">{bundle.name}</h3>
              <p className="text-xs text-slate-500 font-medium mb-3">By {bundle.sellerNames}</p>
              <p className="text-sm text-slate-600 mb-4 line-clamp-2">{bundle.items}</p>
              
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xl font-bold text-slate-900">৳{bundle.bundlePrice}</span>
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
