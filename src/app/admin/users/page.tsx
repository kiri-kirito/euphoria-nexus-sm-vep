'use client';

import React, { useState } from 'react';

export default function AdminUsers() {
  const [users, setUsers] = useState([
    { id: 'usr-1', name: 'Tanvir Hossain', email: 'tanvir@gmail.com', role: 'Buyer', status: 'Active', joined: 'Jan 12, 2026', orders: 14 },
    { id: 'usr-2', name: 'Tech Haven BD', email: 'support@techhaven.bd', role: 'Seller', status: 'Active', joined: 'Feb 01, 2026', orders: 84 },
    { id: 'usr-3', name: 'Karim Ahmed', email: 'karim@delivery.com', role: 'Delivery Agent', status: 'Active', joined: 'Mar 15, 2026', orders: 142 },
    { id: 'usr-4', name: 'Sabrina Islam', email: 'sabrina@support.com', role: 'Support Staff', status: 'Active', joined: 'Apr 02, 2026', orders: 0 },
    { id: 'usr-5', name: 'Fake Account Test', email: 'spammer@temp.com', role: 'Buyer', status: 'Banned', joined: 'Aug 04, 2026', orders: 0 },
  ]);

  const [toast, setToast] = useState<string | null>(null);

  const toggleUserStatus = (id: string) => {
    setUsers(prev => prev.map(u => {
      if (u.id === id) {
        const nextStatus = u.status === 'Active' ? 'Banned' : 'Active';
        setToast(`User "${u.name}" status changed to ${nextStatus}`);
        return { ...u, status: nextStatus };
      }
      return u;
    }));
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <div className="space-y-6">
      {toast && (
        <div className="fixed bottom-6 right-6 bg-blue-600 text-white text-xs font-bold px-4 py-3 rounded-xl shadow-2xl z-50 animate-bounce">
          {toast}
        </div>
      )}

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">User Management</h1>
          <p className="text-xs text-slate-400 mt-1">Manage platform buyers, sellers, agents, and support staff.</p>
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Search users..."
            className="bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-2 text-xs outline-none focus:border-blue-500"
          />
        </div>
      </div>

      <div className="bg-slate-950 rounded-2xl border border-slate-800 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/80 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-4">User</th>
                <th className="p-4">Role</th>
                <th className="p-4">Total Activity</th>
                <th className="p-4">Joined Date</th>
                <th className="p-4">Status</th>
                <th className="p-4">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300 font-medium">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-900/50 transition">
                  <td className="p-4">
                    <div className="font-bold text-white">{u.name}</div>
                    <div className="text-[11px] text-slate-500">{u.email}</div>
                  </td>
                  <td className="p-4">
                    <span className="bg-slate-900 text-blue-400 text-[10px] font-bold px-2.5 py-1 rounded-md border border-slate-800">
                      {u.role}
                    </span>
                  </td>
                  <td className="p-4 font-semibold text-slate-300">{u.orders} transactions</td>
                  <td className="p-4 text-slate-500">{u.joined}</td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      u.status === 'Active' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'
                    }`}>
                      {u.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <button 
                      onClick={() => toggleUserStatus(u.id)}
                      className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition ${
                        u.status === 'Active' 
                          ? 'bg-red-500/10 text-red-400 border-red-500/30 hover:bg-red-500/20' 
                          : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                      }`}
                    >
                      {u.status === 'Active' ? 'Ban User' : 'Unban User'}
                    </button>
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
