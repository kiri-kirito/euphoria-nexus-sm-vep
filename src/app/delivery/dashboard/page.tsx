'use client';

import Link from 'next/link';
import React from 'react';

export default function DeliveryDashboard() {
  const deliveries = [
    { id: 'ORD-84392', customer: 'Tanvir Hossain', address: 'House 42, Road 11, Banani, Dhaka', phone: '01711-223344', distance: '1.8 km', status: 'Ready for Pickup', pay: '৳120' },
    { id: 'ORD-98214', customer: 'Nusrat Jahan', address: 'Plot 15, Sector 4, Uttara, Dhaka', phone: '01819-887766', distance: '4.2 km', status: 'On the Way', pay: '৳180' },
  ];

  return (
    <div className="p-4 space-y-6">
      {/* Earnings Summary Card */}
      <section className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white rounded-3xl p-6 shadow-xl border border-slate-800">
        <div className="flex justify-between items-start mb-2">
          <span className="text-xs font-semibold text-slate-400">Earnings Today</span>
          <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-2.5 py-1 rounded-full border border-emerald-500/30">
            +18% vs Yesterday
          </span>
        </div>
        <div className="text-3xl font-extrabold text-white mb-4">৳ 1,850</div>
        
        <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-800/80 text-xs">
          <div>
            <span className="text-slate-400">Completed:</span>
            <p className="font-bold text-white text-sm">8 Orders</p>
          </div>
          <div>
            <span className="text-slate-400">Active Duty:</span>
            <p className="font-bold text-blue-400 text-sm">2 Remaining</p>
          </div>
        </div>
      </section>

      {/* Assigned Tasks */}
      <section>
        <div className="flex items-center justify-between mb-4 px-1">
          <h2 className="text-base font-bold text-slate-900">Today's Assigned Deliveries</h2>
          <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">2 Active</span>
        </div>
        
        <div className="space-y-4">
          {deliveries.map((delivery) => (
            <div key={delivery.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 hover:shadow-md transition">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <span className="text-xs font-extrabold text-primary">{delivery.id}</span>
                  <h3 className="font-bold text-slate-900 text-sm">{delivery.customer}</h3>
                </div>
                <span className="bg-amber-50 text-amber-700 border border-amber-200 text-[10px] px-2.5 py-1 rounded-full font-bold">
                  {delivery.status}
                </span>
              </div>
              
              <div className="space-y-2 mb-4 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl">
                <div className="flex items-center gap-2 font-medium">
                  <span className="text-blue-500 font-bold">📍</span> {delivery.address}
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-slate-200 text-[11px]">
                  <span className="text-slate-500">Distance: <strong className="text-slate-800">{delivery.distance}</strong></span>
                  <span className="text-slate-500">Agent Pay: <strong className="text-emerald-600 font-bold">{delivery.pay}</strong></span>
                </div>
              </div>
              
              <Link 
                href={`/delivery/tasks/${delivery.id.split('-')[1]}`} 
                className="block w-full py-3 bg-slate-900 hover:bg-slate-800 text-white text-center rounded-xl font-bold text-xs transition shadow-sm"
              >
                Start / Manage Delivery
              </Link>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
