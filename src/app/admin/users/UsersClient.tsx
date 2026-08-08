'use client';

import React, { useState } from 'react';

export default function UsersClient({ users }: { users: any[] }) {
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');

  const filtered = users.filter(u => {
    if (filter !== 'All' && u.role?.toLowerCase() !== filter.toLowerCase()) return false;
    if (search && !u.name?.toLowerCase().includes(search.toLowerCase()) && !u.email?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const roles = ['All', 'Buyer', 'Seller', 'Agent', 'Support', 'Admin'];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">User Management</h1>
          <p className="text-xs text-slate-400 mt-1">Manage platform buyers, sellers, agents, and support staff.</p>
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Search name/email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-2 text-xs outline-none focus:border-blue-500"
          />
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2">
        {roles.map(r => (
          <button 
            key={r} 
            onClick={() => setFilter(r)} 
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${filter === r ? 'bg-blue-600 text-white' : 'bg-slate-900 text-slate-400 hover:bg-slate-800'}`}
          >
            {r}
          </button>
        ))}
      </div>

      <div className="bg-slate-950 rounded-2xl border border-slate-800 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/80 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-4">User</th>
                <th className="p-4">Role</th>
                <th className="p-4">Phone</th>
                <th className="p-4">Address</th>
                <th className="p-4">Joined Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300 font-medium">
              {filtered.map((u) => (
                <tr key={u.id} className="hover:bg-slate-900/50 transition">
                  <td className="p-4">
                    <div className="font-bold text-white">{u.name || 'Unnamed'}</div>
                    <div className="text-[11px] text-slate-500">{u.email}</div>
                  </td>
                  <td className="p-4">
                    <span className="bg-slate-900 text-blue-400 text-[10px] font-bold px-2.5 py-1 rounded-md border border-slate-800 capitalize">
                      {u.role || 'user'}
                    </span>
                  </td>
                  <td className="p-4 text-slate-300">{u.phone || 'N/A'}</td>
                  <td className="p-4 text-slate-400 truncate max-w-xs">{u.address || 'N/A'}</td>
                  <td className="p-4 text-slate-500">{new Date(u.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={5} className="p-4 text-center text-slate-500">No users found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
