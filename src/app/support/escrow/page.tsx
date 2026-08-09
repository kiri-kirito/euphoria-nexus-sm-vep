'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';

const MOCK_ESCROWS = [
  { id: 'ESC-5001', fromSeller: 'TechHub', toSeller: 'GadgetStore', amount: 4500, status: 'Held', date: '2026-08-08', desc: 'Bulk GPUs' },
  { id: 'ESC-5002', fromSeller: 'WearablesCo', toSeller: 'FashionFiesta', amount: 1200, status: 'Released', date: '2026-08-07', desc: 'Smartwatches' },
  { id: 'ESC-5003', fromSeller: 'HomeGoods', toSeller: 'FurnishingsInc', amount: 3200, status: 'Disputed', date: '2026-08-06', desc: 'Sofa Sets' },
];

export default function EscrowManagementPage() {
  const [escrows, setEscrows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  const [dbActive, setDbActive] = useState(false);

  useEffect(() => {
    async function fetchEscrows() {
      try {
        const { data, error } = await supabase.from('escrow').select('*').order('created_at', { ascending: false });
        if (error) {
          setEscrows(MOCK_ESCROWS);
          setDbActive(false);
        } else if (data) {
          setEscrows(data);
          setDbActive(true);
        }
      } catch (e) {
        setEscrows(MOCK_ESCROWS);
        setDbActive(false);
      } finally {
        setLoading(false);
      }
    }
    fetchEscrows();
  }, [supabase]);

  const handleAction = async (id: string, newStatus: string) => {
    if (dbActive) {
      await supabase.from('escrow').update({ status: newStatus }).eq('id', id);
    }
    setEscrows(escrows.map(e => e.id === id ? { ...e, status: newStatus } : e));
  };

  if (loading) return <div className="p-8 max-w-6xl mx-auto text-slate-100 animate-pulse">Loading escrow transactions...</div>;

  return (
    <div className="p-8 max-w-6xl mx-auto text-slate-100">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Escrow Management</h1>
          <p className="text-sm text-slate-400 mt-1">Oversee held payments for Inter-Seller Stock Exchanges.</p>
        </div>
      </div>

      <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-900 border-b border-slate-800 text-slate-400">
            <tr>
              <th className="px-6 py-4 font-semibold">Escrow ID</th>
              <th className="px-6 py-4 font-semibold">Transaction</th>
              <th className="px-6 py-4 font-semibold">Amount</th>
              <th className="px-6 py-4 font-semibold">Status</th>
              <th className="px-6 py-4 font-semibold">Date</th>
              <th className="px-6 py-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {escrows.map((e) => (
              <tr key={e.id} className="hover:bg-slate-900/50 transition">
                <td className="px-6 py-4 font-mono font-medium text-white">{e.id}</td>
                <td className="px-6 py-4">
                  <div className="text-white font-medium">{e.desc}</div>
                  <div className="text-xs text-slate-400 mt-1">{e.fromSeller} &rarr; {e.toSeller}</div>
                </td>
                <td className="px-6 py-4 font-bold text-teal-400">${e.amount.toLocaleString()}</td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                    e.status === 'Held' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                    e.status === 'Released' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                    'bg-red-500/20 text-red-400 border border-red-500/30'
                  }`}>
                    {e.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-slate-400">{e.date}</td>
                <td className="px-6 py-4 text-right space-x-2">
                  {e.status === 'Held' && (
                    <button onClick={() => handleAction(e.id, 'Released')} className="text-emerald-400 hover:text-emerald-300 font-semibold transition text-xs bg-emerald-500/10 px-3 py-1.5 rounded-lg">
                      Release Funds
                    </button>
                  )}
                  {e.status === 'Disputed' && (
                    <button onClick={() => handleAction(e.id, 'Held')} className="text-amber-400 hover:text-amber-300 font-semibold transition text-xs bg-amber-500/10 px-3 py-1.5 rounded-lg">
                      Review Dispute
                    </button>
                  )}
                  {e.status === 'Released' && (
                    <span className="text-slate-500 text-xs italic">No actions available</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
