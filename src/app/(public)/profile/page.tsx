'use client';

import React, { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { createClient } from '@/utils/supabase/client';
import { sendCheckoutLinkInChat } from '@/utils/negotiationChat';
import Link from 'next/link';

export default function ProfilePage() {
  const { user, profile, setSession } = useAuthStore();
  const supabase = createClient();
  const [activeTab, setActiveTab] = useState<'info' | 'orders' | 'negotiations'>('info');
  const [toast, setToast] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [orders, setOrders] = useState<any[]>([]);
  const [negotiations, setNegotiations] = useState<any[]>([]);
  const [tabLoading, setTabLoading] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: ''
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (profile) {
      setFormData({
        fullName: profile.name || '',
        email: profile.email || '',
        phone: profile.phone || '',
        address: profile.address || ''
      });
    } else if (user) {
      setFormData(prev => ({ ...prev, email: user.email || '' }));
    }
  }, [profile, user]);

  useEffect(() => {
    if (!user?.id) return;
    setTabLoading(true);
    Promise.all([
      supabase
        .from('orders')
        .select(`
          id, total_amount, status, created_at,
          order_items (quantity, unit_price, products (name))
        `)
        .eq('buyer_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20),
      supabase
        .from('negotiations')
        .select(`
          id, seller_id, current_price, final_price, status, quantity, created_at,
          products (name),
          seller:users!negotiations_seller_id_fkey (name)
        `)
        .eq('buyer_id', user.id)
        .order('updated_at', { ascending: false })
        .limit(20),
    ]).then(([ordersRes, negRes]) => {
      setOrders(ordersRes.data || []);
      setNegotiations(negRes.data || []);
      setTabLoading(false);
    });
  }, [user?.id, supabase]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);

    const updates = {
      name: formData.fullName,
      phone: formData.phone,
      address: formData.address,
    };

    const { error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', user.id);

    setLoading(false);

    if (error) {
      setToast('Failed to update profile.');
    } else {
      setToast('Profile information updated successfully!');
      // Update local zustand profile store so UI reflects instantly without full reload
      if (profile) {
        setSession(user, profile.role, { ...profile, ...updates });
      }
    }
    
    setTimeout(() => setToast(null), 3000);
  };

  if (!mounted) return null;

  if (!user) {
    return (
      <div className="bg-slate-50 min-h-[80vh] flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="bg-white p-10 rounded-3xl shadow-sm border border-slate-200 text-center max-w-md w-full">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto text-slate-300 mb-6">
            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Please Log In</h1>
          <p className="text-sm text-slate-500 mb-8">You need to be logged in to view and manage your profile.</p>
          <Link href="/" className="inline-block bg-primary hover:bg-primary-dark text-white font-bold py-3 px-8 rounded-full transition-colors shadow-md shadow-primary/20">
            Go to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen py-10 px-4 sm:px-6 lg:px-8">
      {toast && (
        <div className="fixed bottom-6 right-6 bg-slate-900 text-white text-xs font-bold px-5 py-3 rounded-xl shadow-2xl z-50 animate-bounce border border-slate-700">
          {toast}
        </div>
      )}

      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header Banner */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center gap-6">
          <div className="w-20 h-20 bg-gradient-to-tr from-primary to-purple-600 rounded-2xl flex items-center justify-center font-extrabold text-white text-2xl shadow-lg shadow-primary/20 shrink-0 uppercase">
            {formData.fullName ? formData.fullName.substring(0, 2) : 'U'}
          </div>
          <div className="text-center sm:text-left flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <h1 className="text-2xl font-bold text-slate-900">{formData.fullName}</h1>
              <span className="bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-full w-fit mx-auto sm:mx-0 uppercase">
                {profile?.role || 'Buyer'} Account
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">{formData.email}</p>
          </div>
        </div>

        {/* Tab Buttons */}
        <div className="flex bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm">
          {[
            { id: 'info', label: 'Personal Information' },
            { id: 'orders', label: `Order History (${orders.length})` },
            { id: 'negotiations', label: `Bulk Deal Offers (${negotiations.length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 py-3 text-xs sm:text-sm font-bold rounded-xl transition ${
                activeTab === tab.id 
                  ? 'bg-slate-900 text-white shadow-md' 
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab 1: Personal Info */}
        {activeTab === 'info' && (
          <section className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-6">Edit Profile Details</h2>
            
            <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">Full Name</label>
                <input 
                  type="text" 
                  value={formData.fullName} 
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-medium outline-none focus:border-primary focus:bg-white" 
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">Email Address</label>
                <input 
                  type="email" 
                  value={formData.email} 
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-medium outline-none focus:border-primary focus:bg-white" 
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">Phone Number</label>
                <input 
                  type="tel" 
                  value={formData.phone} 
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-medium outline-none focus:border-primary focus:bg-white" 
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-2">Default Shipping Address</label>
                <input 
                  type="text" 
                  value={formData.address} 
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-medium outline-none focus:border-primary focus:bg-white" 
                />
              </div>

              <div className="md:col-span-2 pt-4">
                <button disabled={loading} type="submit" className="bg-primary hover:bg-primary-dark text-white text-xs font-bold px-6 py-3 rounded-xl transition shadow-md shadow-primary/20 disabled:opacity-50">
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </section>
        )}

        {/* Tab 2: Orders */}
        {activeTab === 'orders' && (
          <section className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Past Orders</h2>
            {tabLoading ? (
              <p className="text-slate-500 animate-pulse">Loading orders...</p>
            ) : orders.length === 0 ? (
              <p className="text-slate-500">No orders yet. <Link href="/explore" className="text-primary font-bold">Start shopping</Link></p>
            ) : (
              orders.map((order) => {
                const itemsSummary = (order.order_items || [])
                  .map((oi: any) => `${oi.products?.name || 'Item'} (${oi.quantity}x)`)
                  .join(', ');
                return (
                  <div key={order.id} className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <span className="font-extrabold text-slate-900 text-sm">#{order.id.substring(0, 8)}</span>
                        <span className="px-2.5 py-0.5 text-[10px] rounded-full font-bold bg-blue-100 text-blue-800 capitalize">
                          {order.status || 'pending'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">
                        Placed on {new Date(order.created_at).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-slate-700 font-medium mt-2">{itemsSummary || '—'}</p>
                    </div>
                    <div className="text-left md:text-right">
                      <p className="text-xl font-extrabold text-slate-900">৳{Number(order.total_amount).toLocaleString()}</p>
                      <Link href="/orders" className="text-xs font-bold text-primary hover:underline mt-1 inline-block">
                        View All Orders →
                      </Link>
                    </div>
                  </div>
                );
              })
            )}
          </section>
        )}

        {activeTab === 'negotiations' && (
          <section className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Submitted Bulk Deal Offers</h2>
            {tabLoading ? (
              <p className="text-slate-500 animate-pulse">Loading negotiations...</p>
            ) : negotiations.length === 0 ? (
              <p className="text-slate-500">No bulk deal offers yet.</p>
            ) : (
              negotiations.map((neg) => (
                <div key={neg.id} className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <span className="font-extrabold text-purple-600 text-xs">#{neg.id.substring(0, 8)}</span>
                      <span className="px-2.5 py-0.5 text-[10px] rounded-full font-bold bg-amber-100 text-amber-800 capitalize">
                        {neg.status}
                      </span>
                    </div>
                    <h3 className="font-bold text-slate-900 text-sm">{neg.products?.name}</h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Seller: <strong>{neg.seller?.name}</strong>
                      {neg.quantity ? ` • Qty: ${neg.quantity}` : ''}
                    </p>
                  </div>
                  <div className="text-left md:text-right">
                    <p className="text-sm font-extrabold text-slate-900">
                      {neg.status === 'accepted' || neg.status === 'ordered'
                        ? `Agreed: ৳${Number(neg.final_price ?? neg.current_price).toLocaleString()}`
                        : `Offer: ৳${Number(neg.current_price).toLocaleString()}`}
                    </p>
                    {neg.status === 'accepted' && (
                      <Link
                        href={`/checkout?negotiation=${neg.id}`}
                        className="mt-2 inline-block text-xs font-bold text-white bg-primary hover:bg-primary-dark px-4 py-2 rounded-full transition-colors"
                      >
                        Checkout Now →
                      </Link>
                    )}
                    {neg.status === 'countered' && (
                      <div className="flex flex-wrap gap-2 justify-end mt-2">
                        <button
                          type="button"
                          onClick={async () => {
                            await supabase
                              .from('negotiations')
                              .update({
                                status: 'accepted',
                                final_price: neg.current_price,
                              })
                              .eq('id', neg.id);
                            if (neg.seller_id && user?.id) {
                              await sendCheckoutLinkInChat(supabase, {
                                negotiationId: neg.id,
                                sellerId: neg.seller_id,
                                buyerId: user.id,
                                sellerName: neg.seller?.name || 'Seller',
                              });
                            }
                            setNegotiations((prev) =>
                              prev.map((n) =>
                                n.id === neg.id
                                  ? { ...n, status: 'accepted', final_price: neg.current_price }
                                  : n
                              )
                            );
                          }}
                          className="text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 px-3.5 py-1.5 rounded-xl transition-colors shadow-sm"
                        >
                          ✓ Accept Counter
                        </button>
                        <Link
                          href="/orders"
                          className="text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 hover:bg-blue-100 px-3 py-1.5 rounded-xl transition-colors"
                        >
                          💬 Counter Offer
                        </Link>
                        <button
                          type="button"
                          onClick={async () => {
                            if (!confirm('Cancel this negotiation?')) return;
                            await supabase.from('negotiations').update({ status: 'rejected' }).eq('id', neg.id);
                            setNegotiations((prev) =>
                              prev.map((n) => (n.id === neg.id ? { ...n, status: 'rejected' } : n))
                            );
                          }}
                          className="text-xs font-bold text-red-600 bg-red-50 border border-red-200 hover:bg-red-100 px-3 py-1.5 rounded-xl transition-colors"
                        >
                          ✕ Cancel
                        </button>
                      </div>
                    )}
                    {neg.status === 'open' && (
                      <div className="flex items-center gap-2 mt-2 justify-end">
                        <span className="text-[11px] text-slate-500 font-medium">Waiting for seller</span>
                        <button
                          type="button"
                          onClick={async () => {
                            if (!confirm('Withdraw this negotiation?')) return;
                            await supabase.from('negotiations').update({ status: 'rejected' }).eq('id', neg.id);
                            setNegotiations((prev) =>
                              prev.map((n) => (n.id === neg.id ? { ...n, status: 'rejected' } : n))
                            );
                          }}
                          className="text-xs font-bold text-red-600 bg-red-50 border border-red-200 px-2.5 py-1 rounded-xl"
                        >
                          ✕ Cancel
                        </button>
                      </div>
                    )}
                    {neg.status === 'ordered' && (
                      <span className="mt-2 inline-block text-xs font-bold text-emerald-700">Order placed</span>
                    )}
                  </div>
                </div>
              ))
            )}
          </section>
        )}
      </div>
    </div>
  );
}
