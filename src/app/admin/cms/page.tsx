'use client';

import React, { useState } from 'react';

export default function AdminCMS() {
  const [banners, setBanners] = useState([
    { id: 1, title: 'B2B Industrial Wholesale Mega Sale', status: 'Active', clicks: 1420 },
    { id: 2, title: 'Verified Bangladesh Electronics Suppliers', status: 'Active', clicks: 980 },
    { id: 3, title: 'Eid-Ul-Fitr Special Bulk Discount', status: 'Scheduled', clicks: 0 },
  ]);

  const [toast, setToast] = useState<string | null>(null);

  const toggleBanner = (id: number) => {
    setBanners(prev => prev.map(b => b.id === id ? { ...b, status: b.status === 'Active' ? 'Paused' : 'Active' } : b));
    setToast('Banner status updated!');
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <div className="space-y-6">
      {toast && (
        <div className="fixed bottom-6 right-6 bg-blue-600 text-white text-xs font-bold px-4 py-3 rounded-xl shadow-2xl z-50 animate-bounce">
          {toast}
        </div>
      )}

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">CMS & Banner Management</h1>
          <p className="text-xs text-slate-400 mt-1">Control homepage hero slideshow, featured bundles, and promo banners.</p>
        </div>
        <button 
          onClick={() => { setToast('New promo banner added to queue!'); setTimeout(() => setToast(null), 3000); }}
          className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition shadow-lg shadow-blue-600/30"
        >
          + Add New Banner
        </button>
      </div>

      <div className="bg-slate-950 rounded-2xl border border-slate-800 shadow-xl overflow-hidden">
        <div className="p-6 border-b border-slate-800">
          <h3 className="font-bold text-white text-base">Active Homepage Banners</h3>
        </div>

        <div className="divide-y divide-slate-800/60 text-xs">
          {banners.map((b) => (
            <div key={b.id} className="p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-slate-900/50 transition">
              <div>
                <h4 className="font-bold text-white text-sm mb-1">{b.title}</h4>
                <p className="text-slate-500">Total Interactions: <strong className="text-slate-300">{b.clicks} clicks</strong></p>
              </div>

              <div className="flex items-center gap-3">
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                  b.status === 'Active' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                }`}>
                  {b.status}
                </span>

                <button 
                  onClick={() => toggleBanner(b.id)}
                  className="bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-200 px-3 py-1.5 rounded-lg font-bold transition"
                >
                  {b.status === 'Active' ? 'Pause' : 'Activate'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
