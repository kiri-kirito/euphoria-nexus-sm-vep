'use client';

import React from 'react';

export default function AdminDashboard() {
  const stats = [
    { title: 'Total GMV (Sales)', value: '৳ 42,85,000', change: '+18.4%', isUp: true, icon: '💰' },
    { title: 'Platform Commission (5%)', value: '৳ 2,14,250', change: '+22.1%', isUp: true, icon: '📈' },
    { title: 'Active Sellers', value: '148 Verified', change: '+12 this week', isUp: true, icon: '🏪' },
    { title: 'Total Buyers', value: '3,840 Users', change: '+142 today', isUp: true, icon: '👥' },
  ];

  const recentTransactions = [
    { id: '#TRX-9821', seller: 'Tech Haven BD', buyer: 'Tanvir Hossain', amount: '৳ 32,000', fee: '৳ 1,600', status: 'Completed', date: '10 mins ago' },
    { id: '#TRX-9820', seller: 'MetalCraft BD Ltd.', buyer: 'Rahim Group', amount: '৳ 4,50,000', fee: '৳ 22,500', status: 'Completed', date: '45 mins ago' },
    { id: '#TRX-9819', seller: 'AudioWorld BD', buyer: 'Nusrat Jahan', amount: '৳ 9,500', fee: '৳ 475', status: 'Processing', date: '2 hours ago' },
    { id: '#TRX-9818', seller: 'GamerZone BD', buyer: 'Shakib Al Hasan', amount: '৳ 14,000', fee: '৳ 700', status: 'Completed', date: '4 hours ago' },
  ];

  return (
    <div className="space-y-8">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">System Performance & Revenue</h1>
          <p className="text-xs text-slate-400 mt-1">Real-time marketplace telemetry and commission metrics.</p>
        </div>
        <div className="flex gap-2">
          <button className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold px-4 py-2 rounded-xl border border-slate-700 transition">
            Export Report (.CSV)
          </button>
          <button className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-4 py-2 rounded-xl transition shadow-lg shadow-blue-600/30">
            System Settings
          </button>
        </div>
      </div>

      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((s, idx) => (
          <div key={idx} className="bg-slate-950 p-6 rounded-2xl border border-slate-800 shadow-xl relative overflow-hidden group">
            <div className="flex justify-between items-start mb-4">
              <span className="text-xs font-semibold text-slate-400">{s.title}</span>
              <span className="text-2xl p-2 bg-slate-900 rounded-xl border border-slate-800">{s.icon}</span>
            </div>
            <div className="text-2xl font-extrabold text-white mb-2">{s.value}</div>
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              <span>{s.change}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Analytics Chart & Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Revenue Flex Chart */}
        <div className="lg:col-span-2 bg-slate-950 p-6 rounded-2xl border border-slate-800 shadow-xl">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="font-bold text-white text-base">Monthly Commission Growth (2026)</h3>
              <p className="text-xs text-slate-400">Platform earnings from 5% transaction fees</p>
            </div>
            <span className="bg-blue-500/10 text-blue-400 text-xs font-bold px-3 py-1 rounded-full border border-blue-500/20">
              ৳ 2,14,250 Total
            </span>
          </div>

          {/* Flex CSS Bar Chart */}
          <div className="h-48 flex items-end justify-between gap-4 pt-6 px-2 border-b border-slate-800 pb-2">
            {[
              { label: 'Week 1', height: '40%', val: '৳ 38K' },
              { label: 'Week 2', height: '65%', val: '৳ 52K' },
              { label: 'Week 3', height: '85%', val: '৳ 71K' },
              { label: 'Week 4', height: '60%', val: '৳ 53K' },
            ].map((bar, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                <span className="text-[10px] text-slate-400 font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                  {bar.val}
                </span>
                <div 
                  className="w-full bg-gradient-to-t from-blue-700 via-indigo-500 to-blue-400 rounded-t-xl transition-all duration-500 group-hover:brightness-125"
                  style={{ height: bar.height }}
                ></div>
                <span className="text-xs text-slate-400 font-medium mt-2">{bar.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Category Share */}
        <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 shadow-xl flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-white text-base mb-1">Top Selling Categories</h3>
            <p className="text-xs text-slate-400 mb-6">Marketplace GMV distribution</p>

            <div className="space-y-4">
              {[
                { name: 'Industrial & Metals', pct: '48%', color: 'bg-blue-500' },
                { name: 'Electronics & Gadgets', pct: '32%', color: 'bg-purple-500' },
                { name: 'Home & Furniture', pct: '14%', color: 'bg-emerald-500' },
                { name: 'Others', pct: '6%', color: 'bg-slate-600' },
              ].map((c, i) => (
                <div key={i}>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-slate-300">{c.name}</span>
                    <span className="text-white">{c.pct}</span>
                  </div>
                  <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
                    <div className={`${c.color} h-full rounded-full`} style={{ width: c.pct }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800 text-center">
            <span className="text-xs text-slate-400">System Health: <strong className="text-emerald-400">100% Operational</strong></span>
          </div>
        </div>
      </div>

      {/* Recent Transactions Table */}
      <div className="bg-slate-950 rounded-2xl border border-slate-800 shadow-xl overflow-hidden">
        <div className="p-6 border-b border-slate-800 flex justify-between items-center">
          <h3 className="font-bold text-white text-base">Recent Platform Transactions</h3>
          <span className="text-xs text-slate-400">Realtime live feed</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/80 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-4">Transaction ID</th>
                <th className="p-4">Seller Store</th>
                <th className="p-4">Buyer Name</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Platform Fee (5%)</th>
                <th className="p-4">Status</th>
                <th className="p-4">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300 font-medium">
              {recentTransactions.map((trx, idx) => (
                <tr key={idx} className="hover:bg-slate-900/50 transition">
                  <td className="p-4 font-bold text-blue-400">{trx.id}</td>
                  <td className="p-4 text-white font-semibold">{trx.seller}</td>
                  <td className="p-4">{trx.buyer}</td>
                  <td className="p-4 font-extrabold text-white">{trx.amount}</td>
                  <td className="p-4 text-emerald-400 font-bold">{trx.fee}</td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      trx.status === 'Completed' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    }`}>
                      {trx.status}
                    </span>
                  </td>
                  <td className="p-4 text-slate-500">{trx.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
