'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React, { useState, useEffect, useCallback } from 'react';
import { signOutAndRedirect } from '@/utils/logout';
import { createClient } from '@/utils/supabase/client';
import { useAuthStore } from '@/store/useAuthStore';

export default function DeliveryLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user } = useAuthStore();
  const supabase = createClient();
  const [isActiveDuty, setIsActiveDuty] = useState(true);
  const [toast, setToast] = useState<string | null>(null);
  const [agentName, setAgentName] = useState('Delivery Agent');
  const [agentPhone, setAgentPhone] = useState('');
  const [activeTaskHref, setActiveTaskHref] = useState('/delivery/tasks');

  const loadAgentData = useCallback(async () => {
    let agentId = user?.id;
    if (!agentId) {
      const { data: authUser } = await supabase.auth.getUser();
      agentId = authUser.user?.id;
    }
    if (!agentId) {
      const { data: agents } = await supabase.from('users').select('id, name, phone, is_online').eq('role', 'agent').limit(1);
      if (agents?.[0]) {
        agentId = agents[0].id;
        if (agents[0].name) setAgentName(agents[0].name);
        if (agents[0].phone) setAgentPhone(agents[0].phone);
        if (typeof agents[0].is_online === 'boolean') setIsActiveDuty(agents[0].is_online);
      }
    }
    if (!agentId) return;

    const [{ data: profile }, { data: activeDelivery }] = await Promise.all([
      supabase
        .from('users')
        .select('name, phone, is_online, address')
        .eq('id', agentId)
        .maybeSingle(),
      supabase
        .from('deliveries')
        .select('id')
        .eq('agent_id', agentId)
        .not('status', 'eq', 'delivered')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle(),
    ]);

    if (profile?.name) setAgentName(profile.name);
    if (profile?.phone) setAgentPhone(profile.phone);
    if (typeof profile?.is_online === 'boolean') setIsActiveDuty(profile.is_online);
    if (activeDelivery?.id) {
      setActiveTaskHref(`/delivery/tasks/${activeDelivery.id}`);
    } else {
      setActiveTaskHref('/delivery/tasks');
    }
  }, [supabase, user?.id]);

  useEffect(() => {
    loadAgentData();
  }, [loadAgentData]);

  const navItems = [
    {
      name: 'Dashboard',
      href: '/delivery/dashboard',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 00-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
    },
    {
      name: 'Active Task',
      href: activeTaskHref,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
    },
    {
      name: 'Earnings',
      href: '/delivery/earnings',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      name: 'Agent Profile',
      href: '/delivery/profile',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
    },
  ];

  const toggleDuty = async () => {
    if (!user?.id) return;
    const nextState = !isActiveDuty;
    setIsActiveDuty(nextState);
    await supabase.from('users').update({ is_online: nextState }).eq('id', user.id);
    setToast(nextState ? 'Status: ONLINE & Ready for Orders' : 'Status: OFFLINE (On Break)');
    setTimeout(() => setToast(null), 3000);
  };

  const initials = agentName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'DA';

  return (
    <div className="flex flex-col min-h-screen bg-slate-100 text-slate-900 pb-20 font-sans relative">
      {toast && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-2xl z-50 animate-bounce">
          {toast}
        </div>
      )}

      <header className="sticky top-0 z-30 flex items-center justify-between px-4 py-3 bg-slate-950 text-white shadow-md border-b border-slate-800">
        <div className="flex items-center gap-3">
          <img
            src="/logo-brand.png"
            alt="Euphoria Logo"
            className="h-14 w-auto object-contain drop-shadow-md"
          />
          <div>
            <h1 className="text-xs font-extrabold tracking-tight text-white">{agentName}</h1>
            <p className="text-[10px] text-blue-400 font-semibold">
              Delivery Agent{agentPhone ? ` • ${agentPhone}` : ''}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className={`text-[11px] font-bold ${isActiveDuty ? 'text-emerald-400' : 'text-slate-400'}`}>
              {isActiveDuty ? 'Online' : 'Offline'}
            </span>
            <button
              onClick={toggleDuty}
              className={`w-10 h-5 rounded-full p-1 transition-colors duration-300 flex items-center ${
                isActiveDuty ? 'bg-emerald-500 justify-end' : 'bg-slate-700 justify-start'
              }`}
            >
              <div className="w-3 h-3 bg-white rounded-full shadow-md"></div>
            </button>
          </div>
          <Link href="/" className="text-slate-400 hover:text-white transition-colors p-1" title="View Marketplace">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 00-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
          </Link>
          <button
            onClick={() => signOutAndRedirect()}
            className="text-red-400 hover:text-red-300 transition-colors p-1"
            title="Sign Out"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
          </button>
        </div>
      </header>

      <main className="flex-1 w-full max-w-lg mx-auto">
        {children}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 w-full bg-slate-950 border-t border-slate-800 z-40">
        <div className="max-w-lg mx-auto flex justify-around">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (pathname.startsWith('/delivery/tasks') && item.name === 'Active Task');
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex flex-col items-center py-2.5 px-3 flex-1 transition-colors ${
                  isActive ? 'text-blue-400 font-bold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className={`mb-1 transition-transform ${isActive ? 'scale-110 text-blue-400' : ''}`}>
                  {item.icon}
                </div>
                <span className="text-[10px] font-medium">{item.name}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
