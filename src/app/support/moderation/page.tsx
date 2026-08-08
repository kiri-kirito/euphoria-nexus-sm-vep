'use client';

import React, { useState } from 'react';

export default function ModerationPage() {
  const [negotiations, setNegotiations] = useState([
    { id: 'NEG-8001', buyer: 'Alice M.', seller: 'TechHub', product: 'Gaming Laptops (x50)', status: 'Deadlocked', date: '2026-08-08', lastOffer: '$45,000' },
    { id: 'NEG-8002', buyer: 'Bob S.', seller: 'WearablesCo', product: 'Smartwatches (x200)', status: 'Flagged for Review', date: '2026-08-07', lastOffer: '$12,000' },
  ]);

  const handleIntervene = (id: string) => {
    // In a real implementation, this would open a modal to intervene in the negotiation chat
    alert(`Intervening in negotiation ${id}... connecting to chat.`);
    setNegotiations(negotiations.map(n => n.id === id ? { ...n, status: 'Agent Intervened' } : n));
  };

  return (
    <div className="p-8 max-w-6xl mx-auto text-slate-100">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Negotiation Moderation</h1>
          <p className="text-sm text-slate-400 mt-1">Intervene in deadlocked or flagged Bulk Order Negotiations.</p>
        </div>
      </div>

      <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-900 border-b border-slate-800 text-slate-400">
            <tr>
              <th className="px-6 py-4 font-semibold">Negotiation ID</th>
              <th className="px-6 py-4 font-semibold">Parties</th>
              <th className="px-6 py-4 font-semibold">Product</th>
              <th className="px-6 py-4 font-semibold">Last Offer</th>
              <th className="px-6 py-4 font-semibold">Status</th>
              <th className="px-6 py-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {negotiations.map((n) => (
              <tr key={n.id} className="hover:bg-slate-900/50 transition">
                <td className="px-6 py-4 font-mono font-medium text-white">{n.id}</td>
                <td className="px-6 py-4">
                  <div className="text-white font-medium">{n.buyer} (Buyer)</div>
                  <div className="text-xs text-slate-400 mt-1">{n.seller} (Seller)</div>
                </td>
                <td className="px-6 py-4 text-slate-300">{n.product}</td>
                <td className="px-6 py-4 font-bold text-teal-400">{n.lastOffer}</td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                    n.status === 'Deadlocked' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                    n.status === 'Flagged for Review' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                    'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                  }`}>
                    {n.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right space-x-2">
                  <button onClick={() => handleIntervene(n.id)} className="text-teal-400 hover:text-teal-300 font-semibold transition text-xs bg-teal-500/10 px-3 py-1.5 rounded-lg border border-teal-500/30">
                    Intervene in Chat
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
