'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';

export default function SupportLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  const navLinks = [
    { name: 'Dashboard', href: '/support/dashboard' },
    { name: 'Tickets', href: '/support/tickets/1' },
  ];

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900">
      <aside className="w-64 bg-slate-900 text-slate-100 flex flex-col">
        <div className="p-6 text-2xl font-bold tracking-tight text-teal-400">
          Support Portal
        </div>
        <nav className="flex-1 px-4 py-4 space-y-2">
          {navLinks.map((link) => {
            const isActive = pathname === link.href || (pathname.startsWith('/support/tickets') && link.href.includes('tickets'));
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`block px-4 py-2 rounded-md transition-colors ${
                  isActive
                    ? 'bg-teal-600 text-white font-medium'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>
      </aside>
      <main className="flex-1 flex flex-col overflow-hidden">
        {children}
      </main>
    </div>
  );
}
