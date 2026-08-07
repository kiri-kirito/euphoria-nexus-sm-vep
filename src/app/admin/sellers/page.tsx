'use client';

import React, { useState } from 'react';

export default function AdminSellers() {
  const [applications, setApplications] = useState([
    { id: 'app-101', storeName: 'Grand Electro BD', owner: 'Mahmudur Rahman', nid: 'NID-98231441', license: 'TRD-88219/Dhaka', status: 'Pending Verification', date: 'Yesterday' },
    { id: 'app-102', storeName: 'Fashion Hub Outlet', owner: 'Fatema Tuz Zohra', nid: 'NID-11029384', license: 'TRD-44102/Ctg', status: 'Pending Verification', date: '2 days ago' },
    { id: 'app-103', storeName: 'Organic Agro BD', owner: 'Kazi Farhan', nid: 'NID-55491029', license: 'TRD-99102/Sylhet', status: 'Pending Verification', date: '3 days ago' },
  ]);

  const [toast, setToast] = useState<string | null>(null);

  const handleAction = (id: string, action: 'Approved' | 'Rejected') => {
    setApplications(prev => prev.filter(a => a.id !== id));
    setToast(`Seller application ${action} successfully!`);
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
        <p className="text-xs text-slate-400 mt-1">Verify business Trade Licenses and NIDs before granting seller portal access.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {applications.map((app) => (
          <div key={app.id} className="bg-slate-950 p-6 rounded-2xl border border-slate-800 shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-4">
                <span className="text-xs font-bold text-amber-300 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
                  {app.status}
                </span>
                <span className="text-[11px] text-slate-500">{app.date}</span>
              </div>

              <h3 className="text-lg font-bold text-white mb-1">{app.storeName}</h3>
              <p className="text-xs text-slate-400 mb-4">Owner: <strong className="text-slate-200">{app.owner}</strong></p>

              <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 text-xs space-y-2 mb-6">
                <div className="flex justify-between">
                  <span className="text-slate-400">National ID:</span>
                  <span className="font-mono text-blue-400 font-bold">{app.nid}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Trade License:</span>
                  <span className="font-mono text-purple-400 font-bold">{app.license}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t border-slate-800">
              <button 
                onClick={() => handleAction(app.id, 'Rejected')}
                className="flex-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-bold py-2.5 rounded-xl transition"
              >
                Reject
              </button>
              <button 
                onClick={() => handleAction(app.id, 'Approved')}
                className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold py-2.5 rounded-xl transition shadow-lg shadow-emerald-600/30"
              >
                Approve Seller
              </button>
            </div>
          </div>
        ))}
        {applications.length === 0 && (
          <div className="col-span-full bg-slate-950 p-12 rounded-2xl border border-slate-800 text-center text-slate-500">
            No pending seller verification requests.
          </div>
        )}
      </div>
    </div>
  );
}
