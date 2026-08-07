'use client';

import Link from 'next/link';
import React, { useState } from 'react';

export default function SupportDashboard() {
  const [filter, setFilter] = useState('All');

  const tickets = [
    { id: 'TCK-101', user: 'Nusrat Jahan', email: 'nusrat@gmail.com', issue: 'Missing item in order #ORD-84392', status: 'Open', priority: 'High', time: '10 mins ago', location: 'Dhaka' },
    { id: 'TCK-102', user: 'Tanvir Hossain', email: 'tanvir@gmail.com', issue: 'Delivery delay inquiry #ORD-98214', status: 'In Progress', priority: 'Medium', time: '45 mins ago', location: 'Chittagong' },
    { id: 'TCK-103', user: 'Shakib Al Hasan', email: 'shakib@gmail.com', issue: 'Defective product replacement request', status: 'Open', priority: 'Critical', time: '2 hours ago', location: 'Sylhet' },
    { id: 'TCK-104', user: 'Rahim Group', email: 'procurement@rahim.bd', issue: 'Bulk order invoice request', status: 'Resolved', priority: 'Low', time: 'Yesterday', location: 'Dhaka' },
  ];

  const filtered = filter === 'All' ? tickets : tickets.filter(t => t.status === filter);

  return (
    <div className="p-8 h-full overflow-y-auto space-y-6">
      {/* Title & Filter Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Customer Support Queue</h1>
          <p className="text-xs text-slate-400 mt-1">Manage buyer disputes, delivery queries, and refund requests.</p>
        </div>
        <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
          {['All', 'Open', 'In Progress', 'Resolved'].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                filter === tab ? 'bg-teal-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Ticket Table */}
      <div className="bg-slate-950 rounded-2xl border border-slate-800 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/80 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-4">Ticket ID</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Issue Description</th>
                <th className="p-4">Priority</th>
                <th className="p-4">Status</th>
                <th className="p-4">Submitted</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300 font-medium">
              {filtered.map((t) => (
                <tr key={t.id} className="hover:bg-slate-900/50 transition">
                  <td className="p-4 font-bold text-teal-400">{t.id}</td>
                  <td className="p-4">
                    <div className="font-bold text-white">{t.user}</div>
                    <div className="text-[10px] text-slate-500">{t.location} • {t.email}</div>
                  </td>
                  <td className="p-4 font-semibold text-slate-200">{t.issue}</td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      t.priority === 'Critical' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                      t.priority === 'High' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                      'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                    }`}>
                      {t.priority}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      t.status === 'Open' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                      t.status === 'In Progress' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' :
                      'bg-slate-800 text-slate-400'
                    }`}>
                      {t.status}
                    </span>
                  </td>
                  <td className="p-4 text-slate-500">{t.time}</td>
                  <td className="p-4 text-right">
                    <Link
                      href={`/support/tickets/${t.id}`}
                      className="bg-teal-600 hover:bg-teal-500 text-white font-bold px-3.5 py-1.5 rounded-lg transition shadow-md shadow-teal-600/30 inline-flex items-center gap-1.5"
                    >
                      <span>Open Ticket</span>
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </Link>
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
