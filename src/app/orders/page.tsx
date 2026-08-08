import Link from "next/link";
import Navbar from "@/components/layout/Navbar";

export default function OrdersPage() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <div className="bg-white rounded-3xl p-12 max-w-2xl mx-auto shadow-xl shadow-slate-200/50 border border-slate-100">
          <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500">
              <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
            </svg>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-4">No Orders Yet</h1>
          <p className="text-slate-600 mb-8 max-w-md mx-auto leading-relaxed">
            You haven't placed any orders recently. Start exploring our marketplace to find amazing deals!
          </p>
          <Link 
            href="/explore" 
            className="inline-flex items-center justify-center px-8 py-3.5 bg-primary text-white font-bold rounded-xl hover:bg-primary-dark transition-all hover:scale-105 active:scale-95 shadow-lg shadow-primary/30"
          >
            Start Shopping
          </Link>
        </div>
      </main>
    </div>
  );
}
