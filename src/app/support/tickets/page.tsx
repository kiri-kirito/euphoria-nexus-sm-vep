'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function ComplaintsPage() {
  const [complaints] = useState([
    { id: 'TKT-1001', buyer: 'Alice M.', issue: 'Item damaged during delivery', status: 'Open', priority: 'High', date: '2026-08-08' },
    { id: 'TKT-1002', buyer: 'Bob S.', issue: 'Wrong item received', status: 'In Progress', priority: 'Medium', date: '2026-08-07' },
    { id: 'TKT-1003', buyer: 'Charlie D.', issue: 'Delivery delayed by 2 days', status: 'Closed', priority: 'Low', date: '2026-08-05' },
  ]);

  return (
    <div className="p-8 max-w-6xl mx-auto text-slate-100">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Buyer Complaints</h1>
          <p className="text-sm text-slate-400 mt-1">View and resolve buyer issues and disputes.</p>
        </div>
      </div>

      <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-900 border-b border-slate-800 text-slate-400">
            <tr>
              <th className="px-6 py-4 font-semibold">Ticket ID</th>
              <th className="px-6 py-4 font-semibold">Buyer</th>
              <th className="px-6 py-4 font-semibold">Issue</th>
              <th className="px-6 py-4 font-semibold">Priority</th>
              <th className="px-6 py-4 font-semibold">Status</th>
              <th className="px-6 py-4 font-semibold">Date</th>
              <th className="px-6 py-4 font-semibold text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {complaints.map((c) => (
              <tr key={c.id} className="hover:bg-slate-900/50 transition">
                <td className="px-6 py-4 font-mono font-medium text-white">{c.id}</td>
                <td className="px-6 py-4">{c.buyer}</td>
                <td className="px-6 py-4 text-slate-300">{c.issue}</td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                    c.priority === 'High' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                    c.priority === 'Medium' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                    'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                  }`}>
                    {c.priority}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                    c.status === 'Open' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                    c.status === 'In Progress' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' :
                    'bg-slate-800 text-slate-400 border border-slate-700'
                  }`}>
                    {c.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-slate-400">{c.date}</td>
                <td className="px-6 py-4 text-right">
                  <Link href={`/support/tickets/${c.id.split('-')[1]}`} className="text-teal-400 hover:text-teal-300 font-semibold transition">
                    Resolve
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
