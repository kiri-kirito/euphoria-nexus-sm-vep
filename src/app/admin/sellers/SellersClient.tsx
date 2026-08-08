'use client';

import React, { useState } from 'react';
import { toggleSellerApproval } from './actions';

export default function SellersClient({ sellers }: { sellers: any[] }) {
  const [toast, setToast] = useState<string | null>(null);

  const handleToggle = async (userId: string, current: boolean, name: string) => {
    await toggleSellerApproval(userId, current);
    setToast(`Seller "${name}" ${!current ? 'approved' : 'revoked'} successfully!`);
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <div className="space-y-6">
      {toast && (
        <div className="fixed bottom-6 right-6 bg-emerald-600 text-white text-xs font-bold px-4 py-3 rounded-xl shadow-2xl z-50 animate-bounce">
          {toast}
        </div>
      )}

      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Seller Verification Approvals</h1>
        <p className="text-xs text-slate-400 mt-1">Verify business details and grant or revoke seller portal access.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sellers.map((app) => (
          <div key={app.user_id} className="bg-slate-950 p-6 rounded-2xl border border-slate-800 shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-4">
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${app.is_approved ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-300 border-amber-500/20'}`}>
                  {app.is_approved ? 'Approved' : 'Pending'}
                </span>
                <span className="text-[11px] text-slate-500">{new Date(app.users?.created_at || '').toLocaleDateString()}</span>
              </div>

              <h3 className="text-lg font-bold text-white mb-1">{app.store_name}</h3>
              <p className="text-xs text-slate-400 mb-4">Owner: <strong className="text-slate-200">{app.users?.name || 'Unknown'}</strong></p>

              <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 text-xs space-y-2 mb-6">
                <div className="flex justify-between">
                  <span className="text-slate-400">Email:</span>
                  <span className="text-blue-400 font-bold truncate max-w-[150px]">{app.users?.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Phone:</span>
                  <span className="text-purple-400 font-bold">{app.users?.phone || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Total Sales:</span>
                  <span className="text-emerald-400 font-bold">৳ {app.total_sales || 0}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t border-slate-800">
              <button 
                onClick={() => handleToggle(app.user_id, app.is_approved, app.store_name)}
                className={`flex-1 text-xs font-bold py-2.5 rounded-xl transition ${app.is_approved ? 'bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30'}`}
              >
                {app.is_approved ? 'Revoke Access' : 'Approve Seller'}
              </button>
            </div>
          </div>
        ))}
        {sellers.length === 0 && (
          <div className="col-span-full bg-slate-950 p-12 rounded-2xl border border-slate-800 text-center text-slate-500">
            No sellers found.
          </div>
        )}
      </div>
    </div>
  );
}
