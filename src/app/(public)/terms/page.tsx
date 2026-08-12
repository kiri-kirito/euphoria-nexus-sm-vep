import Link from "next/link";
import Navbar from "@/components/layout/Navbar";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 py-16 prose prose-slate">
        <h1 className="text-3xl font-extrabold text-slate-900 mb-6">Terms &amp; Conditions</h1>
        <p className="text-slate-600 mb-6">Last updated: August 2026</p>

        <section className="space-y-4 text-sm text-slate-700 leading-relaxed">
          <p>
            By using Euphoria Nexus you agree to these terms. The platform connects buyers, sellers,
            delivery agents, and support staff for multi-vendor commerce in Bangladesh.
          </p>
          <h2 className="text-lg font-bold text-slate-900 mt-8">Orders &amp; Payments</h2>
          <p>
            Orders placed through checkout are binding once confirmed. Mock bKash/Nagad and COD flows
            are simulated for demonstration; real payment integration may replace them in production.
          </p>
          <h2 className="text-lg font-bold text-slate-900 mt-8">Bundles &amp; Returns</h2>
          <p>
            Cross-seller bundle discounts apply only when the full bundle is kept. Partial returns
            void the bundle discount and refunds are calculated at regular item prices.
          </p>
          <h2 className="text-lg font-bold text-slate-900 mt-8">Seller Applications</h2>
          <p>
            New sellers must be approved by an administrator before gaining seller dashboard access.
          </p>
          <h2 className="text-lg font-bold text-slate-900 mt-8">Limitation of Liability</h2>
          <p>
            Euphoria Nexus facilitates transactions between parties and is not liable for disputes
            between buyers and sellers beyond support mediation and escrow where applicable.
          </p>
        </section>

        <Link href="/" className="inline-block mt-10 text-primary font-bold hover:underline">
          ← Back to Home
        </Link>
      </main>
    </div>
  );
}
