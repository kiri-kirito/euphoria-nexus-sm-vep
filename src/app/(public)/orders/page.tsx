'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { useAuthStore } from '@/store/useAuthStore';
import OrderTrackingMap from '@/components/maps/OrderTrackingMapLazy';
import { deliveryMapPoints } from '@/utils/deliveryMap';
import { resolveProductImage } from '@/utils/productImages';

type ComplaintType = 'general' | 'return' | 'refund';

interface ChatMessage {
  id: number;
  sender: 'User' | 'Support';
  text: string;
  time: string;
}

function parseTicketMessages(description: string, resolution: string | null): ChatMessage[] {
  const initial: ChatMessage[] = [
    {
      id: 1,
      sender: 'User',
      text: description,
      time: 'Initially submitted',
    },
  ];
  if (!resolution) return initial;
  try {
    const parsed = JSON.parse(resolution);
    if (Array.isArray(parsed)) return [...initial, ...parsed];
  } catch {
    if (resolution.trim()) {
      initial.push({
        id: 2,
        sender: 'Support',
        text: resolution,
        time: 'Support update',
      });
    }
  }
  return initial;
}

export default function OrdersPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const supabase = createClient();
  const [mainTab, setMainTab] = useState<'orders' | 'negotiations'>('orders');
  const [orders, setOrders] = useState<any[]>([]);
  const [negotiations, setNegotiations] = useState<any[]>([]);
  const [complaintsByOrder, setComplaintsByOrder] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);

  // File Complaint Modal
  const [complaintOrder, setComplaintOrder] = useState<any | null>(null);
  const [complaintType, setComplaintType] = useState<ComplaintType>('general');
  const [complaintText, setComplaintText] = useState('');
  const [returnProductId, setReturnProductId] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [expandedMapOrderId, setExpandedMapOrderId] = useState<string | null>(null);

  // View Ticket Conversation Modal for Buyer
  const [activeTicket, setActiveTicket] = useState<any | null>(null);
  const [buyerReplyText, setBuyerReplyText] = useState('');
  const [sendingReply, setSendingReply] = useState(false);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const [{ data: orderData, error }, { data: complaints }, { data: negsData }] = await Promise.all([
          supabase
            .from('orders')
            .select(`
              *,
              order_items (id, quantity, unit_price, product_id, products(name, images)),
              deliveries (id, status, pickup_address, delivery_address, agent_id)
            `)
            .eq('buyer_id', user.id)
            .order('created_at', { ascending: false }),
          supabase
            .from('complaints')
            .select('id, order_id, status, complaint_type, refund_amount, created_at, description, resolution')
            .eq('buyer_id', user.id),
          supabase
            .from('negotiations')
            .select(`
              id, current_price, original_price, final_price, quantity, message, status, created_at,
              products (id, name, price, images, category),
              seller:users!seller_id (name, email)
            `)
            .eq('buyer_id', user.id)
            .order('created_at', { ascending: false }),
        ]);

        if (error) throw error;
        setOrders(orderData || []);
        setNegotiations(negsData || []);

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

    fetchData();
  }, [user, supabase]);

  const handleFileComplaint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!complaintOrder || !user || !complaintText.trim()) return;

    setIsSubmitting(true);
    try {
      const prefix =
        complaintType === 'return'
          ? `[RETURN REQUEST]${returnProductId ? ` product: ${returnProductId}` : ''} `
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
        .select('id, description, resolution, status, complaint_type, order_id')
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
        [complaintOrder.id]: ticket,
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
    setReturnProductId(order.order_items?.[0]?.product_id || '');
  };

  const handleSendBuyerReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!buyerReplyText.trim() || !activeTicket) return;

    setSendingReply(true);
    const existingMessages = parseTicketMessages(activeTicket.description, activeTicket.resolution);
    const newMsg: ChatMessage = {
      id: existingMessages.length + 1,
      sender: 'User',
      text: buyerReplyText.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    const updatedMessages = [...existingMessages, newMsg];
    const resolutionPayload = JSON.stringify(updatedMessages.slice(1));

    const { error } = await supabase
      .from('complaints')
      .update({
        resolution: resolutionPayload,
        status: activeTicket.status === 'resolved' ? 'open' : activeTicket.status,
      })
      .eq('id', activeTicket.id);

    setSendingReply(false);
    if (!error) {
      const updatedTicket = {
        ...activeTicket,
        resolution: resolutionPayload,
        status: activeTicket.status === 'resolved' ? 'open' : activeTicket.status,
      };
      setActiveTicket(updatedTicket);
      setComplaintsByOrder((prev) => ({
        ...prev,
        [activeTicket.order_id]: updatedTicket,
      }));
      setBuyerReplyText('');
    } else {
      alert('Failed to send reply: ' + error.message);
    }
  };

  const [buyerCounterInputs, setBuyerCounterInputs] = useState<Record<string, number>>({});
  const [activeBuyerCounterId, setActiveBuyerCounterId] = useState<string | null>(null);

  const handleAcceptCounterOffer = async (negId: string, finalPrice: number) => {
    await supabase
      .from('negotiations')
      .update({ status: 'accepted', final_price: finalPrice })
      .eq('id', negId);

    setNegotiations(prev => prev.map(n => n.id === negId ? { ...n, status: 'accepted', final_price: finalPrice } : n));
    setToast('Counter-offer accepted! You can now proceed to checkout.');
    setTimeout(() => setToast(null), 3000);
  };

  const handleCancelNegotiation = async (negId: string) => {
    if (!confirm('Are you sure you want to cancel / withdraw this negotiation?')) return;
    await supabase
      .from('negotiations')
      .update({ status: 'rejected' })
      .eq('id', negId);

    setNegotiations(prev => prev.map(n => n.id === negId ? { ...n, status: 'rejected' } : n));
    setToast('Negotiation cancelled.');
    setTimeout(() => setToast(null), 3000);
  };

  const handleSendBuyerCounter = async (negId: string) => {
    const newPrice = buyerCounterInputs[negId];
    if (!newPrice || newPrice <= 0) {
      alert('Please enter a valid price offer.');
      return;
    }

    await supabase
      .from('negotiations')
      .update({ status: 'open', current_price: newPrice, updated_at: new Date().toISOString() })
      .eq('id', negId);

    setNegotiations(prev => prev.map(n => n.id === negId ? { ...n, status: 'open', current_price: newPrice } : n));
    setActiveBuyerCounterId(null);
    setToast(`Counter-offer of ৳${newPrice.toLocaleString()} sent to seller!`);
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-12 relative">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 bg-slate-900 text-white text-sm font-bold px-6 py-4 rounded-2xl shadow-2xl z-50 animate-bounce">
          {toast}
        </div>
      )}

      {/* Buyer Support Ticket Conversation Modal */}
      {activeTicket && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl border border-slate-100 flex flex-col max-h-[85vh] overflow-hidden animate-fade-in">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Support Ticket #{activeTicket.id.substring(0, 8)}
                </h3>
                <p className="text-xs text-slate-500">
                  Type: <span className="font-semibold capitalize text-primary">{activeTicket.complaint_type || 'General'}</span> · Status:{' '}
                  <span className="font-semibold uppercase text-emerald-600">{activeTicket.status}</span>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveTicket(null)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-200 transition"
              >
                ✕
              </button>
            </div>

            {/* Conversation Messages */}
            <div className="flex-1 p-5 overflow-y-auto space-y-3 bg-slate-50/50">
              {parseTicketMessages(activeTicket.description, activeTicket.resolution).map((msg) => {
                const isMe = msg.sender === 'User';
                return (
                  <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                    <span className="text-[10px] text-slate-500 font-semibold mb-1 px-1">
                      {isMe ? 'You' : 'Euphoria Support Agent'}
                    </span>
                    <div
                      className={`px-4 py-3 rounded-2xl max-w-[85%] text-sm ${
                        isMe
                          ? 'bg-primary text-white rounded-br-none shadow-md shadow-primary/20'
                          : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none shadow-sm'
                      }`}
                    >
                      {msg.text}
                    </div>
                    <span className="text-[9px] text-slate-400 mt-1 px-1">{msg.time}</span>
                  </div>
                );
              })}
            </div>

            {/* Reply Input Form */}
            <form onSubmit={handleSendBuyerReply} className="p-4 bg-white border-t border-slate-100 flex gap-2">
              <input
                type="text"
                value={buyerReplyText}
                onChange={(e) => setBuyerReplyText(e.target.value)}
                placeholder="Reply to support agent..."
                className="flex-1 bg-slate-100 border-none rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                disabled={sendingReply}
              />
              <button
                type="submit"
                disabled={!buyerReplyText.trim() || sendingReply}
                className="bg-primary hover:bg-primary-dark text-white font-bold text-xs px-5 py-2.5 rounded-xl transition disabled:opacity-50"
              >
                {sendingReply ? 'Sending...' : 'Send'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* File Complaint / Return Modal */}
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
            {complaintType === 'return' && (complaintOrder.order_items?.length ?? 0) > 1 && (
              <div className="mb-4">
                <label className="text-xs font-semibold text-slate-600 block mb-1">Item to return</label>
                <select
                  value={returnProductId}
                  onChange={(e) => setReturnProductId(e.target.value)}
                  className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2"
                >
                  {(complaintOrder.order_items || []).map((item: any) => (
                    <option key={item.product_id || item.id} value={item.product_id || item.id}>
                      {item.products?.name || `Product ${item.product_id?.substring(0, 8)}`} (৳{item.unit_price} × {item.quantity})
                    </option>
                  ))}
                </select>
              </div>
            )}
            <form onSubmit={handleFileComplaint}>
              <textarea
                value={complaintText}
                onChange={(e) => setComplaintText(e.target.value)}
                placeholder="Describe why you want to return or refund this item..."
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
                  {isSubmitting ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Account Activity</h1>
          
          {/* Main Tabs */}
          <div className="flex bg-slate-200/80 p-1.5 rounded-2xl w-fit">
            <button
              onClick={() => setMainTab('orders')}
              className={`px-5 py-2.5 rounded-xl font-bold text-xs transition-all ${
                mainTab === 'orders' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              📦 My Orders ({orders.length})
            </button>
            <button
              onClick={() => setMainTab('negotiations')}
              className={`px-5 py-2.5 rounded-xl font-bold text-xs transition-all ${
                mainTab === 'negotiations' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              🤝 Price Negotiations ({negotiations.length})
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12 text-slate-500 font-medium animate-pulse">Loading data...</div>
        ) : !user ? (
          <div className="bg-white rounded-3xl p-12 max-w-2xl mx-auto shadow-xl border text-center">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Please Log In</h2>
            <Link href="/" className="px-8 py-3 bg-primary text-white font-bold rounded-xl shadow-lg">
              Go Home
            </Link>
          </div>
        ) : mainTab === 'negotiations' ? (
          /* NEGOTIATIONS TAB CONTENT */
          negotiations.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 max-w-2xl mx-auto shadow-xl border text-center">
              <h2 className="text-2xl font-bold text-slate-900 mb-2">No Active Negotiations</h2>
              <p className="text-slate-500 text-sm mb-6">You haven't initiated any bulk price negotiations yet.</p>
              <Link href="/explore" className="inline-flex px-8 py-3.5 bg-primary text-white font-bold rounded-xl shadow-lg">
                Explore Catalog & Negotiate
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {negotiations.map((neg) => {
                const product = neg.products;
                const seller = neg.seller;
                const image = resolveProductImage(product);
                const isAccepted = neg.status === 'accepted';
                const isCountered = neg.status === 'countered';
                const isRejected = neg.status === 'rejected';

                return (
                  <div key={neg.id} className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
                    <div className="flex gap-4 items-center">
                      <img src={image} alt="" className="w-20 h-20 rounded-2xl object-cover bg-slate-100 shrink-0" />
                      <div>
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <h3 className="font-bold text-slate-900 text-base">{product?.name || 'Product'}</h3>
                          <span className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full ${
                            isAccepted ? 'bg-emerald-100 text-emerald-800' : isCountered ? 'bg-blue-100 text-blue-800' : isRejected ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {neg.status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500">Seller: <span className="font-semibold text-slate-700">{seller?.name || 'Verified Vendor'}</span></p>
                        <p className="text-xs text-slate-500 mt-0.5">Quantity: <span className="font-bold text-slate-800">{neg.quantity} units</span></p>
                        <p className="text-xs text-slate-400 mt-1">Submitted on {new Date(neg.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>

                    <div className="flex flex-col md:items-end gap-3 w-full md:w-auto">
                      <div className="flex items-baseline gap-3">
                        {neg.original_price && (
                          <span className="text-xs text-slate-400 line-through">৳{Number(neg.original_price).toLocaleString()}</span>
                        )}
                        <div className="text-right">
                          <span className="text-[10px] font-bold text-slate-400 block">
                            {isCountered ? 'SELLER COUNTER-OFFER' : 'OFFER PRICE'}
                          </span>
                          <span className="text-2xl font-black text-emerald-600">
                            ৳{Number(neg.current_price).toLocaleString()} <span className="text-xs font-normal text-slate-500">/ unit</span>
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 justify-end w-full">
                        {isCountered && (
                          <>
                            <button
                              type="button"
                              onClick={() => handleAcceptCounterOffer(neg.id, Number(neg.current_price))}
                              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition"
                            >
                              ✓ Accept Counter (৳{Number(neg.current_price).toLocaleString()})
                            </button>
                            <button
                              type="button"
                              onClick={() => setActiveBuyerCounterId(activeBuyerCounterId === neg.id ? null : neg.id)}
                              className="px-4 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs rounded-xl border border-blue-200 transition"
                            >
                              💬 Propose New Counter
                            </button>
                            <button
                              type="button"
                              onClick={() => handleCancelNegotiation(neg.id)}
                              className="px-3.5 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 font-bold text-xs rounded-xl border border-red-200 transition"
                            >
                              ✕ Cancel Deal
                            </button>
                          </>
                        )}
                        {isAccepted && (
                          <Link
                            href={`/checkout?negotiation=${neg.id}`}
                            className="px-5 py-2.5 bg-primary hover:bg-primary-dark text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-1.5"
                          >
                            <span>🛒</span> Proceed to Checkout (৳{Number((neg.final_price || neg.current_price) * neg.quantity).toLocaleString()})
                          </Link>
                        )}
                        {neg.status === 'open' && (
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-2 rounded-xl">
                              ⏳ Waiting for Seller Response
                            </span>
                            <button
                              type="button"
                              onClick={() => handleCancelNegotiation(neg.id)}
                              className="px-3.5 py-2 bg-red-50 hover:bg-red-100 text-red-600 font-bold text-xs rounded-xl border border-red-200 transition"
                            >
                              ✕ Withdraw
                            </button>
                          </div>
                        )}
                        {isRejected && (
                          <span className="text-xs font-semibold text-red-600 bg-red-50 px-3 py-2 rounded-xl border border-red-100">
                            ✕ Negotiation Closed
                          </span>
                        )}
                      </div>

                      {/* Buyer Counter Offer Input Form */}
                      {activeBuyerCounterId === neg.id && (
                        <div className="w-full mt-3 p-4 bg-blue-50/70 border border-blue-200 rounded-2xl animate-fade-in flex flex-col gap-2.5">
                          <div className="flex justify-between items-center text-xs">
                            <span className="font-bold text-blue-950">Your New Counter-Offer Price (৳ per unit):</span>
                            <span className="font-extrabold text-blue-800">
                              Total: ৳{((buyerCounterInputs[neg.id] || Number(neg.current_price)) * neg.quantity).toLocaleString()}
                            </span>
                          </div>
                          <div className="flex gap-2">
                            <div className="relative flex-1">
                              <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-400">৳</span>
                              <input
                                type="number"
                                value={buyerCounterInputs[neg.id] ?? ''}
                                onChange={(e) => setBuyerCounterInputs(prev => ({ ...prev, [neg.id]: Number(e.target.value) }))}
                                placeholder="Enter your target price per unit..."
                                className="w-full bg-white border border-blue-300 rounded-xl pl-7 pr-3 py-2 text-xs font-bold text-slate-900 outline-none focus:ring-2 focus:ring-blue-500/20"
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => handleSendBuyerCounter(neg.id)}
                              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition shrink-0"
                            >
                              Submit Counter →
                            </button>
                            <button
                              type="button"
                              onClick={() => setActiveBuyerCounterId(null)}
                              className="px-3 py-2 bg-white text-slate-600 font-bold text-xs rounded-xl border border-slate-200 hover:bg-slate-50 transition"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )
        ) : (
          /* ORDERS TAB CONTENT */
          orders.length === 0 ? (
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
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                              ticket.status === 'resolved' ? 'bg-emerald-100 text-emerald-700' : 'bg-purple-100 text-purple-700'
                            }`}>
                              {ticket.complaint_type || 'Ticket'}: {ticket.status}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-slate-500">
                          Placed on: {new Date(order.created_at).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-slate-600 font-medium">
                          {order.order_items?.length || 0} item(s) · {order.shipping_address || '—'}
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
                                    Request Return
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => openComplaintModal(order, 'refund')}
                                    className="px-3 py-2 bg-purple-50 text-purple-700 text-xs font-bold rounded-xl hover:bg-purple-100"
                                  >
                                    Request Refund
                                  </button>
                                </>
                              )}
                            </>
                          )}
                          {ticket && (
                            <button
                              type="button"
                              onClick={() => setActiveTicket(ticket)}
                              className="px-3.5 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl transition shadow-md shadow-teal-600/20 flex items-center gap-1.5"
                            >
                              <span>💬</span> View Support Chat & Updates
                            </button>
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
          )
        )}
      </main>
    </div>
  );
}
