import Link from "next/link";

export default function BecomeSellerPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-10">
          <Link href="/" className="inline-flex items-center gap-2 mb-8">
            <img src="/logo-brand.png" alt="Euphoria Nexus" className="h-16 w-auto" />
            <span className="text-xl font-bold text-slate-900">Euphoria Nexus</span>
          </Link>
          <h1 className="text-4xl font-extrabold text-slate-900 mb-3">Become a Seller</h1>
          <p className="text-slate-500 text-lg max-w-md mx-auto">
            Join 500+ local sellers. Reach more buyers, negotiate bulk deals, and grow your business.
          </p>
        </div>

        {/* Benefits */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          {[
            { icon: "📦", title: "List Products", desc: "No listing fees" },
            { icon: "💬", title: "Bulk Deals", desc: "Negotiate directly" },
            { icon: "📊", title: "Analytics", desc: "Track your growth" },
          ].map(b => (
            <div key={b.title} className="bg-white rounded-2xl p-4 text-center border border-slate-200 shadow-sm">
              <div className="text-2xl mb-2">{b.icon}</div>
              <p className="font-bold text-slate-900 text-sm">{b.title}</p>
              <p className="text-xs text-slate-500">{b.desc}</p>
            </div>
          ))}
        </div>

        {/* Application Form */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8">
          <h2 className="text-lg font-bold text-slate-900 mb-6">Store Information</h2>
          <div className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Store Name *</label>
                <input type="text" placeholder="e.g. Tech Haven BD" className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Your Name *</label>
                <input type="text" placeholder="Full name" className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Business Email *</label>
              <input type="email" placeholder="you@store.com" className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Phone Number *</label>
              <input type="tel" placeholder="+880 1XXX-XXXXXX" className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Product Category *</label>
              <select className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all text-slate-700 bg-white">
                <option value="">Select a category</option>
                <option>Electronics & Gadgets</option>
                <option>Fashion & Clothing</option>
                <option>Furniture & Home</option>
                <option>Food & Groceries</option>
                <option>Sports & Fitness</option>
                <option>Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Store Location *</label>
              <input type="text" placeholder="e.g. Mirpur, Dhaka" className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Briefly describe your business</label>
              <textarea rows={3} placeholder="What do you sell? How long have you been in business?" className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all resize-none" />
            </div>

            <Link
              href="/seller/dashboard"
              className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark text-white py-4 rounded-xl font-bold text-base shadow-lg shadow-primary/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              Submit Application
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
            </Link>

            <p className="text-center text-xs text-slate-400">
              By submitting, you agree to our{" "}
              <span className="text-primary underline cursor-pointer">Terms of Service</span>
              {" "}and{" "}
              <span className="text-primary underline cursor-pointer">Seller Policy</span>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
