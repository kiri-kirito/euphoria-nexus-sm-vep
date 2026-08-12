import Link from "next/link";
import Navbar from "@/components/layout/Navbar";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 py-16">
        <h1 className="text-4xl font-extrabold text-slate-900 mb-4">About Euphoria Nexus</h1>
        <p className="text-lg text-slate-600 leading-relaxed mb-8">
          Euphoria Nexus is a multi-vendor marketplace built for Bangladesh — connecting local sellers,
          buyers, delivery agents, and support teams on one platform. Negotiate bulk deals, discover
          nearby stores, and shop cross-seller bundles with a single delivery fee.
        </p>

        <div className="grid sm:grid-cols-2 gap-6 mb-12">
          {[
            { title: "For Buyers", desc: "Explore products, wishlist favorites, checkout with bKash/Nagad, and track orders live." },
            { title: "For Sellers", desc: "List inventory, respond to bulk negotiations, join cross-seller bundles, and manage payouts." },
            { title: "For Delivery", desc: "Pick up orders, update delivery status, and earn on every completed route." },
            { title: "For Support", desc: "Resolve buyer complaints, moderate negotiations, and manage escrow between sellers." },
          ].map((item) => (
            <div key={item.title} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
              <h2 className="font-bold text-slate-900 mb-2">{item.title}</h2>
              <p className="text-sm text-slate-600">{item.desc}</p>
            </div>
          ))}
        </div>

        <div className="bg-primary/5 border border-primary/20 rounded-2xl p-8 text-center">
          <h2 className="text-xl font-bold text-slate-900 mb-3">Ready to join?</h2>
          <p className="text-slate-600 mb-6">Start shopping or apply to sell on the platform today.</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/explore" className="px-6 py-3 bg-primary text-white font-bold rounded-xl">
              Start Shopping
            </Link>
            <Link href="/seller/apply" className="px-6 py-3 bg-white border border-slate-300 text-slate-800 font-bold rounded-xl">
              Become a Seller
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
