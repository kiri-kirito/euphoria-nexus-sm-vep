import Link from "next/link";

export default function CartPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-8">Your Cart (2 items)</h1>
        
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left: Cart Items */}
          <div className="lg:w-2/3 space-y-6">
            {/* Item 1 */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col sm:flex-row gap-6 items-start sm:items-center">
              <img 
                src="https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?auto=format&fit=crop&q=80&w=200" 
                alt="Sony WH-1000XM5" 
                className="w-24 h-24 object-cover rounded-xl"
              />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-slate-900">Sony WH-1000XM5 Wireless Headphones</h3>
                <p className="text-slate-500 text-sm mt-1">Seller: Tech Haven BD</p>
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center gap-3 bg-slate-100 rounded-lg p-1">
                    <button className="w-8 h-8 flex justify-center items-center rounded-md hover:bg-white hover:shadow-sm text-slate-600 transition-all">-</button>
                    <span className="w-4 text-center font-medium text-slate-900">1</span>
                    <button className="w-8 h-8 flex justify-center items-center rounded-md hover:bg-white hover:shadow-sm text-slate-600 transition-all">+</button>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-slate-900">৳32,000</p>
                  </div>
                </div>
              </div>
              <button className="text-slate-400 hover:text-red-500 transition-colors p-2 self-start sm:self-auto">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
              </button>
            </div>

            {/* Item 2 */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col sm:flex-row gap-6 items-start sm:items-center">
              <img 
                src="https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&q=80&w=200" 
                alt="Mechanical Gaming Keyboard" 
                className="w-24 h-24 object-cover rounded-xl"
              />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-slate-900">Mechanical Gaming Keyboard</h3>
                <p className="text-slate-500 text-sm mt-1">Seller: GamerZone</p>
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center gap-3 bg-slate-100 rounded-lg p-1">
                    <button className="w-8 h-8 flex justify-center items-center rounded-md hover:bg-white hover:shadow-sm text-slate-600 transition-all">-</button>
                    <span className="w-4 text-center font-medium text-slate-900">2</span>
                    <button className="w-8 h-8 flex justify-center items-center rounded-md hover:bg-white hover:shadow-sm text-slate-600 transition-all">+</button>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-slate-900">৳4,500</p>
                  </div>
                </div>
              </div>
              <button className="text-slate-400 hover:text-red-500 transition-colors p-2 self-start sm:self-auto">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
              </button>
            </div>
          </div>

          {/* Right: Order Summary */}
          <div className="lg:w-1/3">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 sticky top-8">
              <h2 className="text-xl font-bold text-slate-900 mb-6">Order Summary</h2>
              
              <div className="space-y-4 text-sm text-slate-600 mb-6">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-medium text-slate-900">৳41,000</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>Calculated at checkout</span>
                </div>
                <div className="flex justify-between text-emerald-600">
                  <span>Discount</span>
                  <span>- ৳0</span>
                </div>
                <div className="border-t border-slate-100 pt-4 mt-4 flex justify-between text-base">
                  <span className="font-bold text-slate-900">Total</span>
                  <span className="font-bold text-slate-900">৳41,000</span>
                </div>
              </div>

              <Link href="/checkout" className="w-full flex justify-center items-center py-3 px-4 bg-slate-900 text-white rounded-xl font-semibold hover:bg-slate-800 transition-colors mb-4">
                Proceed to Checkout
              </Link>
              
              <Link href="/explore" className="w-full flex justify-center items-center py-3 px-4 text-slate-600 font-medium hover:text-slate-900 transition-colors">
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
