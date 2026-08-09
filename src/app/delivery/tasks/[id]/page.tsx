'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';

export default function TaskDetails({ params }: { params: { id: string } }) {
  const router = useRouter();
  const supabase = createClient();
  const [task, setTask] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    const fetchTask = async () => {
      try {
        const { data, error } = await supabase
          .from('deliveries')
          .select(`
            *,
            orders (
              id,
              total_amount
            )
          `)
          .eq('id', params.id)
          .single();

        if (error) {
          console.error("Error fetching task:", error);
        } else if (data) {
          setTask(data);
        }
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    };

    fetchTask();
  }, [params.id, supabase]);

  const updateStatus = async (newStatus: 'assigned' | 'picked_up' | 'in_transit' | 'delivered') => {
    if (!task) return;
    try {
      const { error } = await supabase
        .from('deliveries')
        .update({ status: newStatus })
        .eq('id', task.id);

      if (error) throw error;
      
      setTask({ ...task, status: newStatus });
      setToast(`Order updated to "${newStatus.replace('_', ' ')}"!`);
      
      // If delivered, maybe update order status too
      if (newStatus === 'delivered') {
        await supabase
          .from('orders')
          .update({ status: 'delivered' })
          .eq('id', task.order_id);
      }
      
      setTimeout(() => setToast(null), 3000);
    } catch (err) {
      console.error(err);
      setToast('Failed to update status.');
      setTimeout(() => setToast(null), 3000);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-500 animate-pulse">Loading task details...</div>;
  }

  if (!task) {
    return <div className="p-8 text-center text-slate-500">Task not found.</div>;
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 relative pb-20">
      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-2xl z-50 animate-bounce border border-slate-700">
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="p-4 bg-white shadow-sm border-b border-slate-200 flex justify-between items-center sticky top-0 z-20">
        <div>
          <div className="flex items-center gap-2">
            <Link href="/delivery/tasks" className="text-slate-400 hover:text-slate-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <h1 className="text-base font-extrabold text-slate-900">Order #{task.order_id.substring(0, 8)}</h1>
          </div>
          <p className="text-xs font-semibold text-emerald-600 ml-7">COD Payment: ৳{task.orders?.total_amount?.toLocaleString() || 0} to collect</p>
        </div>
        <a 
          href="tel:01711223344"
          className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center font-bold text-lg hover:bg-emerald-100 transition"
        >
          📞
        </a>
      </div>

      {/* Map View Placeholder */}
      <div className="h-64 bg-slate-800 relative flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 opacity-15 bg-[linear-gradient(#94a3b8_1px,transparent_1px),linear-gradient(90deg,#94a3b8_1px,transparent_1px)] bg-[size:20px_20px]"></div>
        <div className="absolute top-1/2 left-1/4 right-1/4 h-1.5 bg-blue-500 rounded-full z-0 opacity-60 transform -translate-y-1/2 rotate-6"></div>
        
        <div className="relative z-10 flex flex-col items-center">
          <div className="text-4xl drop-shadow-xl animate-bounce">📍</div>
          <div className="bg-slate-900 text-white px-3 py-1 rounded-full shadow-lg text-[11px] font-bold mt-1 border border-slate-700">
            {task.delivery_address.substring(0, 25)}...
          </div>
        </div>
      </div>

      {/* Customer & Status Action Details */}
      <div className="bg-white rounded-t-3xl -mt-6 p-6 shadow-xl relative z-20 flex-1 flex flex-col">
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100">
          <h2 className="text-base font-bold text-slate-900">Delivery Status</h2>
          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
            task.status === 'delivered' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
          }`}>
            {task.status.replace('_', ' ')}
          </span>
        </div>

        <div className="space-y-4 mb-6">
          <div className="flex items-start gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center font-bold shrink-0 text-sm">
              🏠
            </div>
            <div>
              <p className="font-bold text-slate-900 text-sm">{task.delivery_address}</p>
              <p className="text-xs text-slate-500 font-medium">Pickup from: {task.pickup_address}</p>
            </div>
          </div>
        </div>

        {/* Status Update Action Buttons */}
        <div className="mt-auto space-y-2 pt-4 border-t border-slate-100">
          <button 
            onClick={() => updateStatus('picked_up')}
            className={`w-full py-3 text-xs font-bold rounded-xl transition ${
              task.status === 'picked_up' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Mark Picked Up from Seller
          </button>

          <button 
            onClick={() => updateStatus('in_transit')}
            className={`w-full py-3 text-xs font-bold rounded-xl transition ${
              task.status === 'in_transit' ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
            }`}
          >
            Mark On the Way
          </button>

          <button 
            onClick={() => updateStatus('delivered')}
            className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2"
          >
            <span>✓</span> Confirm Order Delivered
          </button>
        </div>
      </div>
    </div>
  );
}
