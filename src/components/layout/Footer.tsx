import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 py-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
        
        <div>
          <h3 className="text-white font-bold text-lg mb-4">Euphoria Nexus</h3>
          <p className="text-sm text-slate-400">
            The ultimate multi-vendor e-commerce platform. Find local sellers, negotiate in bulk, and save with cross-seller bundles.
          </p>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-4">Shop</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/explore" className="hover:text-primary transition-colors">Explore Products</Link></li>
            <li><Link href="/bundles" className="hover:text-primary transition-colors">Cross-Seller Bundles</Link></li>
            <li><Link href="/explore?nearby=1" className="hover:text-primary transition-colors">Local Sellers</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-4">Make Money</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/seller/apply" className="hover:text-primary transition-colors">Become a Seller</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-4">Help & Support</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/support" className="hover:text-primary transition-colors">Contact Support</Link></li>
            <li><Link href="/terms" className="hover:text-primary transition-colors">Terms & Conditions</Link></li>
            <li><Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
          </ul>
        </div>

      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-8 border-t border-slate-800 text-sm text-center text-slate-500">
        &copy; {new Date().getFullYear()} Euphoria Nexus. All rights reserved.
      </div>
    </footer>
  );
}
