"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export default function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState("buyer"); // buyer, seller, admin, delivery, support
  const [showLoginModal, setShowLoginModal] = useState(false);

  const handleLogin = (role: string) => {
    setUserRole(role);
    setIsLoggedIn(true);
    setShowLoginModal(false);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserRole("buyer");
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
            <div className="flex-1 max-w-2xl mx-8 hidden md:flex items-center">
              <div className="relative w-full">
                <input
                  type="text"
                  placeholder="Search products, bundles, or sellers..."
                  className="w-full pl-4 pr-10 py-2 border border-slate-300 rounded-full focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all bg-slate-50"
                />
                <button className="absolute right-3 top-2.5 text-slate-400 hover:text-primary">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                  </svg>
                </button>
              </div>
            </div>

            {/* Nav Icons & Actions */}
            <div className="flex items-center gap-4 sm:gap-6">
              <Link href="/cart" className="text-slate-600 hover:text-primary relative py-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="9" cy="21" r="1"></circle>
                  <circle cx="20" cy="21" r="1"></circle>
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                </svg>
                <span className="absolute top-0 -right-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border-2 border-white">2</span>
              </Link>
              
              {!isLoggedIn ? (
                <button 
                  onClick={() => setShowLoginModal(true)}
                  className="px-6 py-2 bg-primary text-white font-medium rounded-full hover:bg-primary-dark transition-colors shadow-md shadow-primary/20"
                >
                  Login
                </button>
              ) : (
                <div className="relative group">
                  <Link href="/profile" className="text-slate-600 hover:text-primary flex items-center gap-1 py-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                  </Link>
                  {/* Profile Dropdown */}
                  <div className="absolute right-0 top-full mt-0 w-64 bg-white rounded-xl shadow-xl border border-slate-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 transform origin-top-right group-hover:scale-100 scale-95">
                    <div className="p-3 flex flex-col gap-1">
                      
                      {/* Role Switching Section */}
                      {userRole !== "buyer" && (
                        <>
                          <div className="bg-primary/5 rounded-lg p-3 mb-2 border border-primary/10">
                            <p className="text-[10px] uppercase font-bold text-primary mb-2 tracking-wider flex items-center gap-1">
                              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.29 7 12 12 20.71 7"></polyline><line x1="12" y1="22" x2="12" y2="12"></line></svg>
                              Business & Staff
                            </p>
                            <Link href={`/${userRole}/dashboard`} className="flex items-center justify-between text-sm font-semibold text-slate-800 hover:text-primary transition-colors bg-white px-3 py-2 rounded-md shadow-sm border border-slate-200">
                              Switch to {userRole.charAt(0).toUpperCase() + userRole.slice(1)} Mode
                              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
                            </Link>
                          </div>
                          <div className="h-px bg-slate-100 my-1"></div>
                        </>
                      )}

                      <Link href="/profile" className="px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-primary rounded-md transition-colors">My Account</Link>
                      <Link href="/orders" className="px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-primary rounded-md transition-colors">My Orders</Link>
                      <Link href="/wishlist" className="px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-primary rounded-md transition-colors">Wishlist</Link>
                      
                      {userRole === "buyer" && (
                        <>
                          <div className="h-px bg-slate-100 my-1"></div>
                          <div className="px-4 py-2">
                            <p className="text-[10px] uppercase font-bold text-slate-400 mb-1 tracking-wider">For Business</p>
                            <Link href="/seller/apply" className="text-sm text-primary font-medium hover:text-primary-dark transition-colors flex items-center justify-between">
                              Become a Seller
                              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
                            </Link>
                          </div>
                        </>
                      )}

                      <div className="h-px bg-slate-100 my-1"></div>
                      <button 
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors font-medium"
                      >
                        Logout
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      </nav>

      {/* Mock Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-800">Mock Login</h2>
              <button onClick={() => setShowLoginModal(false)} className="text-slate-400 hover:text-slate-600">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>
            
            <p className="text-sm text-slate-500 mb-6">
              Since the backend isn't connected yet, select a role below to simulate logging in. You will be redirected to the Buyer view first (as requested), and can switch roles from your profile dropdown.
            </p>

            <div className="space-y-3">
              {[
                { id: "buyer", title: "Buyer", desc: "Regular customer view" },
                { id: "seller", title: "Seller", desc: "Vendor with a store" },
                { id: "admin", title: "Admin", desc: "Platform administrator" },
                { id: "delivery", title: "Delivery Agent", desc: "Logistics staff" },
                { id: "support", title: "Support Agent", desc: "Customer service staff" }
              ].map((role) => (
                <button
                  key={role.id}
                  onClick={() => handleLogin(role.id)}
                  className="w-full flex items-center justify-between p-4 rounded-xl border border-slate-200 hover:border-primary hover:bg-primary/5 transition-all group text-left"
                >
                  <div>
                    <h3 className="font-bold text-slate-800 group-hover:text-primary transition-colors">{role.title}</h3>
                    <p className="text-xs text-slate-500">{role.desc}</p>
                  </div>
                  <svg className="text-slate-300 group-hover:text-primary transition-colors" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
