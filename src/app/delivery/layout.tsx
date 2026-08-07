'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function DeliveryLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const navItems = [
    { name: 'Dashboard', href: '/delivery/dashboard', icon: '📊' },
    { name: 'Tasks', href: '/delivery/tasks/1', icon: '📦' },
    { name: 'Earnings', href: '/delivery/earnings', icon: '💰' },
    { name: 'Profile', href: '/delivery/profile', icon: '👤' },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 text-gray-900 pb-16">
      {/* Top Header */}
      <header className="sticky top-0 z-10 flex items-center justify-between px-4 py-3 bg-white shadow-sm">
        <div>
          <h1 className="text-lg font-bold">John Doe</h1>
          <p className="text-xs text-gray-500">Delivery Agent</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Active</span>
          <div className="w-12 h-6 bg-green-500 rounded-full p-1 flex justify-end cursor-pointer">
            <div className="w-4 h-4 bg-white rounded-full shadow-sm"></div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-md mx-auto">
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 w-full bg-white border-t border-gray-200 sm:hidden z-10 pb-safe">
        <div className="flex justify-around">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link 
                key={item.name} 
                href={item.href} 
                className={`flex flex-col items-center py-2 px-3 flex-1 ${isActive ? 'text-blue-600' : 'text-gray-400'}`}
              >
                <span className={`text-xl mb-1 transition-transform ${isActive ? 'scale-110' : ''}`}>{item.icon}</span>
                <span className="text-[10px] font-medium">{item.name}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
