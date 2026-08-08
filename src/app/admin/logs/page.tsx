import React from 'react';
import { createAdminClient } from '@/utils/supabase/server-admin';

export const dynamic = 'force-dynamic';

export default async function AdminLogs() {
  const supabase = createAdminClient();
  
  const { data: orders } = await supabase.from('orders').select('*, users!buyer_id(name)').order('created_at', {ascending:false}).limit(50);
  const { data: complaints } = await supabase.from('complaints').select('*, users!buyer_id(name)').order('created_at', {ascending:false}).limit(50);
  
  const formattedOrders = (orders || []).map(o => ({
    id: o.id,
    type: 'Order',
    action: `Order placed (${o.status})`,
    actor: o.users?.name || 'Unknown',
    target: `Amount: ৳${o.total_amount}`,
    time: new Date(o.created_at)
  }));
  
  const formattedComplaints = (complaints || []).map(c => ({
    id: c.id,
    type: 'Complaint',
    action: `Complaint filed (${c.status})`,
    actor: c.users?.name || 'Unknown',
    target: `Issue: ${c.description?.substring(0, 30)}...`,
    time: new Date(c.created_at)
  }));
  
  const combinedLogs = [...formattedOrders, ...formattedComplaints]
    .sort((a, b) => b.time.getTime() - a.time.getTime())
    .slice(0, 100);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">System Audit & Activity Logs</h1>
        <p className="text-xs text-slate-400 mt-1">Immutable record of platform activity including orders and complaints.</p>
      </div>

      <div className="bg-slate-950 rounded-2xl border border-slate-800 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/80 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-4">Type</th>
                <th className="p-4">Action Event</th>
                <th className="p-4">Triggered By</th>
                <th className="p-4">Details</th>
                <th className="p-4">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300 font-medium">
              {combinedLogs.map((l) => (
                <tr key={l.id} className="hover:bg-slate-900/50 transition">
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      l.type === 'Order' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'
                    }`}>
                      {l.type}
                    </span>
                  </td>
                  <td className="p-4 font-bold text-white">{l.action}</td>
                  <td className="p-4 text-purple-300 font-semibold">{l.actor}</td>
                  <td className="p-4 text-slate-300">{l.target}</td>
                  <td className="p-4 text-slate-500">{l.time.toLocaleString()}</td>
                </tr>
              ))}
              {combinedLogs.length === 0 && (
                <tr><td colSpan={5} className="p-4 text-center text-slate-500">No logs found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
