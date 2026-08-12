'use client';

import Link from "next/link";
import { useEffect, useState } from "react";
import { fetchLocalSellers, type LocalSeller } from "@/utils/api";

const DEFAULT_LAT = 23.8103;
const DEFAULT_LNG = 90.4125;

export default function LocalSellers() {
  const [sellers, setSellers] = useState<LocalSeller[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      if (typeof navigator !== 'undefined' && navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (pos) => {
            const data = await fetchLocalSellers(pos.coords.latitude, pos.coords.longitude);
            setSellers(data);
            setLoading(false);
          },
          async () => {
            const data = await fetchLocalSellers(DEFAULT_LAT, DEFAULT_LNG);
            setSellers(data);
            setLoading(false);
          }
        );
      } else {
        const data = await fetchLocalSellers(DEFAULT_LAT, DEFAULT_LNG);
        setSellers(data);
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto mb-12">
      <div className="bg-gradient-to-r from-slate-100 to-slate-50 rounded-3xl p-6 sm:p-10 border border-slate-200">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary">
                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
              <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Sellers Near You</h2>
            </div>
            <p className="text-slate-500">Discover local stores and get your items delivered within hours.</p>
          </div>
          <Link
            href="/explore?nearby=1"
            className="px-6 py-2 bg-white border border-slate-300 rounded-full text-slate-700 font-medium hover:bg-slate-50 transition-colors shadow-sm"
          >
            Browse Nearby Products
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white p-5 rounded-2xl border animate-pulse h-28" />
            ))}
          </div>
        ) : sellers.length === 0 ? (
          <p className="text-center text-slate-500 py-8">No local sellers found in your area yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {sellers.map((seller) => (
              <Link
                href={`/explore?seller=${encodeURIComponent(seller.id)}&nearby=1`}
                key={seller.id}
                className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-all flex items-start gap-4 group"
              >
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xl shrink-0 overflow-hidden">
                  {seller.image ? (
                    <img src={seller.image} alt={seller.name} className="w-full h-full object-cover" />
                  ) : (
                    seller.name?.charAt(0) || 'S'
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-slate-900 group-hover:text-primary transition-colors">{seller.name}</h3>
                  <p className="text-xs text-slate-500 mb-2">{seller.category || 'Verified Local Seller'} · {seller.products} products</p>
                  <div className="flex items-center gap-3 text-xs font-medium">
                    <span className="text-slate-600">{seller.distance}</span>
                    <span className="text-amber-500">★ {seller.rating}</span>
                  </div>
                  {seller.isSameDay && (
                    <div className="mt-3 inline-block px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold rounded-full">
                      ⚡ SAME-DAY DELIVERY
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
