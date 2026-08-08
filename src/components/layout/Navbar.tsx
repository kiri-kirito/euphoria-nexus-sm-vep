"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { useAuthStore } from "@/store/useAuthStore";
import { useCartStore } from "@/store/useCartStore";

export default function Navbar() {
  const { isLoggedIn, role: userRole, profile } = useAuthStore();
  const cartItems = useCartStore((state) => state.items);
  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowProfileDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  
  // Real Auth State
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'mock'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/explore?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push('/explore');
    }
  };

  const handleRealLogin = async (emailValue: string, passwordValue: string) => {
    setLoading(true);
    setError(null);
    
    const { data, error } = await supabase.auth.signInWithPassword({ email: emailValue, password: passwordValue });
    
    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }
    
    setShowLoginModal(false);
    setLoading(false);
  };

  const handleSupabaseAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleRealLogin(email, password);
  };

  const quickLogin = async (role: string) => {
    const mockPasswords: Record<string, {email: string, password: string}> = {
      admin: { email: 'admin1@euphoria.com', password: 'Admin@1234' },
      seller: { email: 'seller1@euphoria.com', password: 'Seller@1234' },
      buyer: { email: 'buyer1@euphoria.com', password: 'Buyer@1234' },
      agent: { email: 'delivery1@euphoria.com', password: 'Delivery@1234' },
      support: { email: 'support1@euphoria.com', password: 'Support@1234' },
    };
    const creds = mockPasswords[role];
    if (creds) {
      await handleRealLogin(creds.email, creds.password);
    }
  };

  const handleLogout = async () => {
    setShowProfileDropdown(false);
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  return (
    <>
      <nav className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <img 
                src="/logo-brand.png" 
                alt="Euphoria Nexus Logo" 
                className="h-16 w-auto object-contain"
              />
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary-dark">
                Euphoria Nexus
              </span>
            </Link>

            {/* Search Bar */}
            <form onSubmit={handleSearchSubmit} className="flex-1 max-w-2xl mx-8 hidden md:flex items-center">
              <div className="relative w-full">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products, bundles, or sellers..."
                  className="w-full pl-4 pr-10 py-2 border border-slate-300 rounded-full focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all bg-slate-50 text-slate-900"
                />
                <button type="submit" className="absolute right-3 top-2.5 text-slate-400 hover:text-primary transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                  </svg>
                </button>
              </div>
            </form>

            {/* Nav Icons & Actions */}
            <div className="flex items-center gap-4 sm:gap-6">
              {isLoggedIn && (
                <Link href="/cart" className="text-slate-600 hover:text-primary relative py-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="9" cy="21" r="1"></circle>
                    <circle cx="20" cy="21" r="1"></circle>
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                  </svg>
                  {cartCount > 0 && (
                    <span className="absolute top-0 -right-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border-2 border-white">
                      {cartCount}
                    </span>
                  )}
                </Link>
              )}

              {!isLoggedIn ? (
                <button 
                  onClick={() => setShowLoginModal(true)}
                  className="px-6 py-2 bg-primary text-white font-medium rounded-full hover:bg-primary-dark transition-colors shadow-md shadow-primary/20"
                >
                  Login
                </button>
              ) : (
                <div className="flex items-center gap-3">
                  <button 
                    onClick={handleLogout}
                    className="hidden sm:block px-4 py-1.5 bg-slate-100 text-slate-700 font-medium rounded-full hover:bg-slate-200 transition-colors text-sm border border-slate-200"
                  >
                    Logout
                  </button>
                  <div className="relative" ref={dropdownRef}>
                    <button 
                      onClick={() => setShowProfileDropdown(prev => !prev)} 
                      className="text-slate-600 hover:text-primary flex items-center gap-1 py-2 outline-none"
                      aria-label="User Profile Menu"
                    >
                      <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 font-bold hover:bg-primary hover:text-white transition-colors">
                        {profile?.name ? profile.name.substring(0, 1).toUpperCase() : (
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                            <circle cx="12" cy="7" r="4"></circle>
                          </svg>
                        )}
                      </div>
                    </button>
                    
                    {/* Profile Dropdown */}
                    {showProfileDropdown && (
                      <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-100 z-50 transform origin-top-right transition-all">
                        <div className="p-3 flex flex-col gap-1">
                          
                          {/* Role Switching Section */}
                          {userRole && userRole !== "buyer" && (
                            <>
                              <div className="bg-primary/5 rounded-lg p-3 mb-2 border border-primary/10">
                                <p className="text-[10px] uppercase font-bold text-primary mb-2 tracking-wider flex items-center gap-1">
                                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.29 7 12 12 20.71 7"></polyline><line x1="12" y1="22" x2="12" y2="12"></line></svg>
                                  Business & Staff
                                </p>
                                <Link 
                                  href={`/${userRole}/dashboard`} 
                                  onClick={() => setShowProfileDropdown(false)}
                                  className="flex items-center justify-between text-sm font-semibold text-slate-800 hover:text-primary transition-colors bg-white px-3 py-2 rounded-md shadow-sm border border-slate-200"
                                >
                                  Switch to {userRole.charAt(0).toUpperCase() + userRole.slice(1)} Mode
                                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
                                </Link>
                              </div>
                              <div className="h-px bg-slate-100 my-1"></div>
                            </>
                          )}

                          <Link 
                            href="/profile" 
                            onClick={() => setShowProfileDropdown(false)} 
                            className="px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-primary rounded-md transition-colors flex items-center gap-2"
                          >
                            👤 My Account
                          </Link>
                          
                          <Link 
                            href="/orders" 
                            onClick={() => setShowProfileDropdown(false)} 
                            className="px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-primary rounded-md transition-colors flex items-center gap-2"
                          >
                            📦 My Orders
                          </Link>
                          
                          <Link 
                            href="/wishlist" 
                            onClick={() => setShowProfileDropdown(false)} 
                            className="px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-primary rounded-md transition-colors flex items-center gap-2"
                          >
                            ❤️ Wishlist
                          </Link>

                          <Link 
                            href="/explore?filter=nearby" 
                            onClick={() => setShowProfileDropdown(false)} 
                            className="px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-primary rounded-md transition-colors flex items-center gap-2 font-medium"
                          >
                            📍 Find Local Sellers
                          </Link>
                          
                          {userRole === "buyer" && (
                            <>
                              <div className="h-px bg-slate-100 my-1"></div>
                              <div className="px-4 py-2">
                                <p className="text-[10px] uppercase font-bold text-slate-400 mb-1 tracking-wider">For Business</p>
                                <Link 
                                  href="/seller/apply" 
                                  onClick={() => setShowProfileDropdown(false)} 
                                  className="text-sm text-primary font-medium hover:text-primary-dark transition-colors flex items-center justify-between"
                                >
                                  Become a Seller
                                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
                                </Link>
                              </div>
                            </>
                          )}

                          <div className="h-px bg-slate-100 my-1"></div>
                          <button 
                            onClick={handleLogout}
                            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors font-medium flex items-center gap-2"
                          >
                            🚪 Logout
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      </nav>

      {/* Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2">
                <img src="/logo-brand.png" alt="Logo" className="h-8 w-auto" />
                <h2 className="text-xl font-bold text-slate-800">
                  Sign In
                </h2>
              </div>
              <button onClick={() => { setShowLoginModal(false); setError(null); }} className="text-slate-400 hover:text-slate-600 transition-colors bg-slate-100 hover:bg-slate-200 p-2 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>
            
            <form onSubmit={handleSupabaseAuth} className="space-y-4">
              {error && (
                <div className="rounded-md bg-red-50 p-3 border border-red-200 text-sm text-red-600 font-medium">
                  {error}
                </div>
              )}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  placeholder="you@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  placeholder="••••••••"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-gradient-to-r from-primary to-primary-dark py-3.5 text-white font-bold hover:shadow-lg hover:shadow-primary/30 transition-all disabled:opacity-70 mt-2"
              >
                {loading ? 'Processing...' : 'Sign In'}
              </button>
              
              <div className="flex justify-center items-center text-sm mt-5">
                <span className="text-slate-500 mr-2">
                  Don't have an account?
                </span>
                <Link
                  href="/register"
                  onClick={() => setShowLoginModal(false)}
                  className="font-bold text-primary hover:text-primary-dark hover:underline transition-colors"
                >
                  Register
                </Link>
              </div>

              <div className="relative flex items-center py-5">
                <div className="flex-grow border-t border-slate-200"></div>
                <span className="flex-shrink-0 mx-4 text-slate-400 text-xs font-semibold uppercase tracking-wider">Or</span>
                <div className="flex-grow border-t border-slate-200"></div>
              </div>

              <div>
                <p className="text-xs text-center font-semibold text-slate-500 mb-3 uppercase tracking-wider">Quick Login (Testing)</p>
                <div className="grid grid-cols-3 gap-1.5">
                  <button type="button" onClick={() => quickLogin('buyer')} className="py-2 px-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-[11px] font-semibold text-slate-700 transition-colors flex justify-center items-center gap-1">
                    👤 Buyer
                  </button>
                  <button type="button" onClick={() => quickLogin('seller')} className="py-2 px-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-[11px] font-semibold text-slate-700 transition-colors flex justify-center items-center gap-1">
                    🏪 Seller
                  </button>
                  <button type="button" onClick={() => quickLogin('admin')} className="py-2 px-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-[11px] font-semibold text-slate-700 transition-colors flex justify-center items-center gap-1">
                    🛡️ Admin
                  </button>
                  <button type="button" onClick={() => quickLogin('agent')} className="py-2 px-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-[11px] font-semibold text-slate-700 transition-colors flex justify-center items-center gap-1">
                    🚚 Delivery
                  </button>
                  <button type="button" onClick={() => quickLogin('support')} className="py-2 px-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-[11px] font-semibold text-slate-700 transition-colors flex justify-center items-center gap-1">
                    🎧 Support
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
