'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React, { useState } from 'react';

export default function DeliveryLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isActiveDuty, setIsActiveDuty] = useState(true);
  const [toast, setToast] = useState<string | null>(null);

  const navItems = [
    { 
      name: 'Dashboard', 
      href: '/delivery/dashboard', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 00-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      )
    },
    { 
      name: 'Active Task', 
      href: '/delivery/tasks/84392', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      )
    },
    { 
      name: 'Earnings', 
      href: '/delivery/earnings', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    { 
      name: 'Agent Profile', 
      href: '/delivery/profile', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      )
    },
  ];

  const toggleDuty = () => {
    const nextState = !isActiveDuty;
    setIsActiveDuty(nextState);
    setToast(nextState ? 'Status: ONLINE & Ready for Orders' : 'Status: OFFLINE (On Break)');
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-100 text-slate-900 pb-20 font-sans relative">
      {toast && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-2xl z-50 animate-bounce">
          {toast}
        </div>
      )}

      {/* Top Header with OFFICIAL LOGO */}
      <header className="sticky top-0 z-30 flex items-center justify-between px-4 py-3 bg-slate-950 text-white shadow-md border-b border-slate-800">
        <div className="flex items-center gap-3">
          <img 
            src="/logo-brand.png" 
            alt="Euphoria Logo" 
            className="h-10 w-auto object-contain bg-white/10 p-1 rounded-lg"
          />
          <div>
            <h1 className="text-xs font-extrabold tracking-tight text-white">Karim Ahmed</h1>
            <p className="text-[10px] text-blue-400 font-semibold">Delivery Agent #104 (Dhaka)</p>
          </div>
        </div>

        {/* Active Toggle Switch */}
        <div className="flex items-center gap-2">
          <span className={`text-[11px] font-bold ${isActiveDuty ? 'text-emerald-400' : 'text-slate-400'}`}>
            {isActiveDuty ? 'Online' : 'Offline'}
          </span>
          <button 
            onClick={toggleDuty}
            className={`w-11 h-6 rounded-full p-1 transition-colors duration-300 flex items-center ${
              isActiveDuty ? 'bg-emerald-500 justify-end' : 'bg-slate-700 justify-start'
            }`}
          >
            <div className="w-4 h-4 bg-white rounded-full shadow-md"></div>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-lg mx-auto">
        {children}
      </main>

      {/* Fixed Bottom Mobile Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 w-full bg-slate-950 border-t border-slate-800 z-40">
        <div className="max-w-lg mx-auto flex justify-around">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (pathname.startsWith('/delivery/tasks') && item.href.includes('tasks'));
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
