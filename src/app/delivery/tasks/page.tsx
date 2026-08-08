'use client';

import Link from 'next/link';
import React from 'react';

export default function DeliveryTasksOverview() {
  const routePoints = [
    { id: 'start', type: 'location', label: 'Current Location', address: 'Agent Location (Uttara)', time: '09:00 AM', status: 'completed' },
    { id: 'pick-84392', type: 'pickup', label: 'Pickup from Seller', address: 'Banani Supermarket', time: '09:45 AM', status: 'next' },
    { id: 'drop-84392', type: 'dropoff', label: 'Dropoff (ORD-84392)', address: 'House 42, Road 11, Banani', time: '10:15 AM', status: 'pending' },
    { id: 'pick-98214', type: 'pickup', label: 'Pickup from Hub', address: 'Gulshan 1 Hub', time: '11:00 AM', status: 'pending' },
    { id: 'drop-98214', type: 'dropoff', label: 'Dropoff (ORD-98214)', address: 'Plot 15, Sector 4, Uttara', time: '11:45 AM', status: 'pending' },
  ];

  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-extrabold text-slate-900">Optimized Route</h1>
        <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">ETA: 2h 45m</span>
      </div>

      {/* Map View Placeholder */}
      <div className="h-48 bg-slate-800 rounded-3xl relative flex items-center justify-center overflow-hidden shadow-lg border border-slate-700">
        <div className="absolute inset-0 opacity-15 bg-[linear-gradient(#94a3b8_1px,transparent_1px),linear-gradient(90deg,#94a3b8_1px,transparent_1px)] bg-[size:20px_20px]"></div>
        
        {/* Mock Route Line */}
        <div className="absolute inset-0 flex items-center justify-center">
          <svg className="w-full h-full opacity-60" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path d="M10 80 Q 30 20 50 50 T 90 20" fill="none" stroke="#3b82f6" strokeWidth="3" strokeDasharray="5,5" className="animate-pulse" />
          </svg>
        </div>

        <div className="relative z-10 flex gap-12 items-center">
          <div className="text-2xl drop-shadow-xl animate-bounce">📍</div>
          <div className="text-2xl drop-shadow-xl">🏪</div>
          <div className="text-2xl drop-shadow-xl">🏠</div>
        </div>
        
        <div className="absolute bottom-3 right-3 bg-slate-900 text-white px-3 py-1 rounded-full shadow-lg text-[10px] font-bold border border-slate-700 opacity-90">
          Live Traffic: Fast
        </div>
      </div>

      {/* Route List */}
      <section className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200">
        <h2 className="text-sm font-bold text-slate-900 mb-4">Today's Schedule</h2>
        
        <div className="relative">
          {/* Vertical Line */}
          <div className="absolute left-[15px] top-4 bottom-4 w-0.5 bg-slate-200"></div>
          
          <div className="space-y-6 relative z-10">
            {routePoints.map((point, index) => (
              <div key={point.id} className="flex gap-4 items-start">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border-4 border-white shadow-sm ${
                  point.status === 'completed' ? 'bg-slate-300 text-white' : 
                  point.status === 'next' ? 'bg-blue-600 text-white animate-pulse' : 
                  'bg-white border-slate-300 text-slate-400'
                }`}>
                  {point.status === 'completed' ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                  ) : point.type === 'pickup' ? (
                    <span className="text-[10px] font-bold">↑</span>
                  ) : point.type === 'dropoff' ? (
                    <span className="text-[10px] font-bold">↓</span>
                  ) : (
                    <div className="w-2.5 h-2.5 rounded-full bg-current"></div>
                  )}
                </div>
                
                <div className="flex-1 pt-1">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className={`font-bold text-sm ${point.status === 'completed' ? 'text-slate-400 line-through' : 'text-slate-900'}`}>
                      {point.label}
                    </h3>
                    <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                      {point.time}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">{point.address}</p>
                  
                  {point.status === 'next' && (
                    <div className="mt-3">
                      <Link 
                        href={`/delivery/tasks/${point.id.replace(/^(pick-|drop-)/, '')}`}
                        className="inline-block px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-lg shadow-md hover:bg-slate-800 transition"
                      >
                        View Details & Navigate
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
