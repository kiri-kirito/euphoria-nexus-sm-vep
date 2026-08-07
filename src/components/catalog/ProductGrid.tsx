import Image from "next/image";
import Link from "next/link";

const MOCK_PRODUCTS = [
  { id: "1", name: "Sony WH-1000XM5 Headphones", price: 32000, store: "AudioWorld", moq: 5, category: "Electronics", image: "https://placehold.co/400x400/f8fafc/475569?text=Headphones" },
  { id: "2", name: "Logitech MX Master 3S", price: 9500, store: "Tech Haven BD", moq: 10, category: "Electronics", image: "https://placehold.co/400x400/f8fafc/475569?text=Logitech+Mouse", local: true },
  { id: "3", name: "Mechanical Keyboard Keycaps", price: 2500, store: "GearUp", moq: 20, category: "Electronics", image: "https://placehold.co/400x400/f8fafc/475569?text=Keycaps" },
  { id: "4", name: "Ergonomic Office Chair", price: 14000, store: "WoodWorks", moq: 5, category: "Furniture", image: "https://placehold.co/400x400/f8fafc/475569?text=Office+Chair", local: true },
  { id: "5", name: "Organic Green Tea (500g)", price: 800, store: "Organic Foods Ltd", moq: null, category: "Groceries", image: "https://placehold.co/400x400/f8fafc/475569?text=Green+Tea", local: true },
  { id: "6", name: "Men's Winter Jacket", price: 4500, store: "StyleZone", moq: 15, category: "Fashion", image: "https://placehold.co/400x400/f8fafc/475569?text=Winter+Jacket" },
  { id: "7", name: "Running Sneakers Pro", price: 6500, store: "Kicks", moq: null, category: "Fashion", image: "https://placehold.co/400x400/f8fafc/475569?text=Sneakers" },
  { id: "8", name: "4K Web Camera", price: 8500, store: "GadgetPro", moq: 10, category: "Electronics", image: "https://placehold.co/400x400/f8fafc/475569?text=Web+Camera" }
];

export default function ProductGrid() {
  return (
    <div className="flex-1">
      {/* Top Bar (Sorting) */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <p className="text-slate-600 font-medium">Showing <span className="text-slate-900 font-bold">{MOCK_PRODUCTS.length}</span> products</p>
        <div className="flex items-center gap-2">
          <label className="text-sm text-slate-500 font-medium">Sort by:</label>
          <select className="border border-slate-300 rounded-lg px-3 py-1.5 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/50">
            <option>Recommended</option>
            <option>Price: Low to High</option>
            <option>Price: High to Low</option>
            <option>Newest Arrivals</option>
          </select>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {MOCK_PRODUCTS.map((product) => (
          <Link href={`/product/${product.id}`} key={product.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden group hover:border-primary/50 hover:shadow-xl transition-all block">
            <div className="relative aspect-square bg-slate-100">
              <Image 
                src={product.image}
                alt={product.name}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
              
              <div className="absolute top-2 left-2 flex flex-col gap-1">
                {product.moq && (
                  <span className="bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded shadow-sm">
                    MOQ: {product.moq} (Bulk)
                  </span>
                )}
                {product.local && (
                  <span className="bg-green-500/90 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded shadow-sm">
                    FAST LOCAL
                  </span>
                )}
              </div>
            </div>
            
            <div className="p-4">
              <p className="text-xs text-slate-500 mb-1">{product.store}</p>
              <h3 className="font-semibold text-slate-900 text-sm mb-3 line-clamp-2 group-hover:text-primary transition-colors">{product.name}</h3>
              <div className="flex items-center justify-between mt-auto">
                <span className="font-bold text-lg text-slate-900">৳{product.price}</span>
                <button className="bg-slate-100 text-slate-600 p-2 rounded-full hover:bg-primary hover:text-white transition-colors shadow-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                    <line x1="3" y1="6" x2="21" y2="6"></line>
                    <path d="M16 10a4 4 0 0 1-8 0"></path>
                  </svg>
                </button>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
