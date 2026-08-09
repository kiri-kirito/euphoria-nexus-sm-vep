'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import { createClient } from '@/utils/supabase/client';
import { useAuthStore } from '@/store/useAuthStore';

export default function OrdersPage() {
  const { user } = useAuthStore();
  const supabase = createClient();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Complaint modal state
  const [complaintOrder, setComplaintOrder] = useState<any | null>(null);
  const [complaintText, setComplaintText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchOrders = async () => {
      try {
        const { data, error } = await supabase
          .from('orders')
          .select(`
            *,
            order_items (
              id,
              quantity,
              unit_price,
              product_id
            )
          `)
          .eq('buyer_id', user.id)
          .order('created_at', { ascending: false });

        if (error) {
          console.error("Error fetching orders:", error);
        } else if (data) {
          setOrders(data);
        }
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    };

    fetchOrders();
  }, [user, supabase]);

  const handleFileComplaint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!complaintOrder || !user || !complaintText.trim()) return;
    
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('complaints')
        .insert([{
          buyer_id: user.id,
          order_id: complaintOrder.id,
          description: complaintText,
          status: 'open'
        }]);

      if (error) throw error;
      
      setToast('Complaint filed successfully. Support will contact you soon.');
      setComplaintOrder(null);
      setComplaintText('');
    } catch (err: any) {
      console.error(err);
      setToast('Failed to file complaint: ' + err.message);
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setToast(null), 4000);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-12 relative">
      <Navbar />
      
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 bg-slate-900 text-white text-sm font-bold px-6 py-4 rounded-2xl shadow-2xl z-50 animate-bounce">
          {toast}
        </div>
      )}

      {/* Complaint Modal */}
      {complaintOrder && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl">
            <h3 className="text-xl font-bold text-slate-900 mb-2">File a Complaint</h3>
            <p className="text-sm text-slate-500 mb-6">
              Order #{complaintOrder.id.substring(0, 8).toUpperCase()}
            </p>
            <form onSubmit={handleFileComplaint}>
              <textarea 
                value={complaintText}
                onChange={(e) => setComplaintText(e.target.value)}
                placeholder="Please describe your issue in detail..."
                className="w-full h-32 p-4 border border-slate-200 rounded-xl mb-4 focus:ring-2 focus:ring-blue-500 outline-none text-sm text-slate-800"
                required
              />
              <div className="flex gap-3 justify-end">
                <button 
                  type="button"
                  onClick={() => setComplaintOrder(null)}
                  className="px-5 py-2.5 text-sm font-bold text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 text-sm font-bold text-white bg-red-600 rounded-xl hover:bg-red-700 shadow-lg shadow-red-600/30 disabled:opacity-50"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Complaint'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-8">My Orders</h1>
        
        {loading ? (
          <div className="text-center py-12 text-slate-500 font-medium animate-pulse">
            Loading your orders...
          </div>
        ) : !user ? (
          <div className="bg-white rounded-3xl p-12 max-w-2xl mx-auto shadow-xl shadow-slate-200/50 border border-slate-100 text-center">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Please Log In</h2>
            <p className="text-slate-600 mb-8">You need to log in to view your orders.</p>
            <Link href="/login" className="px-8 py-3 bg-primary text-white font-bold rounded-xl shadow-lg">Login</Link>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 max-w-2xl mx-auto shadow-xl shadow-slate-200/50 border border-slate-100 text-center">
            <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500">
                <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
              </svg>
            </div>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-4">No Orders Yet</h2>
            <p className="text-slate-600 mb-8 max-w-md mx-auto leading-relaxed">
              You haven't placed any orders recently. Start exploring our marketplace to find amazing deals!
            </p>
            <Link 
              href="/explore" 
              className="inline-flex items-center justify-center px-8 py-3.5 bg-primary text-white font-bold rounded-xl hover:bg-primary-dark transition-all shadow-lg shadow-primary/30"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order.id} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col md:flex-row gap-6 md:items-center justify-between group hover:border-blue-200 hover:shadow-md transition-all">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-bold text-slate-900 text-lg">Order #{order.id.substring(0, 8).toUpperCase()}</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                      order.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                      order.status === 'processing' ? 'bg-blue-100 text-blue-700' :
                      order.status === 'delivered' ? 'bg-emerald-100 text-emerald-700' :
                      'bg-slate-100 text-slate-700'
                    }`}>
                      {order.status || 'Pending'}
                    </span>
                  </div>
                  <p className="text-sm text-slate-500 mb-1">
                    Placed on: {new Date(order.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                  <p className="text-sm text-slate-600 font-medium">
                    {order.order_items?.length || 0} items • Delivery to: {order.shipping_address || 'Default Address'}
                  </p>
                </div>
                
                <div className="flex items-center justify-between md:flex-col md:items-end gap-3 border-t md:border-t-0 border-slate-100 pt-4 md:pt-0">
                  <div className="text-right">
                    <span className="text-sm text-slate-500 block mb-1">Total Amount</span>
                    <span className="text-2xl font-black text-slate-900">৳{order.total_amount?.toLocaleString() || 0}</span>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setComplaintOrder(order)}
                      className="px-4 py-2 bg-red-50 text-red-600 text-xs font-bold rounded-xl hover:bg-red-100 transition"
                    >
                      File Complaint
                    </button>
                    <button className="px-5 py-2 bg-slate-900 text-white text-sm font-bold rounded-xl hover:bg-slate-800 transition shadow-md">
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
