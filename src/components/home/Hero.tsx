import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative bg-slate-900 overflow-hidden rounded-2xl my-6 mx-4 sm:mx-6 lg:mx-8 shadow-2xl">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -right-1/4 w-full h-full bg-gradient-to-b from-primary/30 to-transparent rounded-full blur-3xl opacity-50 transform rotate-12"></div>
        <div className="absolute -bottom-1/2 -left-1/4 w-full h-full bg-gradient-to-t from-secondary/20 to-transparent rounded-full blur-3xl opacity-50"></div>
      </div>

      <div className="relative z-10 px-6 py-16 md:py-24 lg:px-16 text-center lg:text-left flex flex-col lg:flex-row items-center justify-between gap-12">
        <div className="max-w-2xl">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-tight mb-6">
            Discover Local Sellers. <br className="hidden lg:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
              Negotiate Bulk Deals.
            </span>
          </h1>
          <p className="text-lg md:text-xl text-slate-300 mb-8 max-w-xl mx-auto lg:mx-0">
            Euphoria Nexus connects you directly with the best local vendors. Save money with exclusive cross-seller bundles and real-time bulk negotiations.
          </p>
          <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
            <Link 
              href="/explore" 
              className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-primary hover:bg-primary-dark text-white font-semibold shadow-lg shadow-primary/30 transition-all hover:scale-105"
            >
              Start Shopping
            </Link>
            <Link 
              href="/seller/apply" 
              className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-white/10 hover:bg-white/20 text-white font-semibold backdrop-blur-sm border border-white/20 transition-all"
            >
              Become a Seller
            </Link>
          </div>
        </div>
        
        {/* Abstract Hero Image Placeholder */}
        <div className="hidden lg:flex flex-1 justify-center items-center">
          <div className="relative w-72 h-72">
            <div className="absolute inset-0 bg-gradient-to-tr from-primary to-secondary rounded-full animate-pulse blur-2xl opacity-40"></div>
            <div className="relative w-full h-full bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl flex items-center justify-center p-6 transform rotate-3">
              <div className="text-white text-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-4 text-primary">
                  <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                  <line x1="3" y1="6" x2="21" y2="6"></line>
                  <path d="M16 10a4 4 0 0 1-8 0"></path>
                </svg>
                <p className="font-semibold text-lg">Smart E-Commerce</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
