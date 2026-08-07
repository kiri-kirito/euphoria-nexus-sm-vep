'use client';

import React from 'react';

export default function DeliveryProfile() {
  return (
    <div className="p-4 space-y-6">
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm text-center">
        <div className="w-20 h-20 bg-blue-600 text-white rounded-2xl flex items-center justify-center font-extrabold text-2xl mx-auto mb-3 shadow-lg shadow-blue-500/30">
          KA
        </div>
        <h2 className="font-bold text-slate-900 text-lg">Karim Ahmed</h2>
        <p className="text-xs text-slate-500 font-semibold">Delivery Partner • ID #104</p>
        <span className="inline-block mt-2 bg-emerald-100 text-emerald-800 text-[10px] font-bold px-3 py-1 rounded-full">
          Verified Agent (Rating: 4.9 ★)
        </span>
      </div>

      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3 text-xs">
        <div className="flex justify-between py-2 border-b border-slate-100">
          <span className="text-slate-500">Vehicle Type:</span>
          <span className="font-bold text-slate-800">Motorcycle (Dhaka Metro-HA)</span>
        </div>
        <div className="flex justify-between py-2 border-b border-slate-100">
          <span className="text-slate-500">Assigned Zone:</span>
          <span className="font-bold text-slate-800">Banani, Gulshan, Uttara</span>
        </div>
        <div className="flex justify-between py-2 border-b border-slate-100">
          <span className="text-slate-500">Phone:</span>
          <span className="font-bold text-slate-800">01711-223344</span>
        </div>
        <div className="flex justify-between py-2">
          <span className="text-slate-500">bKash Payout Account:</span>
          <span className="font-bold text-purple-600">01711-223344</span>
        </div>
      </div>
    </div>
  );
}
