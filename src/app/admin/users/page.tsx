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
  const [showAgentModal, setShowAgentModal] = useState(false);
  const [newAgent, setNewAgent] = useState({ name: '', email: '', role: 'Delivery Agent' });

  const handleCreateAgent = () => {
    if (!newAgent.name || !newAgent.email) {
      setToast('Please fill out all fields.');
      setTimeout(() => setToast(null), 3000);
      return;
    }
    
    const newUser = {
      id: `usr-${Date.now()}`,
      name: newAgent.name,
      email: newAgent.email,
      role: newAgent.role,
      status: 'Active',
      joined: 'Just now',
      orders: 0
    };
    
    setUsers([newUser, ...users]);
    setShowAgentModal(false);
    setNewAgent({ name: '', email: '', role: 'Delivery Agent' });
    setToast(`${newAgent.role} account created successfully!`);
    setTimeout(() => setToast(null), 3000);
  };

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
          <button 
            onClick={() => setShowAgentModal(true)}
            className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-4 py-2 rounded-xl transition shadow-lg shadow-blue-600/30 whitespace-nowrap"
          >
            + Create Agent
          </button>
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

      {/* Create Agent Modal */}
      {showAgentModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <h2 className="text-lg font-bold text-white mb-1">Create Internal Agent</h2>
            <p className="text-xs text-slate-400 mb-6">Create an account for a new Delivery Agent or Support Staff.</p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Full Name</label>
                <input 
                  type="text"
                  value={newAgent.name}
                  onChange={(e) => setNewAgent({...newAgent, name: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-2.5 text-xs outline-none focus:border-blue-500"
                  placeholder="e.g. Rahim Uddin"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Email Address</label>
                <input 
                  type="email"
                  value={newAgent.email}
                  onChange={(e) => setNewAgent({...newAgent, email: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-2.5 text-xs outline-none focus:border-blue-500"
                  placeholder="agent@euphorianexus.com"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Assign Role</label>
                <select 
                  value={newAgent.role}
                  onChange={(e) => setNewAgent({...newAgent, role: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-2.5 text-xs outline-none focus:border-blue-500"
                >
                  <option value="Delivery Agent">Delivery Agent</option>
                  <option value="Support Staff">Support Staff</option>
                </select>
              </div>
            </div>

            <div className="mt-4 p-3 bg-blue-500/10 rounded-xl border border-blue-500/20 flex items-start gap-3">
              <svg className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                An auto-generated <strong className="text-slate-300">default password</strong> will be emailed to this address. The agent will be prompted to change their password upon their first login.
              </p>
            </div>

            <div className="flex gap-3 mt-6">
              <button 
                onClick={() => setShowAgentModal(false)}
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold py-2.5 rounded-xl transition"
              >
                Cancel
              </button>
              <button 
                onClick={handleCreateAgent}
                className="flex-1 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold py-2.5 rounded-xl transition shadow-lg shadow-blue-600/30"
              >
                Create Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
