'use client';

import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useAuthStore } from '@/store/useAuthStore';

export default function DeliveryTasksOverview() {
  const { user } = useAuthStore();
  const supabase = createClient();
  const [tasks, setTasks] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'active' | 'completed'>('active');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        let agentId = user?.id;
        if (!agentId) {
          const { data: agents } = await supabase.from('users').select('id').eq('role', 'agent').limit(1);
          agentId = agents?.[0]?.id;
        }

        let query = supabase
          .from('deliveries')
          .select(`
            *,
            orders (
              id,
              total_amount,
              shipping_address,
              users!buyer_id(name, phone)
            )
          `)
          .order('created_at', { ascending: false });

        if (agentId) {
          query = query.eq('agent_id', agentId);
        }

        const { data, error } = await query;

        if (error) {
          console.error("Error fetching tasks:", error);
        } else if (data) {
          setTasks(data);
        }
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    };

    fetchTasks();
  }, [user, supabase]);

  const filteredTasks = tasks.filter((t) =>
    activeTab === 'active' ? t.status !== 'delivered' : t.status === 'delivered'
  );

  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900">Delivery Tasks</h1>
          <p className="text-xs text-slate-500 mt-0.5">Track and navigate your assigned delivery stops</p>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('active')}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeTab === 'active' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
            }`}
          >
            Active ({tasks.filter(t => t.status !== 'delivered').length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('completed')}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeTab === 'completed' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
            }`}
          >
            Completed ({tasks.filter(t => t.status === 'delivered').length})
          </button>
        </div>
      </div>

      {/* Map View Route Header */}
      <div className="h-48 bg-slate-900 rounded-3xl relative flex items-center justify-center overflow-hidden shadow-lg border border-slate-800">
        <div className="absolute inset-0 opacity-15 bg-[linear-gradient(#94a3b8_1px,transparent_1px),linear-gradient(90deg,#94a3b8_1px,transparent_1px)] bg-[size:20px_20px]"></div>
        
        <div className="absolute inset-0 flex items-center justify-center">
          <svg className="w-full h-full opacity-60" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path d="M10 80 Q 30 20 50 50 T 90 20" fill="none" stroke="#3b82f6" strokeWidth="3" strokeDasharray="5,5" className="animate-pulse" />
          </svg>
        </div>

        <div className="relative z-10 flex gap-12 items-center">
          <div className="text-2xl drop-shadow-xl animate-bounce">📍</div>
          <div className="text-2xl drop-shadow-xl">🏪</div>
          <div className="text-2xl drop-shadow-xl">🏠</div>
        </div>
        
        <div className="absolute bottom-3 right-3 bg-slate-950 text-white px-3 py-1 rounded-full shadow-lg text-[10px] font-bold border border-slate-700 opacity-90">
          Route Optimization Active
        </div>
      </div>

      {/* Tasks List */}
      <section className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200">
        <h2 className="text-sm font-bold text-slate-900 mb-4">
          {activeTab === 'active' ? "Active Schedule" : "Completed History"}
        </h2>
        
        <div className="relative">
          <div className="space-y-4 relative z-10">
            {loading ? (
              <div className="text-center text-slate-500 py-6 animate-pulse">Loading tasks...</div>
            ) : filteredTasks.length === 0 ? (
              <div className="text-center text-slate-500 py-8">
                {activeTab === 'active'
                  ? 'No active tasks. Pick up new orders from the dashboard!'
                  : 'No completed tasks yet.'}
              </div>
            ) : (
              filteredTasks.map((task) => (
                <div key={task.id} className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                  <div className="flex gap-3 items-start">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm ${
                      task.status === 'delivered' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-600 text-white'
                    }`}>
                      {task.status === 'delivered' ? '✓' : '📦'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-sm text-slate-900">
                          Order #{task.order_id?.substring(0, 8) || task.id.substring(0, 8)}
                        </h3>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                          task.status === 'delivered' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {task.status?.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1">🏁 To: {task.delivery_address}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">📍 From: {task.pickup_address}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                    <span className="text-xs font-bold text-slate-900">
                      ৳{task.orders?.total_amount?.toLocaleString() || 0}
                    </span>
                    <Link
                      href={`/delivery/tasks/${task.id}`}
                      className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-sm transition"
                    >
                      {task.status === 'delivered' ? 'View Summary' : 'Manage & Navigate →'}
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
