'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useAuthStore } from '@/store/useAuthStore';

export default function DeliveryEarnings() {
  const { user } = useAuthStore();
  const supabase = createClient();
  const [history, setHistory] = useState<any[]>([]);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchEarnings = async () => {
      try {
        const { data, error } = await supabase
          .from('deliveries')
          .select('*')
          .eq('status', 'delivered')
          .order('created_at', { ascending: false }); // in real app, filter by agent_id = user.id

        if (error) {
          console.error("Error fetching earnings:", error);
        } else if (data) {
          setHistory(data);
          setTotalEarnings(data.length * 120); // Fixed 120 Tk fee per delivery for now
        }
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    };

    fetchEarnings();
  }, [user, supabase]);

  if (loading) {
    return <div className="p-8 text-center text-slate-500 animate-pulse">Loading earnings...</div>;
  }

  return (
    <div className="p-4 space-y-6">
      <div className="bg-slate-950 text-white rounded-3xl p-6 shadow-xl border border-slate-800">
        <h2 className="text-xs font-semibold text-slate-400">Total Agent Balance</h2>
        <div className="text-3xl font-extrabold text-white my-2">৳ {totalEarnings.toLocaleString()}</div>
        <p className="text-xs text-emerald-400 font-semibold">Available for bKash Cashout</p>
      </div>

      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
        <h3 className="font-bold text-slate-900 text-sm">Delivery Payout History</h3>
        
        {history.length === 0 ? (
          <p className="text-sm text-slate-500 text-center py-4">No completed deliveries yet.</p>
        ) : (
          <div className="space-y-3">
            {history.map((h) => (
              <div key={h.id} className="flex justify-between items-center text-xs p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div>
                  <p className="font-bold text-slate-900">#ORD-{h.order_id.substring(0, 8)}</p>
                  <p className="text-slate-500 text-[10px]">
                    {new Date(h.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-extrabold text-emerald-600 text-sm">৳120</p>
                  <p className="text-slate-400 text-[10px]">Fee: ৳120 • Tip: ৳0</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
