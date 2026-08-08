'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';

export default function DeliveryOrdersPage() {
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const supabase = createClient();

  useEffect(() => {
    fetchDeliveries();
  }, []);

  const fetchDeliveries = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      let agentId = user?.id;
      
      if (!agentId) {
        const { data: agents } = await supabase.from('users').select('id').eq('role', 'agent').limit(1);
        agentId = agents?.[0]?.id;
      }

      const { data, error } = await supabase
        .from('deliveries')
        .select('*, orders(id, status, total_amount, shipping_address, users!buyer_id(name, email))')
        .eq('agent_id', agentId)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      setDeliveries(data || []);
    } catch (e) {
      console.log('Using mock deliveries');
      setDeliveries([
        { id: 'd1', status: 'assigned', pickup_address: 'Gulshan 1, Dhaka', delivery_address: 'Mirpur 10, Dhaka', orders: { total_amount: 5500, shipping_address: 'Mirpur 10, Dhaka', users: { name: 'Rahim Khan', email: 'rahim@test.com' } } },
        { id: 'd2', status: 'delivered', pickup_address: 'Banani, Dhaka', delivery_address: 'Uttara Sector 7, Dhaka', orders: { total_amount: 12000, shipping_address: 'Uttara Sector 7, Dhaka', users: { name: 'Nasrin Begum', email: 'nasrin@test.com' } } },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'assigned': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'picked_up': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'in_transit': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'delivered': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      default: return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  if (loading) return <div className="p-4">Loading...</div>;

  const filtered = filter === 'all' ? deliveries : deliveries.filter(d => d.status === filter);

  return (
    <div className="p-4 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-xl font-bold text-slate-900">All Deliveries</h1>
        
        <div className="flex bg-slate-200 p-1 rounded-xl text-xs">
          {['all', 'assigned', 'picked_up', 'in_transit', 'delivered'].map(tab => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                filter === tab ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {tab.replace('_', ' ').toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
              <tr>
                <th className="p-4 font-semibold">Delivery ID</th>
                <th className="p-4 font-semibold">Buyer</th>
                <th className="p-4 font-semibold">Route</th>
                <th className="p-4 font-semibold">Amount</th>
                <th className="p-4 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filtered.map(d => (
                <tr key={d.id} className="hover:bg-slate-50">
                  <td className="p-4 font-medium font-mono text-xs">{d.id.substring(0, 8)}...</td>
                  <td className="p-4">
                    <div className="font-bold text-slate-900">{d.orders?.users?.name}</div>
                    <div className="text-slate-500">{d.orders?.users?.email}</div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-1">
                      <span className="text-blue-500">↑</span> {d.pickup_address}
                    </div>
                    <div className="flex items-center gap-1 mt-1">
                      <span className="text-emerald-500">↓</span> {d.delivery_address}
                    </div>
                  </td>
                  <td className="p-4 font-medium">৳{d.orders?.total_amount}</td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${getStatusColor(d.status)}`}>
                      {d.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
