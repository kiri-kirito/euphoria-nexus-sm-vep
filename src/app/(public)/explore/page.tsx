import React from 'react';
import Image from 'next/image';

export default function ExplorePage() {
  const products = [
    { id: 1, name: 'Premium Copper Wire', price: '$4.50/kg', minOrder: '1000 kg', image: 'https://images.unsplash.com/photo-1574345371569-b5413bc7cb9f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' },
    { id: 2, name: 'Industrial Grade Steel Beams', price: '$850/ton', minOrder: '5 tons', image: 'https://images.unsplash.com/photo-1518349542013-176b6a03cc09?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' },
    { id: 3, name: 'Recycled Aluminum Ingots', price: '$2,100/ton', minOrder: '2 tons', image: 'https://images.unsplash.com/photo-1620619570189-e58f001b97ad?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' },
    { id: 4, name: 'Solar Grade Silicon', price: '$12.00/kg', minOrder: '500 kg', image: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' },
    { id: 5, name: 'Heavy Duty Cogs', price: '$150/unit', minOrder: '50 units', image: 'https://images.unsplash.com/photo-1536768341617-1f486a246816?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' },
    { id: 6, name: 'Lithium Ion Cells', price: '$3.20/cell', minOrder: '10000 cells', image: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' },
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Filters */}
        <aside className="w-full md:w-1/4 flex flex-col gap-6">
          <div>
            <h2 className="text-xl font-bold mb-4">Filters</h2>
            
            <div className="mb-6">
              <h3 className="font-semibold mb-2">Category</h3>
              <div className="flex flex-col gap-2">
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="form-checkbox h-4 w-4 text-blue-600 rounded" />
                  <span>Metals & Alloys</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="form-checkbox h-4 w-4 text-blue-600 rounded" />
                  <span>Chemicals</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="form-checkbox h-4 w-4 text-blue-600 rounded" />
                  <span>Electronics components</span>
                </label>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="font-semibold mb-2">Price Range</h3>
              <div className="flex items-center gap-2">
                <input type="number" placeholder="Min" className="w-full border rounded p-2 text-sm" />
                <span>-</span>
                <input type="number" placeholder="Max" className="w-full border rounded p-2 text-sm" />
              </div>
            </div>

            <div className="mb-6">
              <h3 className="font-semibold mb-2">Delivery Zone</h3>
              <select className="w-full border rounded p-2 bg-white text-sm">
                <option>Global</option>
                <option>North America</option>
                <option>Europe</option>
                <option>Asia Pacific</option>
              </select>
            </div>
            
            <button className="w-full bg-blue-600 text-white py-2 rounded font-medium hover:bg-blue-700 transition">
              Apply Filters
            </button>
          </div>
        </aside>

        {/* Product Grid */}
        <main className="w-full md:w-3/4">
          <h1 className="text-2xl font-bold mb-6">Explore Products</h1>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <div key={product.id} className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow bg-white flex flex-col">
                <div className="relative h-48 w-full bg-gray-200">
                  <Image 
                    src={product.image} 
                    alt={product.name} 
                    fill 
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                </div>
                <div className="p-4 flex flex-col flex-grow">
                  <h3 className="font-bold text-lg mb-1">{product.name}</h3>
                  <div className="text-blue-600 font-semibold text-xl mb-1">{product.price}</div>
                  <div className="text-sm text-gray-500 mb-4">Min. Order: {product.minOrder}</div>
                  <div className="mt-auto">
                    <button className="w-full border border-blue-600 text-blue-600 py-2 rounded font-medium hover:bg-blue-50 transition">
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
