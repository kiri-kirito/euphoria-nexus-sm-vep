'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React, { ReactNode, useState } from 'react';
import { signOutAndRedirect } from '@/utils/logout';

export default function SupportLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [profileOpen, setProfileOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [isActiveDuty, setIsActiveDuty] = useState(true);

  const toggleDuty = () => {
    const nextState = !isActiveDuty;
    setIsActiveDuty(nextState);
    setToast(nextState ? 'Status: ONLINE & Ready' : 'Status: OFFLINE (On Break)');
    setTimeout(() => setToast(null), 3000);
  };

  const navLinks = [
    { 
      name: 'Overview & Queue', 
      href: '/support/dashboard',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      )
    },
    { 
      name: 'Complaints', 
      href: '/support/tickets',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      ),
      badge: 'Live'
    },
    { 
      name: 'Escrow Management', 
      href: '/support/escrow',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      )
    },
    { 
      name: 'Moderation', 
      href: '/support/moderation',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
        </svg>
      )
    },
  ];

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <div className="flex h-screen bg-slate-900 text-slate-100 font-sans relative">
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-teal-600 text-white text-xs font-bold px-5 py-3 rounded-xl shadow-2xl animate-bounce">
          {toast}
        </div>
      )}

      {/* Sidebar */}
      <aside className="w-64 bg-slate-950 border-r border-slate-800 flex flex-col flex-shrink-0">
        {/* Brand Header with OFFICIAL LOGO */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <Link href="/support/dashboard" className="flex items-center gap-3">
            <img 
              src="/logo-brand.png" 
              alt="Euphoria Logo" 
              className="h-14 w-auto object-contain drop-shadow-md"
            />
            <div>
              <h2 className="text-sm font-bold text-white tracking-tight leading-tight">Euphoria Support</h2>
              <p className="text-[10px] text-teal-400 font-bold uppercase tracking-wider">Help Desk Portal</p>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          {navLinks.map((link) => {
            const isActive = pathname === link.href || (pathname.startsWith('/support/tickets') && link.href.includes('tickets'));
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 text-xs font-semibold ${
                  isActive
                    ? 'bg-teal-600 text-white shadow-lg shadow-teal-600/30'
                    : 'text-slate-400 hover:bg-slate-900 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={isActive ? 'text-white' : 'text-slate-400'}>{link.icon}</span>
                  <span>{link.name}</span>
                </div>
                {link.badge && (
                  <span className="bg-teal-500/20 text-teal-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-teal-500/30 animate-pulse">
                    {link.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60">
          <Link href="/" className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition">
            <svg className="w-4 h-4 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Marketplace
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden bg-slate-900">
        <header className="h-16 bg-slate-950/80 backdrop-blur-md border-b border-slate-800 flex items-center justify-between px-8 z-20">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${isActiveDuty ? 'bg-emerald-400 animate-ping' : 'bg-slate-500'}`}></span>
              <span className="text-xs font-bold text-slate-300">Agent Status: <strong className={isActiveDuty ? 'text-emerald-400' : 'text-slate-500'}>{isActiveDuty ? 'Online' : 'Offline'}</strong></span>
            </div>
            {/* Active Toggle Switch */}
            <button 
              onClick={toggleDuty}
              className={`w-10 h-5 rounded-full p-1 transition-colors duration-300 flex items-center ${
                isActiveDuty ? 'bg-emerald-500 justify-end' : 'bg-slate-700 justify-start'
              }`}
            >
              <div className="w-3 h-3 bg-white rounded-full shadow-md"></div>
            </button>
          </div>

          {/* Profile Dropdown */}
          <div className="relative">
            <button 
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-3 p-1.5 hover:bg-slate-900 rounded-xl transition border border-slate-800"
            >
              <div className="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center font-bold text-white text-xs shadow-md">
                SI
              </div>
              <div className="text-left hidden sm:block">
                <p className="text-xs font-bold text-white">Sabrina Islam</p>
                <p className="text-[10px] text-slate-400">Support Agent #24</p>
              </div>
              <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {profileOpen && (
              <div className="absolute right-0 mt-2 w-52 bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl p-2 z-50 text-xs animate-fade-in space-y-1">
                <div className="p-3 border-b border-slate-800">
                  <p className="font-bold text-white">Sabrina Islam</p>
                  <p className="text-[10px] text-teal-400 font-semibold">Tier 2 Escalation Agent</p>
                </div>
                <Link 
                  href="/"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-2 p-2.5 rounded-xl hover:bg-slate-900 text-slate-300 hover:text-white transition"
                >
                  🏪 View Marketplace
                </Link>
                <button 
                  onClick={() => signOutAndRedirect()}
                  className="w-full text-left flex items-center gap-2 p-2.5 rounded-xl hover:bg-red-500/10 text-red-400 transition font-bold"
                >
                  🚪 End Shift & Sign Out
                </button>
              </div>
            )}
          </div>
        </header>

        <div className="flex-1 overflow-hidden">
          {children}
        </div>
      </main>
    </div>
  );
}
