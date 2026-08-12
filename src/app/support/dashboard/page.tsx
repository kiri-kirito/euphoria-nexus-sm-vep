'use client';

import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';

export default function SupportDashboard() {
  const [filter, setFilter] = useState('All');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    fetchSupportData();
  }, []);

  const fetchSupportData = async () => {
    try {
      const { data: openComplaints, error: openError } = await supabase
        .from('complaints')
        .select('*, users!buyer_id(name, email), orders(total_amount, status)')
        .eq('status', 'open')
        .order('created_at', { ascending: false })
        .limit(20);
      
      const { data: resolvedComplaints, error: resolvedError } = await supabase
        .from('complaints')
        .select('id')
        .eq('status', 'resolved');
        
      if (openError) {
        console.error("Open complaints error", openError);
        throw openError;
      }
      
      setData({
        openTickets: openComplaints || [],
        resolvedCount: resolvedComplaints?.length || 0,
        avgResponseTime: '2.4h',
        satisfaction: 94,
      });
    } catch (e) {
      console.error("Support dashboard fetch error", e);
      setData({ openTickets: [], resolvedCount: 0, avgResponseTime: '—', satisfaction: 0 });
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (ticketId: string) => {
    try {
      await supabase.from('complaints').update({status:'resolved', resolution:'Issue resolved by support agent.'}).eq('id', ticketId);
      setData((prev: any) => ({
        ...prev,
        openTickets: prev.openTickets.filter((t: any) => t.id !== ticketId),
        resolvedCount: prev.resolvedCount + 1
      }));
    } catch (e) {
      console.error(e);
    }
  };

  if (loading || !data) return <div className="p-8 text-white">Loading...</div>;

  const getPriority = (amount: number) => {
    if (!amount) return 'Low';
    if (amount > 10000) return 'High';
    if (amount > 5000) return 'Medium';
    return 'Low';
  };

  const getTimeAgo = (dateStr: string) => {
    const hours = Math.round((Date.now() - new Date(dateStr).getTime()) / 3600000);
    return hours < 1 ? 'Just now' : `${hours}h ago`;
  };

  const filteredTickets = filter === 'All' 
    ? data.openTickets 
    : data.openTickets.filter((t: any) => (filter === 'Open' ? t.status === 'open' : t.status === filter.toLowerCase()));

  return (
    <div className="p-8 h-full overflow-y-auto space-y-6 flex flex-col xl:flex-row gap-6">
      <div className="flex-1 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Customer Support Queue</h1>
            <p className="text-xs text-slate-400 mt-1">Manage buyer disputes, delivery queries, and refund requests.</p>
          </div>
          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            {['All', 'Open', 'Pending', 'Resolved'].map((tab) => (
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

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
            <p className="text-xs text-slate-400">Open Tickets</p>
            <p className="text-2xl font-bold text-teal-400">{data.openTickets.length}</p>
          </div>
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
            <p className="text-xs text-slate-400">Resolved Today</p>
            <p className="text-2xl font-bold text-white">{data.resolvedCount}</p>
          </div>
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
            <p className="text-xs text-slate-400">Avg Response</p>
            <p className="text-2xl font-bold text-white">{data.avgResponseTime}</p>
          </div>
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
            <p className="text-xs text-slate-400">Satisfaction</p>
            <p className="text-2xl font-bold text-emerald-400">{data.satisfaction}%</p>
          </div>
        </div>

        <div className="bg-slate-950 rounded-2xl border border-slate-800 shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/80 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Issue Description</th>
                  <th className="p-4">Priority</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Submitted</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300 font-medium">
                {filteredTickets.map((t: any) => (
                  <tr key={t.id} className="hover:bg-slate-900/50 transition">
                    <td className="p-4 flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center font-bold text-white">
                        {t.users?.name?.charAt(0) || 'U'}
                      </div>
                      <div>
                        <div className="font-bold text-white">{t.users?.name}</div>
                        <div className="text-[10px] text-slate-500">{t.users?.email}</div>
                      </div>
                    </td>
                    <td className="p-4 font-semibold text-slate-200 max-w-xs truncate" title={t.description}>{t.description}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        getPriority(t.orders?.total_amount) === 'High' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                        getPriority(t.orders?.total_amount) === 'Medium' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                        'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                      }`}>
                        {getPriority(t.orders?.total_amount)}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        t.status === 'open' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                        'bg-slate-800 text-slate-400'
                      }`}>
                        {t.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-4 text-slate-500">{getTimeAgo(t.created_at)}</td>
                    <td className="p-4 text-right space-x-2">
                      <button onClick={() => handleResolve(t.id)} className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3.5 py-1.5 rounded-lg transition shadow-md shadow-emerald-600/30 inline-flex items-center gap-1.5">
                        Resolve
                      </button>
                      <Link href={`/support/tickets/${t.id}`} className="bg-teal-600 hover:bg-teal-500 text-white font-bold px-3.5 py-1.5 rounded-lg transition shadow-md shadow-teal-600/30 inline-flex items-center gap-1.5">
                        Reply
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <div className="w-full xl:w-64 flex-shrink-0 space-y-4">
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
          <h3 className="font-bold text-white mb-3">Top Categories</h3>
          <ul className="space-y-2 text-sm text-slate-400">
            <li className="flex justify-between"><span>Damaged Item</span> <span className="text-white font-bold">45%</span></li>
            <li className="flex justify-between"><span>Delivery Delay</span> <span className="text-white font-bold">30%</span></li>
            <li className="flex justify-between"><span>Wrong Item</span> <span className="text-white font-bold">15%</span></li>
            <li className="flex justify-between"><span>Other</span> <span className="text-white font-bold">10%</span></li>
          </ul>
        </div>
      </div>
    </div>
  );
}
