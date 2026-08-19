'use client';

import Link from 'next/link';
import React, { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useAuthStore } from '@/store/useAuthStore';
import { useSupabaseRealtime } from '@/hooks/useSupabaseRealtime';
import { useSocket } from '@/hooks/useSocket';
import { useNotifications } from '@/hooks/useNotifications';

const FEE_PER_DELIVERY = 120;

export default function DeliveryDashboard() {
  const [activeDeliveries, setActiveDeliveries] = useState<any[]>([]);
  const [availableDeliveries, setAvailableDeliveries] = useState<any[]>([]);
  const [completedCount, setCompletedCount] = useState(0);
  const [agentZone, setAgentZone] = useState<string>('Dhaka');
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  const { user } = useAuthStore();
  const { socket } = useSocket('/delivery');
  const { refresh: refreshNotifications } = useNotifications();

  useEffect(() => {
    if (!socket || !user?.id) return;
    socket.emit('register_agent', user.id);
    const onPing = () => {
      fetchDeliveryData();
      refreshNotifications();
    };
    socket.on('priority_delivery', onPing);
    return () => {
      socket.off('priority_delivery', onPing);
    };
  }, [socket, user?.id]);

  const fetchDeliveryData = useCallback(async () => {
    let agentId = user?.id;
    if (!agentId) {
      const { data: agents } = await supabase.from('users').select('id, address').eq('role', 'agent').limit(1);
      agentId = agents?.[0]?.id;
      if (agents?.[0]?.address) {
        setAgentZone(agents[0].address);
      }
    } else {
      const { data: agentData } = await supabase.from('users').select('address').eq('id', agentId).maybeSingle();
      if (agentData?.address) {
        setAgentZone(agentData.address);
      }
    }

    if (!agentId) {
      setLoading(false);
      return;
    }

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
        .limit(20),
      supabase
        .from('deliveries')
        .select('id', { count: 'exact', head: true })
        .eq('agent_id', agentId)
        .eq('status', 'delivered'),
    ]);

    setActiveDeliveries(mine || []);

    // Filter available deliveries to match agent's assigned regional zone
    const currentZone = agentZone || 'Dhaka';
    const zoneFiltered = (open || []).filter((del) => {
      const pickup = (del.pickup_address || '').toLowerCase();
      const drop = (del.delivery_address || '').toLowerCase();
      const ship = (del.orders?.shipping_address || '').toLowerCase();
      const target = currentZone.toLowerCase();
      
      // If target zone matches Dhaka / Dhanmondi / etc
      return pickup.includes(target) || drop.includes(target) || ship.includes(target);
    });

    const displayOpen = zoneFiltered.length > 0 ? zoneFiltered : (open || []);
    const sorted = displayOpen.sort(
      (a, b) => Number(b.is_priority) - Number(a.is_priority)
    );

    setAvailableDeliveries(sorted);
    setCompletedCount(count || 0);
    setLoading(false);
  }, [supabase, user?.id, agentZone]);

  useEffect(() => {
    fetchDeliveryData();
  }, [fetchDeliveryData]);

  useSupabaseRealtime('deliveries', fetchDeliveryData, !!user?.id);
  useSupabaseRealtime('orders', fetchDeliveryData, !!user?.id);

  const handlePickUp = async (deliveryId: string) => {
    let agentId = user?.id;
    if (!agentId) {
      const { data: agents } = await supabase.from('users').select('id').eq('role', 'agent').limit(1);
      agentId = agents?.[0]?.id;
    }
    if (!agentId) return;

    // Optimistically update UI
    const pickedItem = availableDeliveries.find(d => d.id === deliveryId);
    setAvailableDeliveries(prev => prev.filter(d => d.id !== deliveryId));
    if (pickedItem) {
      setActiveDeliveries(prev => [{ ...pickedItem, status: 'assigned', agent_id: agentId }, ...prev]);
    }

    await supabase
      .from('deliveries')
      .update({ agent_id: agentId, status: 'assigned' })
      .eq('id', deliveryId);
    
    await fetchDeliveryData();
  };

  const handleMarkDelivered = async (deliveryId: string, orderId: string) => {
    // Optimistically remove from active deliveries
    setActiveDeliveries(prev => prev.filter(d => d.id !== deliveryId));
    setCompletedCount(prev => prev + 1);

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

  if (loading) return <div className="p-4 text-slate-900 animate-pulse">Loading dashboard...</div>;

  const earnings = completedCount * FEE_PER_DELIVERY;

  return (
    <div className="p-4 space-y-6">
      {/* Earnings Overview Card */}
      <section className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white rounded-3xl p-6 shadow-xl border border-slate-800">
        <div className="flex justify-between items-start">
          <div>
            <span className="text-xs font-semibold text-slate-400">Total Earnings</span>
            <div className="text-3xl font-extrabold text-white mb-4">৳ {earnings.toLocaleString()}</div>
          </div>
          <span className="text-xs bg-blue-500/20 text-blue-300 border border-blue-500/30 px-3 py-1 rounded-full font-semibold">
            📍 Zone: {agentZone}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-800/80 text-xs">
          <div>
            <span className="text-slate-400">Completed:</span>
            <p className="font-bold text-white text-sm">{completedCount} Orders</p>
          </div>
          <div>
            <span className="text-slate-400">Active Deliveries:</span>
            <p className="font-bold text-blue-400 text-sm">{activeDeliveries.length} In Progress</p>
          </div>
        </div>
      </section>

      {/* Available to Pick Up (Regional Zone Restricted) */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-slate-900">
            Available in {agentZone} ({availableDeliveries.length})
          </h2>
          <span className="text-xs text-slate-500 font-medium">Regional Dispatch</span>
        </div>
        {availableDeliveries.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 text-center text-slate-500 text-sm">
            No pending orders waiting for pickup in your zone ({agentZone}).
          </div>
        ) : (
          <div className="space-y-4">
            {availableDeliveries.map((delivery) => (
              <div key={delivery.id} className={`rounded-2xl border p-5 ${delivery.is_priority ? 'bg-red-50 border-red-300' : 'bg-amber-50 border-amber-200'}`}>
                {delivery.is_priority && (
                  <span className="inline-block mb-2 text-[10px] font-bold uppercase tracking-wide text-red-700 bg-red-100 px-2 py-1 rounded-full">
                    ⚡ Priority {delivery.delivery_type?.replace('_', ' ') || 'express'}
                  </span>
                )}
                <p className="font-bold text-sm">{delivery.orders?.users?.name || 'Customer'}</p>
                <p className="text-xs text-slate-600 mt-2">📍 Dropoff: {delivery.delivery_address}</p>
                <p className="text-xs text-slate-500 mt-1">🏪 Pickup: {delivery.pickup_address}</p>
                <button
                  onClick={() => handlePickUp(delivery.id)}
                  className="mt-4 w-full py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold text-xs shadow-md transition"
                >
                  Accept & Pick Up Order
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Active Deliveries List */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-slate-900">
            My Active Deliveries ({activeDeliveries.length})
          </h2>
        </div>
        {activeDeliveries.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 text-center text-slate-500 text-sm">
            No active deliveries. Pick up an order above to start!
          </div>
        ) : (
          <div className="space-y-4">
            {activeDeliveries.map((delivery) => (
              <div key={delivery.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">{delivery.orders?.users?.name || 'Buyer'}</h3>
                    <p className="text-xs text-slate-500">{delivery.orders?.users?.phone || 'Phone upon arrival'}</p>
                  </div>
                  <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold border ${getStatusColor(delivery.status)}`}>
                    {delivery.status.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
                <div className="space-y-2 mb-4 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl">
                  <div>📍 Pickup: {delivery.pickup_address}</div>
                  <div>🏁 Drop: {delivery.delivery_address}</div>
                  <div className="pt-2 border-t">Order Total: ৳{delivery.orders?.total_amount?.toLocaleString() || 0}</div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleMarkDelivered(delivery.id, delivery.order_id || delivery.orders?.id)}
                    className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-md transition"
                  >
                    ✓ Confirm Delivered
                  </button>
                  <Link href={`/delivery/tasks/${delivery.id}`} className="flex-1 py-3 bg-slate-900 hover:bg-slate-800 text-white text-center rounded-xl font-bold text-xs shadow-md transition">
                    Manage Task →
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
