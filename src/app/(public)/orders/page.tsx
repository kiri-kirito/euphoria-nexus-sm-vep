'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import { createClient } from '@/utils/supabase/client';
import { useAuthStore } from '@/store/useAuthStore';
import OrderTrackingMap from '@/components/maps/OrderTrackingMapLazy';
import { deliveryMapPoints } from '@/utils/deliveryMap';

type ComplaintType = 'general' | 'return' | 'refund';

export default function OrdersPage() {
  const { user } = useAuthStore();
  const supabase = createClient();
  const [orders, setOrders] = useState<any[]>([]);
  const [complaintsByOrder, setComplaintsByOrder] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);

  const [complaintOrder, setComplaintOrder] = useState<any | null>(null);
  const [complaintType, setComplaintType] = useState<ComplaintType>('general');
  const [complaintText, setComplaintText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [expandedMapOrderId, setExpandedMapOrderId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchOrders = async () => {
      try {
        const [{ data: orderData, error }, { data: complaints }] = await Promise.all([
          supabase
            .from('orders')
            .select(`
              *,
              order_items (id, quantity, unit_price, product_id),
              deliveries (id, status, pickup_address, delivery_address, agent_id)
            `)
            .eq('buyer_id', user.id)
            .order('created_at', { ascending: false }),
          supabase
            .from('complaints')
            .select('id, order_id, status, complaint_type, refund_amount, created_at')
            .eq('buyer_id', user.id),
        ]);

        if (error) throw error;
        setOrders(orderData || []);

        const map: Record<string, any> = {};
        (complaints || []).forEach((c) => {
          map[c.order_id] = c;
        });
        setComplaintsByOrder(map);
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
      const prefix =
        complaintType === 'return'
          ? '[RETURN REQUEST] '
          : complaintType === 'refund'
            ? '[REFUND REQUEST] '
            : '';

      const { data: ticket, error } = await supabase
        .from('complaints')
        .insert({
          buyer_id: user.id,
          order_id: complaintOrder.id,
          description: prefix + complaintText.trim(),
          complaint_type: complaintType,
          status: 'open',
        })
        .select('id')
        .single();

      if (error) throw error;

      if (complaintType === 'return' || complaintType === 'refund') {
        await supabase
          .from('orders')
          .update({ status: complaintType === 'refund' ? 'refund_requested' : 'return_requested' })
          .eq('id', complaintOrder.id);
      }

      setComplaintsByOrder((prev) => ({
        ...prev,
        [complaintOrder.id]: {
          id: ticket?.id,
          order_id: complaintOrder.id,
          status: 'open',
          complaint_type: complaintType,
        },
      }));

      setOrders((prev) =>
        prev.map((o) =>
          o.id === complaintOrder.id
            ? {
                ...o,
                status: complaintType === 'refund' ? 'refund_requested' : complaintType === 'return' ? 'return_requested' : o.status,
              }
            : o
        )
      );

      setToast(
        complaintType === 'refund'
          ? 'Refund request submitted. Support will review your order.'
          : complaintType === 'return'
            ? 'Return request submitted. Support will contact you.'
            : 'Complaint filed successfully. Support will contact you soon.'
      );
      setComplaintOrder(null);
      setComplaintText('');
      setComplaintType('general');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setToast('Failed to submit: ' + message);
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setToast(null), 4000);
    }
  };

  const openComplaintModal = (order: any, type: ComplaintType) => {
    setComplaintOrder(order);
    setComplaintType(type);
    setComplaintText('');
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-12 relative">
      <Navbar />

      {toast && (
        <div className="fixed bottom-6 right-6 bg-slate-900 text-white text-sm font-bold px-6 py-4 rounded-2xl shadow-2xl z-50 animate-bounce">
          {toast}
        </div>
      )}

      {complaintOrder && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl">
            <h3 className="text-xl font-bold text-slate-900 mb-2">
              {complaintType === 'refund'
                ? 'Request Refund'
                : complaintType === 'return'
                  ? 'Request Return'
                  : 'File a Complaint'}
            </h3>
            <p className="text-sm text-slate-500 mb-4">
              Order #{complaintOrder.id.substring(0, 8).toUpperCase()} · ৳
              {Number(complaintOrder.total_amount).toLocaleString()}
            </p>
            {complaintType === 'return' && (
              <p className="text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-lg p-2 mb-4">
                Bundle orders: partial returns void the bundle discount per our return policy.
              </p>
            )}
            <form onSubmit={handleFileComplaint}>
              <textarea
                value={complaintText}
                onChange={(e) => setComplaintText(e.target.value)}
                placeholder="Describe the issue..."
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
                  {isSubmitting ? 'Submitting...' : 'Submit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-8">My Orders</h1>

        {loading ? (
          <div className="text-center py-12 text-slate-500 font-medium animate-pulse">Loading your orders...</div>
        ) : !user ? (
          <div className="bg-white rounded-3xl p-12 max-w-2xl mx-auto shadow-xl border text-center">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Please Log In</h2>
            <Link href="/" className="px-8 py-3 bg-primary text-white font-bold rounded-xl shadow-lg">
              Go Home
            </Link>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 max-w-2xl mx-auto shadow-xl border text-center">
            <h2 className="text-3xl font-extrabold text-slate-900 mb-4">No Orders Yet</h2>
            <Link href="/explore" className="inline-flex px-8 py-3.5 bg-primary text-white font-bold rounded-xl">
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => {
              const ticket = complaintsByOrder[order.id];
              const canReturn = order.status === 'delivered' || order.status === 'processing';
              const mapOpen = expandedMapOrderId === order.id;
              const mapData = deliveryMapPoints(order);
              const showMap = order.status !== 'cancelled';
              return (
                <div
                  key={order.id}
                  className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col gap-4"
                >
                  <div className="flex flex-col md:flex-row gap-6 md:items-center justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <span className="font-bold text-slate-900 text-lg">
                        Order #{order.id.substring(0, 8).toUpperCase()}
                      </span>
                      <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-slate-100 text-slate-700">
                        {order.status || 'Pending'}
                      </span>
                      {ticket && (
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-700">
                          {ticket.complaint_type || 'ticket'}: {ticket.status}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-500">
                      Placed on: {new Date(order.created_at).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-slate-600 font-medium">
                      {order.order_items?.length || 0} items · {order.shipping_address || '—'}
                    </p>
                  </div>

                  <div className="flex flex-col items-end gap-3">
                    <span className="text-2xl font-black text-slate-900">
                      ৳{Number(order.total_amount).toLocaleString()}
                    </span>
                    <div className="flex flex-wrap gap-2 justify-end">
                      {showMap && (
                        <button
                          type="button"
                          onClick={() => setExpandedMapOrderId(mapOpen ? null : order.id)}
                          className="px-3 py-2 bg-blue-50 text-blue-700 text-xs font-bold rounded-xl hover:bg-blue-100"
                        >
                          {mapOpen ? 'Hide Map' : 'Track Delivery'}
                        </button>
                      )}
                      {!ticket && (
                        <>
                          <button
                            type="button"
                            onClick={() => openComplaintModal(order, 'general')}
                            className="px-3 py-2 bg-red-50 text-red-600 text-xs font-bold rounded-xl hover:bg-red-100"
                          >
                            Complaint
                          </button>
                          {canReturn && (
                            <>
                              <button
                                type="button"
                                onClick={() => openComplaintModal(order, 'return')}
                                className="px-3 py-2 bg-amber-50 text-amber-700 text-xs font-bold rounded-xl hover:bg-amber-100"
                              >
                                Return
                              </button>
                              <button
                                type="button"
                                onClick={() => openComplaintModal(order, 'refund')}
                                className="px-3 py-2 bg-purple-50 text-purple-700 text-xs font-bold rounded-xl hover:bg-purple-100"
                              >
                                Refund
                              </button>
                            </>
                          )}
                        </>
                      )}
                      {ticket && (
                        <span className="px-3 py-2 bg-slate-100 text-slate-600 text-xs font-bold rounded-xl">
                          Ticket {ticket.status}
                        </span>
                      )}
                    </div>
                  </div>
                  </div>
                  {mapOpen && showMap && (
                    <OrderTrackingMap
                      pickup={mapData.pickup}
                      delivery={mapData.delivery}
                      agent={order.status !== 'delivered' ? mapData.agent : undefined}
                      status={mapData.status}
                      className="w-full"
                    />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
