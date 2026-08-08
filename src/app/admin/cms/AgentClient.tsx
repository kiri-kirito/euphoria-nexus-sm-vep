'use client';

import React, { useState } from 'react';

export default function AgentClient({ deliveryAgents, supportAgents }: { deliveryAgents: any[], supportAgents: any[] }) {
  const [activeTab, setActiveTab] = useState<'delivery' | 'support'>('delivery');
  const [toast, setToast] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', role: 'delivery', password: '' });

  const handleCreateAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/admin/create-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      if (res.ok) {
        setToast('Agent created successfully! Refresh to see changes.');
        setForm({ name: '', email: '', role: 'delivery', password: '' });
      } else {
        const err = await res.json();
        setToast('Error: ' + err.error);
      }
    } catch (err: any) {
      setToast('Error creating agent');
    } finally {
      setLoading(false);
      setTimeout(() => setToast(null), 3000);
    }
  };

  return (
    <div className="space-y-6">
      {toast && (
        <div className="fixed bottom-6 right-6 bg-blue-600 text-white text-xs font-bold px-4 py-3 rounded-xl shadow-2xl z-50">
          {toast}
        </div>
      )}

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Agent Management</h1>
          <p className="text-xs text-slate-400 mt-1">Manage Delivery Agents and Support Staff accounts.</p>
        </div>
      </div>

      {/* Create Agent Form */}
      <form onSubmit={handleCreateAgent} className="bg-slate-950 p-6 rounded-2xl border border-slate-800 shadow-xl space-y-4">
        <h3 className="font-bold text-white text-base">Create New Agent</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input type="text" placeholder="Full Name" required value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="bg-slate-900 border border-slate-800 text-white rounded-xl p-3 text-xs outline-none focus:border-blue-500" />
          <input type="email" placeholder="Email" required value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="bg-slate-900 border border-slate-800 text-white rounded-xl p-3 text-xs outline-none focus:border-blue-500" />
          <input type="text" placeholder="Temporary Password" required minLength={6} value={form.password} onChange={e => setForm({...form, password: e.target.value})} className="bg-slate-900 border border-slate-800 text-white rounded-xl p-3 text-xs outline-none focus:border-blue-500" />
          <select value={form.role} onChange={e => setForm({...form, role: e.target.value})} className="bg-slate-900 border border-slate-800 text-white rounded-xl p-3 text-xs outline-none focus:border-blue-500">
            <option value="delivery">Delivery Agent</option>
            <option value="support">Support Agent</option>
          </select>
        </div>
        <button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-bold px-6 py-3 rounded-xl transition">
          {loading ? 'Creating...' : 'Create Agent Account'}
        </button>
      </form>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-slate-800">
        <button onClick={() => setActiveTab('delivery')} className={`pb-3 text-sm font-bold ${activeTab === 'delivery' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-slate-500'}`}>Delivery Agents</button>
        <button onClick={() => setActiveTab('support')} className={`pb-3 text-sm font-bold ${activeTab === 'support' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-slate-500'}`}>Support Agents</button>
      </div>

      {/* Tables */}
      <div className="bg-slate-950 rounded-2xl border border-slate-800 shadow-xl overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-900/80 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-800">
            <tr>
              <th className="p-4">Name</th>
              <th className="p-4">Email</th>
              <th className="p-4">Phone</th>
              <th className="p-4">Status</th>
              <th className="p-4">{activeTab === 'delivery' ? 'Completed Deliveries' : 'Resolved Tickets'}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-slate-300 font-medium">
            {(activeTab === 'delivery' ? deliveryAgents : supportAgents).map((agent, idx) => {
              const isOnline = agent.status === 'online';
              let count = 0;
              if (activeTab === 'delivery') {
                count = agent.deliveries?.filter((d: any) => d.status === 'delivered').length || 0;
              } else {
                count = agent.complaints?.filter((c: any) => c.status === 'resolved').length || 0;
              }
              return (
                <tr key={agent.id || idx} className="hover:bg-slate-900/50">
                  <td className="p-4 text-white font-bold">{agent.name}</td>
                  <td className="p-4">{agent.email}</td>
                  <td className="p-4">{agent.phone || 'N/A'}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${isOnline ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400'}`}>
                      {isOnline ? 'Online' : 'Offline'}
                    </span>
                  </td>
                  <td className="p-4">{count}</td>
                </tr>
              );
            })}
            {(activeTab === 'delivery' ? deliveryAgents : supportAgents).length === 0 && (
              <tr><td colSpan={5} className="p-4 text-center text-slate-500">No agents found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
