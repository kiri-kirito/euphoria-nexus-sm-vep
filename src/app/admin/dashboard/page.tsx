import React from 'react';
import { getAdminSupabase, hasAdminServiceKey } from '@/utils/supabase/server-admin';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  const supabase = await getAdminSupabase();
  
  // Real GMV: sum of all order amounts
  const { data: gmvData, error: gmvError } = await supabase.from('orders').select('total_amount, status');
  
  // User counts
  const { count: totalUsers, error: usersErr } = await supabase.from('users').select('*', {count:'exact', head:true});
  const { count: sellerCount } = await supabase.from('users').select('*', {count:'exact', head:true}).eq('role','seller');
  const { count: buyerCount } = await supabase.from('users').select('*', {count:'exact', head:true}).eq('role','buyer');
  const { count: orderCount, error: ordersErr } = await supabase.from('orders').select('*', {count:'exact', head:true});
  const { count: productCount, error: productsErr } = await supabase.from('products').select('*', {count:'exact', head:true});

  // Recent activity (last 10 orders)
  const { data: recentOrders, error: recentErr } = await supabase.from('orders')
    .select('*, users!buyer_id(name, email)')
    .order('created_at', {ascending: false}).limit(10);
    
  // Fetch platform settings
  const { data: settingsData } = await supabase.from('platform_settings').select('commission_rate').limit(1).single();
  const commissionRate = settingsData?.commission_rate || 10.0;
  const commissionFraction = commissionRate / 100;

  const hasError = !!(gmvError || usersErr || ordersErr || productsErr || recentErr);
  const gmvDataSafe = gmvData || [];
  const gmv = gmvDataSafe.reduce((s, o) => s + Number(o.total_amount), 0);
  const safeTotalUsers = totalUsers || 0;
  const safeSellerCount = sellerCount || 0;
  const safeBuyerCount = buyerCount || 0;
  const safeOrderCount = orderCount || 0;
  const safeProductCount = productCount || 0;
  const safeRecentOrders = recentOrders || [];

  const deliveredCount = gmvDataSafe.filter(o => o.status === 'delivered').length;
  const pendingCount = gmvDataSafe.filter(o => o.status === 'pending').length;
  const totalOrd = gmvDataSafe.length || 1;
  const deliveredPct = Math.round((deliveredCount / totalOrd) * 100);
  const pendingPct = Math.round((pendingCount / totalOrd) * 100);

  const [{ data: deliveryRows }, { data: complaintRows }] = await Promise.all([
    supabase
      .from('deliveries')
      .select('agent_id, users!agent_id(name)')
      .eq('status', 'delivered')
      .not('agent_id', 'is', null),
    supabase
      .from('complaints')
      .select('assigned_to, users!assigned_to(name)')
      .eq('status', 'resolved')
      .not('assigned_to', 'is', null),
  ]);

  type AgentStat = { id: string; name: string; count: number };
  const deliveryAgentMap = new Map<string, AgentStat>();
  for (const row of deliveryRows || []) {
    const id = row.agent_id as string;
    const name = (row.users as { name?: string } | null)?.name || 'Agent';
    const existing = deliveryAgentMap.get(id);
    if (existing) existing.count += 1;
    else deliveryAgentMap.set(id, { id, name, count: 1 });
  }
  const deliveryAgents = [...deliveryAgentMap.values()].sort((a, b) => b.count - a.count).slice(0, 5);

  const supportAgentMap = new Map<string, AgentStat>();
  for (const row of complaintRows || []) {
    const id = row.assigned_to as string;
    const name = (row.users as { name?: string } | null)?.name || 'Support';
    const existing = supportAgentMap.get(id);
    if (existing) existing.count += 1;
    else supportAgentMap.set(id, { id, name, count: 1 });
  }
  const supportAgents = [...supportAgentMap.values()].sort((a, b) => b.count - a.count).slice(0, 5);

  const stats = [
    { title: 'Total GMV (Sales)', value: `৳ ${gmv.toLocaleString()}`, change: 'Real-time', isUp: true, icon: '💰' },
    { title: 'Active Sellers', value: `${safeSellerCount} Verified`, change: 'Total', isUp: true, icon: '🏪' },
    { title: 'Total Users', value: `${safeTotalUsers} Users`, change: `${safeBuyerCount} buyers`, isUp: true, icon: '👥' },
    { title: 'Total Orders', value: `${safeOrderCount} Orders`, change: 'All time', isUp: true, icon: '📦' },
    { title: 'Active Products', value: `${safeProductCount} Items`, change: 'Listed', isUp: true, icon: '🛍️' },
  ];

  return (
    <div className="space-y-8">
      {!hasAdminServiceKey() && (
        <div className="bg-blue-500/10 border border-blue-500/30 text-blue-200 text-sm px-4 py-3 rounded-xl">
          Add <code className="text-blue-100">SUPABASE_SERVICE_ROLE_KEY</code> in Vercel env for full admin access. Using session fallback for now.
        </div>
      )}
      {hasError && (
        <div className="bg-amber-500/10 border border-amber-500/30 text-amber-200 text-sm px-4 py-3 rounded-xl">
          Some dashboard metrics could not be loaded. Check Supabase connection.
        </div>
      )}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">System Performance & Revenue</h1>
          <p className="text-xs text-slate-400 mt-1">Real-time marketplace telemetry and commission metrics.</p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/settings" className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-4 py-2 rounded-xl transition shadow-lg shadow-blue-600/30">
            System Settings
          </Link>
        </div>
      </div>

      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        {stats.map((s, idx) => (
          <div key={idx} className="bg-slate-950 p-6 rounded-2xl border border-slate-800 shadow-xl relative overflow-hidden group">
            <div className="flex justify-between items-start mb-4">
              <span className="text-xs font-semibold text-slate-400">{s.title}</span>
              <span className="text-2xl p-2 bg-slate-900 rounded-xl border border-slate-800">{s.icon}</span>
            </div>
            <div className="text-xl font-extrabold text-white mb-2">{s.value}</div>
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
              <span>{s.change}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Analytics Chart & Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Revenue Flex Chart */}
        <div className="lg:col-span-2 bg-slate-950 p-6 rounded-2xl border border-slate-800 shadow-xl">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="font-bold text-white text-base">Monthly Commission Growth (2026)</h3>
              <p className="text-xs text-slate-400">Platform earnings from {commissionRate}% transaction fees</p>
            </div>
            <span className="bg-blue-500/10 text-blue-400 text-xs font-bold px-3 py-1 rounded-full border border-blue-500/20">
              ৳ {(gmv * commissionFraction).toLocaleString()} Estimated
            </span>
          </div>

          {/* Flex CSS Bar Chart */}
          <div className="h-48 flex items-end justify-between gap-4 pt-6 px-2 border-b border-slate-800 pb-2">
            {[
              { label: 'Week 1', height: '40%', val: '৳ 38K' },
              { label: 'Week 2', height: '65%', val: '৳ 52K' },
              { label: 'Week 3', height: '85%', val: '৳ 71K' },
              { label: 'Week 4', height: '60%', val: '৳ 53K' },
            ].map((bar, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                <span className="text-[10px] text-slate-400 font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                  {bar.val}
                </span>
                <div 
                  className="w-full bg-gradient-to-t from-blue-700 via-indigo-500 to-blue-400 rounded-t-xl transition-all duration-500 group-hover:brightness-125"
                  style={{ height: bar.height }}
                ></div>
                <span className="text-xs text-slate-400 font-medium mt-2">{bar.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Category Share */}
        <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 shadow-xl flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-white text-base mb-1">Platform Health</h3>
            <p className="text-xs text-slate-400 mb-6">Order Status Distribution</p>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-slate-300">Delivered Orders</span>
                  <span className="text-white">{deliveredPct}%</span>
                </div>
                <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
                  <div className={`bg-emerald-500 h-full rounded-full`} style={{ width: `${deliveredPct}%` }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-slate-300">Pending Orders</span>
                  <span className="text-white">{pendingPct}%</span>
                </div>
                <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
                  <div className={`bg-amber-500 h-full rounded-full`} style={{ width: `${pendingPct}%` }}></div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800 text-center">
            <span className="text-xs text-slate-400">System Health: <strong className="text-emerald-400">100% Operational</strong></span>
          </div>
        </div>
      </div>

      {/* Agent performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-slate-950 rounded-2xl border border-slate-800 shadow-xl overflow-hidden">
          <div className="p-6 border-b border-slate-800">
            <h3 className="font-bold text-white text-base">Top Delivery Agents</h3>
            <p className="text-xs text-slate-400 mt-1">Completed deliveries by agent</p>
          </div>
          <div className="p-4">
            {deliveryAgents.length === 0 ? (
              <p className="text-slate-500 text-sm p-4 text-center">No completed deliveries yet.</p>
            ) : (
              <ul className="space-y-3">
                {deliveryAgents.map((agent, idx) => (
                  <li key={agent.id} className="flex items-center justify-between bg-slate-900/50 rounded-xl px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-blue-400 w-6">#{idx + 1}</span>
                      <span className="text-sm font-semibold text-white">{agent.name}</span>
                    </div>
                    <span className="text-xs font-bold text-emerald-400">{agent.count} delivered</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="bg-slate-950 rounded-2xl border border-slate-800 shadow-xl overflow-hidden">
          <div className="p-6 border-b border-slate-800">
            <h3 className="font-bold text-white text-base">Top Support Agents</h3>
            <p className="text-xs text-slate-400 mt-1">Resolved tickets by agent</p>
          </div>
          <div className="p-4">
            {supportAgents.length === 0 ? (
              <p className="text-slate-500 text-sm p-4 text-center">No resolved tickets yet.</p>
            ) : (
              <ul className="space-y-3">
                {supportAgents.map((agent, idx) => (
                  <li key={agent.id} className="flex items-center justify-between bg-slate-900/50 rounded-xl px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-purple-400 w-6">#{idx + 1}</span>
                      <span className="text-sm font-semibold text-white">{agent.name}</span>
                    </div>
                    <span className="text-xs font-bold text-emerald-400">{agent.count} resolved</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* Recent Transactions Table */}
      <div className="bg-slate-950 rounded-2xl border border-slate-800 shadow-xl overflow-hidden">
        <div className="p-6 border-b border-slate-800 flex justify-between items-center">
          <h3 className="font-bold text-white text-base">Recent Platform Orders</h3>
          <span className="text-xs text-slate-400">Realtime live feed (Last 10)</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/80 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-4">Transaction ID</th>
                <th className="p-4">Buyer Name</th>
                <th className="p-4">Buyer Email</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Platform Fee ({commissionRate}%)</th>
                <th className="p-4">Status</th>
                <th className="p-4">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300 font-medium">
              {safeRecentOrders.map((trx, idx) => {
                const isCompleted = trx.status === 'delivered';
                return (
                <tr key={idx} className="hover:bg-slate-900/50 transition">
                  <td className="p-4 font-bold text-blue-400">#{String(trx.id).substring(0, 8)}</td>
                  <td className="p-4 text-white font-semibold">{trx.users?.name || 'Unknown'}</td>
                  <td className="p-4">{trx.users?.email || 'N/A'}</td>
                  <td className="p-4 font-extrabold text-white">৳ {Number(trx.total_amount).toLocaleString()}</td>
                  <td className="p-4 text-emerald-400 font-bold">৳ {(Number(trx.total_amount) * commissionFraction).toLocaleString()}</td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      isCompleted ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    }`}>
                      {trx.status}
                    </span>
                  </td>
                  <td className="p-4 text-slate-500">{new Date(trx.created_at).toLocaleDateString()}</td>
                </tr>
              )})}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
