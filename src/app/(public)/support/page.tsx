import Link from "next/link";
import Navbar from "@/components/layout/Navbar";

export default function PublicSupportPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-extrabold text-slate-900 mb-3">Help &amp; Support</h1>
        <p className="text-slate-600 mb-8">
          Need help with an order, bulk deal, or delivery? Our support team is here for you.
        </p>

        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm text-left space-y-4 text-sm">
          <p>
            <strong>Email:</strong> support@euphoria-nexus.com
          </p>
          <p>
            <strong>Hours:</strong> 9:00 AM – 9:00 PM (GMT+6), seven days a week
          </p>
          <p>
            Logged-in users can also use the <strong>chat widget</strong> (bottom-right) to message
            a support agent, or file a complaint from the Orders page after checkout.
          </p>
          <p>
            Support agents: sign in and open{" "}
            <Link href="/support/dashboard" className="text-primary font-bold hover:underline">
              Support Dashboard
            </Link>
            .
          </p>
        </div>

        <Link href="/" className="inline-block mt-10 text-primary font-bold hover:underline">
          ← Back to Home
        </Link>
      </main>
    </div>
  );
}
