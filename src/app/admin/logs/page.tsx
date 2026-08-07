'use client';

import React from 'react';

export default function AdminLogs() {
  const logs = [
    { id: 'LOG-9921', action: 'Approved Seller Account', actor: 'Super Admin', target: 'Tech Haven BD', time: '12 mins ago', ip: '103.48.16.2' },
    { id: 'LOG-9920', action: 'Released bKash Payout (৳45,000)', actor: 'Super Admin', target: 'AudioWorld BD', time: '1 hour ago', ip: '103.48.16.2' },
    { id: 'LOG-9919', action: 'Banned Suspicious User', actor: 'System Auto-Guard', target: 'spammer@temp.com', time: '3 hours ago', ip: '185.220.101.4' },
    { id: 'LOG-9918', action: 'Updated Commission Rate (5%)', actor: 'Super Admin', target: 'System Config', time: 'Yesterday', ip: '103.48.16.2' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">System Audit & Security Logs</h1>
        <p className="text-xs text-slate-400 mt-1">Immutable record of admin operations, payout releases, and security events.</p>
      </div>

      <div className="bg-slate-950 rounded-2xl border border-slate-800 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/80 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-4">Log ID</th>
                <th className="p-4">Action Event</th>
                <th className="p-4">Triggered By</th>
                <th className="p-4">Target Resource</th>
                <th className="p-4">IP Address</th>
                <th className="p-4">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300 font-medium">
              {logs.map((l) => (
                <tr key={l.id} className="hover:bg-slate-900/50 transition">
                  <td className="p-4 font-mono font-bold text-blue-400">{l.id}</td>
                  <td className="p-4 font-bold text-white">{l.action}</td>
                  <td className="p-4 text-purple-300 font-semibold">{l.actor}</td>
                  <td className="p-4 text-slate-300">{l.target}</td>
                  <td className="p-4 font-mono text-slate-500">{l.ip}</td>
                  <td className="p-4 text-slate-500">{l.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
