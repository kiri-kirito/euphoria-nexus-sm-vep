'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';

export default function EscrowManagementPage() {
  const [escrows, setEscrows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function fetchEscrows() {
      const { data, error } = await supabase
        .from('escrow')
        .select(`
          id, amount, status, description, created_at,
          from_seller:users!from_seller_id (name),
          to_seller:users!to_seller_id (name)
        `)
        .order('created_at', { ascending: false });

      if (!error && data) setEscrows(data);
      setLoading(false);
    }
    fetchEscrows();
  }, [supabase]);

  const handleAction = async (id: string, newStatus: string) => {
    await supabase.from('escrow').update({ status: newStatus, updated_at: new Date().toISOString() }).eq('id', id);
    setEscrows((prev) => prev.map((e) => (e.id === id ? { ...e, status: newStatus } : e)));
  };

  if (loading) return <div className="p-8 max-w-6xl mx-auto text-slate-400 animate-pulse">Loading escrow...</div>;

  return (
    <div className="p-8 max-w-6xl mx-auto text-slate-100">
      <h1 className="text-2xl font-bold text-white mb-2">Escrow Management</h1>
      <p className="text-sm text-slate-400 mb-8">Oversee held payments for Inter-Seller Stock Exchanges.</p>

      {escrows.length === 0 ? (
        <p className="text-slate-400">No escrow transactions yet.</p>
      ) : (
        <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-900 border-b border-slate-800 text-slate-400">
              <tr>
                <th className="px-6 py-4">Transaction</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {escrows.map((e) => (
                <tr key={e.id} className="hover:bg-slate-900/50">
                  <td className="px-6 py-4">
                    <div className="text-white">{e.description || 'Stock exchange'}</div>
                    <div className="text-xs text-slate-400 mt-1">
                      {(e.from_seller as { name?: string })?.name} → {(e.to_seller as { name?: string })?.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 font-bold text-teal-400">৳{Number(e.amount).toLocaleString()}</td>
                  <td className="px-6 py-4 capitalize">{e.status}</td>
                  <td className="px-6 py-4 text-right space-x-2">
                    {e.status === 'held' && (
                      <>
                        <button onClick={() => handleAction(e.id, 'released')} className="text-emerald-400 text-xs bg-emerald-500/10 px-3 py-1.5 rounded-lg hover:bg-emerald-500/20 transition font-semibold">
                          Release Funds
                        </button>
                        <button onClick={() => handleAction(e.id, 'refunded')} className="text-rose-400 text-xs bg-rose-500/10 px-3 py-1.5 rounded-lg hover:bg-rose-500/20 transition font-semibold">
                          Reverse / Refund
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
