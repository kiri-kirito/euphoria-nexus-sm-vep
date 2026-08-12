'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useAuthStore } from '@/store/useAuthStore';

export default function DeliveryProfile() {
  const { user } = useAuthStore();
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<{
    name: string;
    phone: string;
    address: string;
    is_online: boolean;
    completed: number;
  } | null>(null);

  useEffect(() => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    async function load() {
      const [{ data: userRow }, { count }] = await Promise.all([
        supabase
          .from('users')
          .select('name, phone, address, is_online')
          .eq('id', user!.id)
          .maybeSingle(),
        supabase
          .from('deliveries')
          .select('id', { count: 'exact', head: true })
          .eq('agent_id', user!.id)
          .eq('status', 'delivered'),
      ]);

      setProfile({
        name: userRow?.name || 'Delivery Agent',
        phone: userRow?.phone || '—',
        address: userRow?.address || 'Dhaka Metro',
        is_online: userRow?.is_online ?? false,
        completed: count || 0,
      });
      setLoading(false);
    }

    load();
  }, [supabase, user?.id]);

  if (loading) {
    return <div className="p-8 text-center text-slate-500 animate-pulse">Loading profile...</div>;
  }

  const initials = (profile?.name || 'DA')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="p-4 space-y-6">
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm text-center">
        <div className="w-20 h-20 bg-blue-600 text-white rounded-2xl flex items-center justify-center font-extrabold text-2xl mx-auto mb-3 shadow-lg shadow-blue-500/30">
          {initials}
        </div>
        <h2 className="font-bold text-slate-900 text-lg">{profile?.name}</h2>
        <p className="text-xs text-slate-500 font-semibold">
          Delivery Partner • ID #{user?.id?.slice(0, 8).toUpperCase()}
        </p>
        <span
          className={`inline-block mt-2 text-[10px] font-bold px-3 py-1 rounded-full ${
            profile?.is_online
              ? 'bg-emerald-100 text-emerald-800'
              : 'bg-slate-100 text-slate-600'
          }`}
        >
          {profile?.is_online ? 'Online — accepting orders' : 'Offline'}
        </span>
      </div>

      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3 text-xs">
        <div className="flex justify-between py-2 border-b border-slate-100">
          <span className="text-slate-500">Completed Deliveries:</span>
          <span className="font-bold text-slate-800">{profile?.completed}</span>
        </div>
        <div className="flex justify-between py-2 border-b border-slate-100">
          <span className="text-slate-500">Assigned Zone:</span>
          <span className="font-bold text-slate-800 text-right max-w-[60%]">{profile?.address}</span>
        </div>
        <div className="flex justify-between py-2 border-b border-slate-100">
          <span className="text-slate-500">Phone:</span>
          <span className="font-bold text-slate-800">{profile?.phone}</span>
        </div>
        <div className="flex justify-between py-2">
          <span className="text-slate-500">Earnings Rate:</span>
          <span className="font-bold text-purple-600">৳120 per delivery</span>
        </div>
      </div>
    </div>
  );
}
