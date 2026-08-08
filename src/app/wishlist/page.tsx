import Link from "next/link";
import Navbar from "@/components/layout/Navbar";

export default function WishlistPage() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <div className="bg-white rounded-3xl p-12 max-w-2xl mx-auto shadow-xl shadow-slate-200/50 border border-slate-100">
          <div className="w-24 h-24 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-rose-500">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-4">Your Wishlist is Empty</h1>
          <p className="text-slate-600 mb-8 max-w-md mx-auto leading-relaxed">
            Save items you love to your wishlist and come back to them later. Let's find something amazing!
          </p>
          <Link 
            href="/explore" 
            className="inline-flex items-center justify-center px-8 py-3.5 bg-primary text-white font-bold rounded-xl hover:bg-primary-dark transition-all hover:scale-105 active:scale-95 shadow-lg shadow-primary/30"
          >
            Explore Products
          </Link>
        </div>
      </main>
    </div>
  );
}
