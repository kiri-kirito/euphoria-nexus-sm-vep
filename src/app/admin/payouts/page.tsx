'use client';

import React, { useState } from 'react';

export default function AdminPayouts() {
  const [payouts, setPayouts] = useState([
    { id: 'PAY-8801', seller: 'Tech Haven BD', method: 'bKash Merchant', account: '01711223344', amount: '৳ 45,000', status: 'Pending Approval', date: 'Today' },
    { id: 'PAY-8802', seller: 'AudioWorld BD', method: 'City Bank Wire', account: '110293849102', amount: '৳ 1,20,000', status: 'Pending Approval', date: 'Yesterday' },
    { id: 'PAY-8803', seller: 'MetalCraft BD Ltd.', method: 'BRAC Bank Ltd.', account: '150120394811', amount: '৳ 3,80,000', status: 'Processed', date: '3 days ago' },
  ]);

  const [toast, setToast] = useState<string | null>(null);

  const processPayout = (id: string) => {
    setPayouts(prev => prev.map(p => {
      if (p.id === id) {
        setToast(`Payout ${id} processed successfully! Sent to bKash/Bank.`);
        return { ...p, status: 'Processed' };
      }
      return p;
    }));
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
        <h1 className="text-2xl font-bold text-white tracking-tight">Seller Payout Requests</h1>
        <p className="text-xs text-slate-400 mt-1">Review and disburse weekly seller earnings via bKash, Nagad, or Bank Wire.</p>
      </div>

      <div className="bg-slate-950 rounded-2xl border border-slate-800 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/80 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-4">Payout ID</th>
                <th className="p-4">Seller Store</th>
                <th className="p-4">Payment Method</th>
                <th className="p-4">Account Number</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Status</th>
                <th className="p-4">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300 font-medium">
              {payouts.map((p) => (
                <tr key={p.id} className="hover:bg-slate-900/50 transition">
                  <td className="p-4 font-bold text-blue-400">{p.id}</td>
                  <td className="p-4 font-bold text-white">{p.seller}</td>
                  <td className="p-4 text-purple-300 font-semibold">{p.method}</td>
                  <td className="p-4 font-mono text-slate-400">{p.account}</td>
                  <td className="p-4 font-extrabold text-white text-sm">{p.amount}</td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      p.status === 'Processed' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    }`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="p-4">
                    {p.status === 'Pending Approval' ? (
                      <button 
                        onClick={() => processPayout(p.id)}
                        className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition shadow-md shadow-blue-600/30"
                      >
                        Release Payout
                      </button>
                    ) : (
                      <span className="text-xs text-slate-500 font-semibold">Completed</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
