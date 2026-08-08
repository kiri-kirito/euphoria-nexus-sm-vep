'use client';

import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';

const MOCK_DELIVERY_DATA = {
  activeDeliveries: [
    { id: 'd1', status: 'assigned', pickup_address: 'Gulshan 1, Dhaka', delivery_address: 'Mirpur 10, Dhaka', orders: { total_amount: 5500, shipping_address: 'Mirpur 10, Dhaka', users: { name: 'Rahim Khan', phone: '01712345678' } } },
    { id: 'd2', status: 'picked_up', pickup_address: 'Banani, Dhaka', delivery_address: 'Uttara Sector 7, Dhaka', orders: { total_amount: 12000, shipping_address: 'Uttara Sector 7, Dhaka', users: { name: 'Nasrin Begum', phone: '01898765432' } } },
    { id: 'd3', status: 'in_transit', pickup_address: 'Dhanmondi 27, Dhaka', delivery_address: 'Mohammadpur, Dhaka', orders: { total_amount: 3200, shipping_address: 'Mohammadpur, Dhaka', users: { name: 'Kamal Hossain', phone: '01556789012' } } },
  ],
  completedToday: 8,
  earnings: 1200,
  rating: 4.8,
};

export default function DeliveryDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    fetchDeliveryData();
  }, []);

  const fetchDeliveryData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      let agentId = user?.id;
      
      if (!agentId) {
        const { data: agents } = await supabase.from('users').select('id').eq('role', 'agent').limit(1);
        agentId = agents?.[0]?.id;
      }
      
      const { data: activeDeliveries, error: activeErr } = await supabase
        .from('deliveries')
        .select('*, orders(id, total_amount, status, shipping_address, users!buyer_id(name, phone))')
        .eq('agent_id', agentId)
        .not('status', 'eq', 'delivered')
        .order('created_at', { ascending: false })
        .limit(10);
      
      const { count: completedCount, error: countErr } = await supabase
        .from('deliveries')
        .select('id', { count: 'exact', head: true })
        .eq('agent_id', agentId)
        .eq('status', 'delivered');
        
      if (activeErr) throw activeErr;
      
      setData({
        activeDeliveries: activeDeliveries || [],
        completedToday: completedCount || 0,
        earnings: (completedCount || 0) * 150, // ৳150 per delivery
        rating: 4.8,
      });
    } catch (e) {
      console.log("Using mock delivery data", e);
      setData(MOCK_DELIVERY_DATA);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkDelivered = async (deliveryId: string, orderId: string) => {
    try {
      await supabase.from('deliveries').update({status:'delivered', completed_at: new Date().toISOString()}).eq('id', deliveryId);
      if (orderId) {
        await supabase.from('orders').update({status:'delivered'}).eq('id', orderId);
      }
      setData((prev: any) => ({
        ...prev,
        activeDeliveries: prev.activeDeliveries.filter((d: any) => d.id !== deliveryId),
        completedToday: prev.completedToday + 1,
        earnings: prev.earnings + 150
      }));
    } catch (e) {
      console.error(e);
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

  if (loading || !data) return <div className="p-4 text-slate-900">Loading...</div>;

  return (
    <div className="p-4 space-y-6">
      <section className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white rounded-3xl p-6 shadow-xl border border-slate-800">
        <div className="flex justify-between items-start mb-2">
          <span className="text-xs font-semibold text-slate-400">Earnings Today</span>
          <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-2.5 py-1 rounded-full border border-emerald-500/30">
            Rating: {data.rating}
          </span>
        </div>
        <div className="text-3xl font-extrabold text-white mb-4">৳ {data.earnings}</div>
        
        <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-800/80 text-xs">
          <div>
            <span className="text-slate-400">Completed:</span>
            <p className="font-bold text-white text-sm">{data.completedToday} Orders</p>
          </div>
          <div>
            <span className="text-slate-400">Active Duty:</span>
            <p className="font-bold text-blue-400 text-sm">{data.activeDeliveries.length} Remaining</p>
          </div>
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-4 px-1">
          <h2 className="text-base font-bold text-slate-900">Active Deliveries</h2>
          <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">{data.activeDeliveries.length} Active</span>
        </div>
        
        <div className="space-y-4">
          {data.activeDeliveries.map((delivery: any) => (
            <div key={delivery.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 hover:shadow-md transition">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">{delivery.orders?.users?.name}</h3>
                  <p className="text-xs text-slate-500">{delivery.orders?.users?.phone}</p>
                </div>
                <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold border ${getStatusColor(delivery.status)}`}>
                  {delivery.status.replace('_', ' ').toUpperCase()}
                </span>
              </div>
              
              <div className="space-y-2 mb-4 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl">
                <div className="flex items-center gap-2 font-medium">
                  <span className="text-blue-500 font-bold">📍</span> {delivery.pickup_address}
                </div>
                <div className="flex items-center gap-2 font-medium">
                  <span className="text-emerald-500 font-bold">🏁</span> {delivery.delivery_address}
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-slate-200 text-[11px]">
                  <span className="text-slate-500">Order Amount: <strong className="text-slate-800">৳{delivery.orders?.total_amount}</strong></span>
                </div>
              </div>
              
              <div className="flex gap-2">
                <button 
                  onClick={() => handleMarkDelivered(delivery.id, delivery.order_id || delivery.orders?.id)} 
                  className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-center rounded-xl font-bold text-xs transition shadow-sm"
                >
                  Mark Delivered
                </button>
                <Link 
                  href={`/delivery/tasks/${delivery.id}`} 
                  className="flex-1 py-3 bg-slate-900 hover:bg-slate-800 text-white text-center rounded-xl font-bold text-xs transition shadow-sm"
                >
                  Manage
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mt-8 mb-4 px-1">
          <h2 className="text-base font-bold text-slate-900">Recent Deliveries</h2>
          <Link href="/delivery/orders" className="text-xs font-bold text-blue-600 hover:underline">View All</Link>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
              <tr>
                <th className="p-3">Order</th>
                <th className="p-3">Address</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              <tr className="hover:bg-slate-50">
                <td className="p-3 font-medium">ORD-001</td>
                <td className="p-3">Dhanmondi, Dhaka</td>
                <td className="p-3 text-emerald-600 font-bold">Delivered</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
