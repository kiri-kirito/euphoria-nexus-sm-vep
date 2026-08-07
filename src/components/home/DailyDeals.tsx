// Using standard img tag for mock data to bypass Next.js security policies
import Link from "next/link";

const MOCK_PRODUCTS = [
  {
    id: "p1",
    name: "Sony WH-1000XM5 Headphones",
    price: 32000,
    store: "AudioWorld",
    moq: 5,
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop&q=80"
  },
  {
    id: "p2",
    name: "Logitech MX Master 3S",
    price: 9500,
    store: "Tech Haven BD",
    moq: 10,
    image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400&h=400&fit=crop&q=80"
  },
  {
    id: "p3",
    name: "Mechanical Keyboard Keycaps",
    price: 2500,
    store: "GearUp",
    moq: 20,
    image: "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=400&h=400&fit=crop&q=80"
  },
  {
    id: "p4",
    name: "Ergonomic Office Chair",
    price: 14000,
    store: "WoodWorks",
    moq: 5,
    image: "https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=400&h=400&fit=crop&q=80"
  }
];

export default function DailyDeals() {
  return (
    <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Daily Deals</h2>
          <p className="text-slate-500 mt-2">Top products at unbeatable prices.</p>
        </div>
        <Link href="/products" className="hidden sm:block text-primary font-semibold hover:text-primary-dark">View Catalog</Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {MOCK_PRODUCTS.map((product) => (
          <div key={product.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden group hover:border-primary/50 transition-colors">
            <div className="relative aspect-square bg-slate-100">
              <img 
                src={product.image} 
                alt={product.name}
                className="object-cover w-full h-full p-4 group-hover:scale-110 transition-transform duration-500"
              />
              {/* Badge for Bulk Negotiation */}
              <div className="absolute top-2 left-2 bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded">
                MOQ: {product.moq} for Bulk Price
              </div>
            </div>
            
            <div className="p-4">
              <p className="text-xs text-slate-500 mb-1">{product.store}</p>
              <h3 className="font-semibold text-slate-900 text-sm mb-2 line-clamp-1">{product.name}</h3>
              <div className="flex items-center justify-between">
                <span className="font-bold text-lg text-slate-900">৳{product.price}</span>
                <button className="text-slate-400 hover:text-primary transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                    <line x1="3" y1="6" x2="21" y2="6"></line>
                    <path d="M16 10a4 4 0 0 1-8 0"></path>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
