'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React, { ReactNode, useState, useEffect } from 'react';
import { signOutAndRedirect } from '@/utils/logout';
import { createClient } from '@/utils/supabase/client';
import { useAuthStore } from '@/store/useAuthStore';

const AdminLayout = ({ children }: { children: ReactNode }) => {
  const pathname = usePathname();
  const { user } = useAuthStore();
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [adminName, setAdminName] = useState<string>('Super Admin');
  const [adminEmail, setAdminEmail] = useState<string>('admin1@euphoria.com');

  useEffect(() => {
    async function loadAdminInfo() {
      const supabase = createClient();
      let adminId = user?.id;
      if (!adminId) {
        const { data: admins } = await supabase.from('users').select('id, name, email').eq('role', 'admin').limit(1);
        if (admins?.[0]) {
          setAdminName(admins[0].name || 'Super Admin');
          setAdminEmail(admins[0].email || 'admin1@euphoria.com');
        }
      } else {
        const { data: profile } = await supabase.from('users').select('name, email').eq('id', adminId).maybeSingle();
        if (profile) {
          setAdminName(profile.name || 'Super Admin');
          setAdminEmail(profile.email || user?.email || 'admin1@euphoria.com');
        }
      }
    }
    loadAdminInfo();
  }, [user?.id]);

  const navLinks: { name: string; href: string; icon: React.ReactNode; badge?: string }[] = [
    { 
      name: 'Overview', 
      href: '/admin/dashboard',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      )
    },
    { 
      name: 'User Management', 
      href: '/admin/users',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      )
    },
    { 
      name: 'Seller Approvals', 
      href: '/admin/sellers',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
    },
    { 
      name: 'Seller Payouts', 
      href: '/admin/payouts',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      )
    },
    { 
      name: 'Agent Management', 
      href: '/admin/cms',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      )
    },
    { 
      name: 'Audit Trail Logs', 
      href: '/admin/logs',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
      )
    },
    { 
      name: 'Platform Settings', 
      href: '/admin/settings',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      )
    },
  ];

  const adminInitials = adminName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'AD';

  return (
    <div className="flex h-screen bg-slate-900 text-slate-100 font-sans relative overflow-hidden">
      {/* Sidebar Overlay (mobile) */}
      <div
        className={`sidebar-overlay-backdrop ${sidebarOpen ? 'is-open' : ''}`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-indigo-600 text-white text-xs font-bold px-5 py-3 rounded-xl shadow-2xl animate-bounce">
          {toast}
        </div>
      )}

      {/* Sidebar */}
      <aside className={`dashboard-sidebar-panel w-64 bg-slate-950 border-r border-slate-800 flex flex-col flex-shrink-0 ${sidebarOpen ? 'is-open' : ''}`}>
        {/* Brand Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <Link href="/admin/dashboard" className="flex items-center gap-3">
            <img 
              src="/logo-brand.png" 
              alt="Euphoria Logo" 
              className="h-14 w-auto object-contain drop-shadow-md"
            />
            <div>
              <h2 className="text-sm font-bold text-white tracking-tight leading-tight">Euphoria Nexus</h2>
              <p className="text-[10px] text-blue-400 font-bold uppercase tracking-wider">Super Admin</p>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 text-xs font-semibold ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  {link.icon}
                  <span>{link.name}</span>
                </div>
                {link.badge && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    {link.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* System Status Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950">
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Platform Live</span>
            </div>
            <span className="text-slate-500">v1.2.0</span>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-slate-900 dashboard-main-area">
        {/* Top Navbar */}
        <header className="h-16 bg-slate-950/80 backdrop-blur-md border-b border-slate-800 flex items-center justify-between px-4 sm:px-8 z-20 dashboard-topbar-inner">
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Hamburger (mobile only) */}
            <button
              className="sidebar-hamburger-btn bg-slate-800 text-white rounded-lg p-2"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open menu"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
              </svg>
            </button>
            <div className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
              <span className="text-xs font-medium text-slate-300 hidden sm:inline">Environment: <strong className="text-white">Production (BD)</strong></span>
              <span className="text-xs font-medium text-slate-300 sm:hidden">Prod</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Functional Profile Dropdown */}
            <div className="relative">
              <button 
                onClick={() => { setProfileOpen(!profileOpen); setNotifOpen(false); }}
                className="flex items-center gap-3 p-1.5 hover:bg-slate-900 rounded-xl transition border border-slate-800"
              >
                <div className="w-8 h-8 bg-gradient-to-tr from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center font-bold text-white text-xs shadow-md">
                  {adminInitials}
                </div>
                <div className="text-left hidden sm:block">
                  <p className="text-xs font-bold text-white">{adminName}</p>
                  <p className="text-[10px] text-slate-400">{adminEmail}</p>
                </div>
                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {profileOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl p-2 z-50 text-xs animate-fade-in space-y-1">
                  <div className="p-3 border-b border-slate-800">
                    <p className="font-bold text-white truncate">{adminName}</p>
                    <p className="text-[10px] text-emerald-400 font-semibold truncate">{adminEmail}</p>
                  </div>
                  <Link 
                    href="/admin/settings"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-2 p-2.5 rounded-xl hover:bg-slate-900 text-slate-300 hover:text-white transition"
                  >
                    ⚙️ Platform Settings
                  </Link>
                  <Link 
                    href="/admin/logs"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-2 p-2.5 rounded-xl hover:bg-slate-900 text-slate-300 hover:text-white transition"
                  >
                    📋 Audit Trail Logs
                  </Link>
                  <Link 
                    href="/"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-2 p-2.5 rounded-xl hover:bg-slate-900 text-slate-300 hover:text-white transition"
                  >
                    🏪 View Marketplace
                  </Link>
                  <button 
                    onClick={() => { setProfileOpen(false); signOutAndRedirect(); }}
                    className="w-full text-left flex items-center gap-2 p-2.5 rounded-xl hover:bg-red-500/10 text-red-400 transition font-bold"
                  >
                    🚪 Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Body */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 admin-page-content">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
