import Link from "next/link";
import Navbar from "@/components/layout/Navbar";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 py-16">
        <h1 className="text-3xl font-extrabold text-slate-900 mb-6">Privacy Policy</h1>
        <p className="text-slate-600 mb-6">Last updated: August 2026</p>

        <section className="space-y-4 text-sm text-slate-700 leading-relaxed">
          <p>
            Euphoria Nexus respects your privacy. This policy describes what data we collect and how
            we use it when you use our marketplace.
          </p>
          <h2 className="text-lg font-bold text-slate-900 mt-8">Information We Collect</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>Account details: name, email, phone, address (via Supabase Auth and profile)</li>
            <li>Order and negotiation history</li>
            <li>Approximate location when you enable &quot;Sellers Near You&quot; or nearby filters</li>
            <li>Chat messages sent through the in-app messaging widget</li>
          </ul>
          <h2 className="text-lg font-bold text-slate-900 mt-8">How We Use Data</h2>
          <p>
            Data is used to fulfill orders, match local sellers, support bulk negotiations, and
            improve platform operations. We do not sell personal data to third parties.
          </p>
          <h2 className="text-lg font-bold text-slate-900 mt-8">Storage &amp; Security</h2>
          <p>
            Data is stored in Supabase (PostgreSQL) with row-level security. Delivery agents see
            only addresses required for assigned deliveries.
          </p>
          <h2 className="text-lg font-bold text-slate-900 mt-8">Your Choices</h2>
          <p>
            You may update profile information from My Account. Location features are optional and
            require browser permission.
          </p>
        </section>

        <Link href="/" className="inline-block mt-10 text-primary font-bold hover:underline">
          ← Back to Home
        </Link>
      </main>
    </div>
  );
}
