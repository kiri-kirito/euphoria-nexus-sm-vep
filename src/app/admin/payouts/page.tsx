import React from 'react';
import { getAdminSupabase } from '@/utils/supabase/server-admin';

export const dynamic = 'force-dynamic';

export default async function AdminPayouts() {
  const supabase = await getAdminSupabase();
  const { data: payments } = await supabase
    .from('payments')
    .select('*, orders(status, buyer_id, users!buyer_id(name))')
    .order('created_at', {ascending:false})
    .limit(100);

  const { data: commissionLogs } = await supabase
    .from('commission_logs')
    .select('*, orders(id), users!seller_id(name)')
    .order('created_at', { ascending: false })
    .limit(100);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Platform Payments</h1>
        <p className="text-xs text-slate-400 mt-1">Review live payments processed across the platform.</p>
      </div>

      <div className="bg-slate-950 rounded-2xl border border-slate-800 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/80 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-4">Payment ID</th>
                <th className="p-4">Order ID</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Buyer Name</th>
                <th className="p-4">Status</th>
                <th className="p-4">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300 font-medium">
              {(payments || []).map((p) => {
                const orderData = Array.isArray(p.orders) ? p.orders[0] : p.orders;
                return (
                <tr key={p.id} className="hover:bg-slate-900/50 transition">
                  <td className="p-4 font-bold text-blue-400">#{p.id.substring(0, 8)}</td>
                  <td className="p-4 font-mono text-slate-400">#{p.order_id?.substring(0, 8)}</td>
                  <td className="p-4 font-extrabold text-white text-sm">৳ {p.amount}</td>
                  <td className="p-4 font-bold text-white">{orderData?.users?.name || 'Unknown'}</td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      p.status === 'completed' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    }`}>
                      {p.status || 'pending'}
                    </span>
                  </td>
                  <td className="p-4 text-slate-500">{new Date(p.created_at).toLocaleString()}</td>
                </tr>
              )})}
              {(payments || []).length === 0 && (
                <tr><td colSpan={6} className="p-4 text-center text-slate-500">No payments found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-bold text-white tracking-tight mb-1">Commission Logs</h2>
        <p className="text-xs text-slate-400 mb-4">Platform commission deducted per completed order.</p>
      </div>

      <div className="bg-slate-950 rounded-2xl border border-slate-800 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/80 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-4">Order</th>
                <th className="p-4">Seller</th>
                <th className="p-4">Order Total</th>
                <th className="p-4">Commission</th>
                <th className="p-4">Rate</th>
                <th className="p-4">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300 font-medium">
              {(commissionLogs || []).map((log) => {
                const seller = Array.isArray(log.users) ? log.users[0] : log.users;
                return (
                  <tr key={log.id} className="hover:bg-slate-900/50 transition">
                    <td className="p-4 font-mono text-slate-400">#{log.order_id?.substring(0, 8)}</td>
                    <td className="p-4 font-bold text-white">{seller?.name || 'Unknown'}</td>
                    <td className="p-4">৳ {log.gross_amount}</td>
                    <td className="p-4 font-extrabold text-emerald-400">৳ {log.commission_amount}</td>
                    <td className="p-4">{log.commission_rate}%</td>
                    <td className="p-4 text-slate-500">{new Date(log.created_at).toLocaleString()}</td>
                  </tr>
                );
              })}
              {(commissionLogs || []).length === 0 && (
                <tr><td colSpan={6} className="p-4 text-center text-slate-500">No commission logs yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
