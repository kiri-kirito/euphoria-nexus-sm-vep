'use client';

import React, { useState } from 'react';

export default function AdminSettings() {
  const [commission, setCommission] = useState('');
  const [minPayout, setMinPayout] = useState('');
  const [toast, setToast] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  React.useEffect(() => {
    // Mock API fetch
    const timer = setTimeout(() => {
      setCommission('5.0');
      setMinPayout('5000');
      setIsFetching(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Mock API save
    setTimeout(() => {
      setIsLoading(false);
      setToast('Platform settings saved successfully!');
      setTimeout(() => setToast(null), 3000);
    }, 1500);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {toast && (
        <div className="fixed bottom-6 right-6 bg-emerald-600 text-white text-xs font-bold px-4 py-3 rounded-xl shadow-2xl z-50 animate-bounce">
          {toast}
        </div>
      )}

      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Platform System Settings</h1>
        <p className="text-xs text-slate-400 mt-1">Configure transaction commission fees, payment gateways, and system rules.</p>
      </div>

      <form onSubmit={handleSave} className="bg-slate-950 p-6 rounded-2xl border border-slate-800 shadow-xl space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-2">Platform Commission Fee (%)</label>
            <input 
              type="text" 
              value={commission}
              onChange={(e) => setCommission(e.target.value)}
              disabled={isFetching || isLoading}
              className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl p-3 text-xs outline-none focus:border-blue-500 font-bold disabled:opacity-50" 
            />
            <p className="text-[11px] text-slate-500 mt-1">Commission charged on seller completed orders.</p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-2">Minimum Seller Payout (৳ Taka)</label>
            <input 
              type="text" 
              value={minPayout}
              onChange={(e) => setMinPayout(e.target.value)}
              disabled={isFetching || isLoading}
              className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl p-3 text-xs outline-none focus:border-blue-500 font-bold disabled:opacity-50" 
            />
            <p className="text-[11px] text-slate-500 mt-1">Minimum threshold before sellers can request bKash/Bank payout.</p>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-800 flex justify-end">
          <button 
            type="submit" 
            disabled={isFetching || isLoading}
            className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-bold px-6 py-3 rounded-xl transition shadow-lg shadow-blue-600/30"
          >
            {isLoading ? 'Saving...' : isFetching ? 'Loading...' : 'Save System Settings'}
          </button>
        </div>
      </form>
    </div>
  );
}
