'use client';

import Link from 'next/link';
import React, { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useAuthStore } from '@/store/useAuthStore';
import { useSupabaseRealtime } from '@/hooks/useSupabaseRealtime';

const FEE_PER_DELIVERY = 120;

export default function DeliveryDashboard() {
  const [activeDeliveries, setActiveDeliveries] = useState<any[]>([]);
  const [availableDeliveries, setAvailableDeliveries] = useState<any[]>([]);
  const [completedCount, setCompletedCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  const { user } = useAuthStore();

  const fetchDeliveryData = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    const agentId = user.id;

    const [{ data: mine }, { data: open }, { count }] = await Promise.all([
      supabase
        .from('deliveries')
        .select('*, orders(id, total_amount, status, shipping_address, users!buyer_id(name, phone))')
        .eq('agent_id', agentId)
        .not('status', 'eq', 'delivered')
        .order('created_at', { ascending: false }),
      supabase
        .from('deliveries')
        .select('*, orders(id, total_amount, status, shipping_address, users!buyer_id(name, phone))')
        .is('agent_id', null)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(10),
      supabase
        .from('deliveries')
        .select('id', { count: 'exact', head: true })
        .eq('agent_id', agentId)
        .eq('status', 'delivered'),
    ]);

    setActiveDeliveries(mine || []);
    setAvailableDeliveries(open || []);
    setCompletedCount(count || 0);
    setLoading(false);
  }, [supabase, user?.id]);

  useEffect(() => {
    fetchDeliveryData();
  }, [fetchDeliveryData]);

  useSupabaseRealtime('deliveries', fetchDeliveryData, !!user?.id);
  useSupabaseRealtime('orders', fetchDeliveryData, !!user?.id);

  const handlePickUp = async (deliveryId: string) => {
    if (!user?.id) return;
    await supabase
      .from('deliveries')
      .update({ agent_id: user.id, status: 'assigned' })
      .eq('id', deliveryId);
    await fetchDeliveryData();
  };

  const handleMarkDelivered = async (deliveryId: string, orderId: string) => {
    await supabase
      .from('deliveries')
      .update({ status: 'delivered', completed_at: new Date().toISOString() })
      .eq('id', deliveryId);
    if (orderId) {
      await supabase.from('orders').update({ status: 'delivered' }).eq('id', orderId);
    }
    await fetchDeliveryData();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
      case 'assigned':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'picked_up':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'in_transit':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'delivered':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  if (loading) return <div className="p-4 text-slate-900">Loading...</div>;

  const earnings = completedCount * FEE_PER_DELIVERY;

  return (
    <div className="p-4 space-y-6">
      <section className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white rounded-3xl p-6 shadow-xl border border-slate-800">
        <span className="text-xs font-semibold text-slate-400">Total Earnings</span>
        <div className="text-3xl font-extrabold text-white mb-4">৳ {earnings.toLocaleString()}</div>
        <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-800/80 text-xs">
          <div>
            <span className="text-slate-400">Completed:</span>
            <p className="font-bold text-white text-sm">{completedCount} Orders</p>
          </div>
          <div>
            <span className="text-slate-400">Active:</span>
            <p className="font-bold text-blue-400 text-sm">{activeDeliveries.length} In Progress</p>
          </div>
        </div>
      </section>

      {availableDeliveries.length > 0 && (
        <section>
          <h2 className="text-base font-bold text-slate-900 mb-4">Available to Pick Up ({availableDeliveries.length})</h2>
          <div className="space-y-4">
            {availableDeliveries.map((delivery) => (
              <div key={delivery.id} className="bg-amber-50 rounded-2xl border border-amber-200 p-5">
                <p className="font-bold text-sm">{delivery.orders?.users?.name || 'Customer'}</p>
                <p className="text-xs text-slate-600 mt-2">📍 {delivery.delivery_address}</p>
                <button
                  onClick={() => handlePickUp(delivery.id)}
                  className="mt-4 w-full py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold text-xs"
                >
                  Pick Up Order
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="text-base font-bold text-slate-900 mb-4">My Active Deliveries</h2>
        {activeDeliveries.length === 0 ? (
          <p className="text-slate-500 text-sm">No active deliveries. Pick up an available order above.</p>
        ) : (
          <div className="space-y-4">
            {activeDeliveries.map((delivery) => (
              <div key={delivery.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
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
                  <div>📍 Pickup: {delivery.pickup_address}</div>
                  <div>🏁 Drop: {delivery.delivery_address}</div>
                  <div className="pt-2 border-t">Order: ৳{delivery.orders?.total_amount?.toLocaleString()}</div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleMarkDelivered(delivery.id, delivery.order_id || delivery.orders?.id)}
                    className="flex-1 py-3 bg-emerald-600 text-white rounded-xl font-bold text-xs"
                  >
                    Mark Delivered
                  </button>
                  <Link href={`/delivery/tasks/${delivery.id}`} className="flex-1 py-3 bg-slate-900 text-white text-center rounded-xl font-bold text-xs">
                    Manage
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
