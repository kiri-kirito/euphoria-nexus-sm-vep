'use client';

import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useAuthStore } from '@/store/useAuthStore';

export default function DeliveryTasksOverview() {
  const { user } = useAuthStore();
  const supabase = createClient();
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchTasks = async () => {
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
          .order('created_at', { ascending: true }); // in a real app, filter by agent_id = user.id

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

  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-extrabold text-slate-900">Active Tasks</h1>
        <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
          {tasks.length} tasks
        </span>
      </div>

      {/* Map View Placeholder */}
      <div className="h-48 bg-slate-800 rounded-3xl relative flex items-center justify-center overflow-hidden shadow-lg border border-slate-700">
        <div className="absolute inset-0 opacity-15 bg-[linear-gradient(#94a3b8_1px,transparent_1px),linear-gradient(90deg,#94a3b8_1px,transparent_1px)] bg-[size:20px_20px]"></div>
        
        {/* Mock Route Line */}
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
        
        <div className="absolute bottom-3 right-3 bg-slate-900 text-white px-3 py-1 rounded-full shadow-lg text-[10px] font-bold border border-slate-700 opacity-90">
          Live Traffic: Fast
        </div>
      </div>

      {/* Route List */}
      <section className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200">
        <h2 className="text-sm font-bold text-slate-900 mb-4">Today's Schedule</h2>
        
        <div className="relative">
          {/* Vertical Line */}
          <div className="absolute left-[15px] top-4 bottom-4 w-0.5 bg-slate-200"></div>
          
          <div className="space-y-6 relative z-10">
            {loading ? (
              <div className="text-center text-slate-500 py-4 animate-pulse">Loading tasks...</div>
            ) : tasks.length === 0 ? (
              <div className="text-center text-slate-500 py-4">No tasks found.</div>
            ) : (
              tasks.map((task) => (
                <div key={task.id} className="flex gap-4 items-start">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border-4 border-white shadow-sm ${
                    task.status === 'delivered' ? 'bg-slate-300 text-white' : 
                    task.status === 'assigned' || task.status === 'picked_up' || task.status === 'in_transit' ? 'bg-blue-600 text-white animate-pulse' : 
                    'bg-white border-slate-300 text-slate-400'
                  }`}>
                    {task.status === 'delivered' ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                    ) : (
                      <span className="text-[10px] font-bold">↓</span>
                    )}
                  </div>
                  
                  <div className="flex-1 pt-1">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className={`font-bold text-sm ${task.status === 'delivered' ? 'text-slate-400 line-through' : 'text-slate-900'}`}>
                        Deliver Order #{task.order_id.substring(0, 8)}
                      </h3>
                      <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md uppercase">
                        {task.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">To: {task.delivery_address}</p>
                    
                    {task.status !== 'delivered' && (
                      <div className="mt-3">
                        <Link 
                          href={`/delivery/tasks/${task.id}`}
                          className="inline-block px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-lg shadow-md hover:bg-slate-800 transition"
                        >
                          View Details & Navigate
                        </Link>
                      </div>
                    )}
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
