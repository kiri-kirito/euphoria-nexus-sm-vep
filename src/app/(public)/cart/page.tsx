'use client';

import Link from "next/link";
import { useCartStore } from "@/store/useCartStore";
import { useAuthStore } from "@/store/useAuthStore";
import { useEffect, useState } from "react";

export default function CartPage() {
  const { items, updateQuantity, removeItem, getTotal } = useCartStore();
  const { isLoggedIn } = useAuthStore();
  
  // Hydration safety for Zustand persist
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return <div className="min-h-screen bg-slate-50 flex justify-center items-center">Loading cart...</div>;

  const total = getTotal();

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center p-8 bg-white rounded-2xl shadow-sm border border-slate-200">
          <svg className="w-16 h-16 mx-auto text-slate-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Your cart is empty</h2>
          <p className="text-slate-500 mb-6">Looks like you haven't added anything yet.</p>
          <Link href="/explore" className="bg-primary text-white px-6 py-2 rounded-xl font-medium hover:bg-primary-dark transition-colors">
            Start Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-8">Your Cart ({items.reduce((acc, i) => acc + i.quantity, 0)} items)</h1>
        
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left: Cart Items */}
          <div className="lg:w-2/3 space-y-6">
            {items.map((item) => (
              <div key={item.id} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col sm:flex-row gap-6 items-start sm:items-center">
                {item.image && (
                  <img 
                    src={item.image} 
                    alt={item.name} 
                    className="w-24 h-24 object-cover rounded-xl"
                  />
                )}
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-slate-900">{item.name}</h3>
                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center gap-3 bg-slate-100 rounded-lg p-1">
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-8 h-8 flex justify-center items-center rounded-md hover:bg-white hover:shadow-sm text-slate-600 transition-all"
                      >-</button>
                      <span className="w-4 text-center font-medium text-slate-900">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-8 h-8 flex justify-center items-center rounded-md hover:bg-white hover:shadow-sm text-slate-600 transition-all"
                      >+</button>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-slate-900">৳{(item.price * item.quantity).toLocaleString()}</p>
                    </div>
                  </div>
                </div>
                <button onClick={() => removeItem(item.id)} className="text-slate-400 hover:text-red-500 transition-colors p-2 self-start sm:self-auto">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                </button>
              </div>
            ))}
          </div>

          {/* Right: Order Summary */}
          <div className="lg:w-1/3">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 sticky top-8">
              <h2 className="text-xl font-bold text-slate-900 mb-6">Order Summary</h2>
              
              <div className="space-y-4 text-sm text-slate-600 mb-6">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-medium text-slate-900">৳{total.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>Calculated at checkout</span>
                </div>
                <div className="flex justify-between text-emerald-600">
                  <span>Discount</span>
                  <span>- ৳0</span>
                </div>
                <div className="border-t border-slate-100 pt-4 mt-4 flex justify-between text-base">
                  <span className="font-bold text-slate-900">Total</span>
                  <span className="font-bold text-slate-900">৳{total.toLocaleString()}</span>
                </div>
              </div>

              {!isLoggedIn ? (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl mb-4 text-amber-800 text-sm font-medium">
                  Please log in or register to checkout your items.
                </div>
              ) : (
                <Link href="/checkout" className="w-full flex justify-center items-center py-3 px-4 bg-slate-900 text-white rounded-xl font-semibold hover:bg-slate-800 transition-colors mb-4">
                  Proceed to Checkout
                </Link>
              )}
              
              <Link href="/explore" className="w-full flex justify-center items-center py-3 px-4 text-slate-600 font-medium hover:text-slate-900 transition-colors">
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
