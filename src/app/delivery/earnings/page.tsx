'use client';

import React from 'react';

export default function DeliveryEarnings() {
  const history = [
    { id: '#ORD-84392', date: 'Today, 4:30 PM', tip: '৳50', deliveryFee: '৳120', total: '৳170' },
    { id: '#ORD-84381', date: 'Today, 2:15 PM', tip: '৳0', deliveryFee: '৳140', total: '৳140' },
    { id: '#ORD-84310', date: 'Yesterday', tip: '৳100', deliveryFee: '৳180', total: '৳280' },
  ];

  return (
    <div className="p-4 space-y-6">
      <div className="bg-slate-950 text-white rounded-3xl p-6 shadow-xl border border-slate-800">
        <h2 className="text-xs font-semibold text-slate-400">Total Agent Balance</h2>
        <div className="text-3xl font-extrabold text-white my-2">৳ 4,850</div>
        <p className="text-xs text-emerald-400 font-semibold">Available for bKash Cashout</p>
      </div>

      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
        <h3 className="font-bold text-slate-900 text-sm">Delivery Payout History</h3>
        <div className="space-y-3">
          {history.map((h, i) => (
            <div key={i} className="flex justify-between items-center text-xs p-3 bg-slate-50 rounded-xl border border-slate-100">
              <div>
                <p className="font-bold text-slate-900">{h.id}</p>
                <p className="text-slate-500 text-[10px]">{h.date}</p>
              </div>
              <div className="text-right">
                <p className="font-extrabold text-emerald-600 text-sm">{h.total}</p>
                <p className="text-slate-400 text-[10px]">Fee: {h.deliveryFee} • Tip: {h.tip}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
