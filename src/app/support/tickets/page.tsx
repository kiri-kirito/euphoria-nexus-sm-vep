'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';

export default function ComplaintsPage() {
  const [complaints, setComplaints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      const { data, error } = await supabase
        .from('complaints')
        .select('*, users!buyer_id(name, email), orders(total_amount)')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      setComplaints(data || []);
    } catch (e) {
      console.error('fetchComplaints error:', e);
      setComplaints([]);
    } finally {
      setLoading(false);
    }
  };

  const getPriority = (amount: number) => {
    if (!amount) return 'Low';
    if (amount > 10000) return 'High';
    if (amount > 5000) return 'Medium';
    return 'Low';
  };

  if (loading) return <div className="p-8 max-w-6xl mx-auto text-slate-100">Loading...</div>;

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
                <td className="px-6 py-4 font-mono font-medium text-white">{c.id.substring(0, 8)}...</td>
                <td className="px-6 py-4">
                  <div className="font-bold">{c.users?.name}</div>
                  <div className="text-xs text-slate-500">{c.users?.email}</div>
                </td>
                <td className="px-6 py-4 text-slate-300 max-w-xs truncate" title={c.description}>{c.description}</td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                    getPriority(c.orders?.total_amount) === 'High' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                    getPriority(c.orders?.total_amount) === 'Medium' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                    'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                  }`}>
                    {getPriority(c.orders?.total_amount)}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                    c.status === 'open' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                    'bg-slate-800 text-slate-400 border border-slate-700'
                  }`}>
                    {c.status.toUpperCase()}
                  </span>
                </td>
                <td className="px-6 py-4 text-slate-400">{new Date(c.created_at).toLocaleDateString()}</td>
                <td className="px-6 py-4 text-right">
                  <Link href={`/support/tickets/${c.id}`} className="text-teal-400 hover:text-teal-300 font-semibold transition">
                    Details
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
