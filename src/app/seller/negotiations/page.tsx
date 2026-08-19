"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useAuthStore } from "@/store/useAuthStore";
import { resolveProductImage } from "@/utils/productImages";
import { sendCheckoutLinkInChat } from "@/utils/negotiationChat";

interface NegotiationView {
  id: string;
  buyer: string;
  buyerId: string;
  product: string;
  image: string;
  originalPrice: number;
  offeredPrice: number;
  qty: number;
  message: string;
  status: string;
  finalPrice?: number;
}

function mapRow(row: Record<string, unknown>): NegotiationView {
  const product = row.products as Record<string, unknown> | null;
  const buyer = row.users as { name?: string } | null;
  const original = Number(row.original_price ?? product?.price ?? row.current_price);
  const offered = Number(row.current_price);

  return {
    id: row.id as string,
    buyer: buyer?.name || 'Buyer',
    buyerId: row.buyer_id as string,
    product: (product?.name as string) || 'Product',
    image: product ? resolveProductImage(product as { name?: string; category?: string; images?: unknown }) : '',
    originalPrice: original,
    offeredPrice: offered,
    qty: Number(row.quantity) || 1,
    message: (row.message as string) || 'Bulk order inquiry',
    status: (row.status as string) || 'open',
    finalPrice: row.final_price != null ? Number(row.final_price) : undefined,
  };
}

export default function NegotiationsPage() {
  const [activeNegotiations, setActiveNegotiations] = useState<NegotiationView[]>([]);
  const [closedNegotiations, setClosedNegotiations] = useState<NegotiationView[]>([]);
  const [counterInputs, setCounterInputs] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const supabase = createClient();
  const { user, profile } = useAuthStore();

  useEffect(() => {
    async function fetchNegotiations() {
      let sellerId = user?.id;
      if (!sellerId) {
        const { data: sellers } = await supabase.from('users').select('id').eq('role', 'seller').limit(1);
        sellerId = sellers?.[0]?.id;
      }
      if (!sellerId) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('negotiations')
        .select(`
          id, buyer_id, current_price, original_price, final_price, quantity, message, status,
          products (name, price, category, images),
          users!buyer_id (name)
        `)
        .eq('seller_id', sellerId)
        .order('created_at', { ascending: false });

      if (error || !data) {
        setActiveNegotiations([]);
        setClosedNegotiations([]);
        setLoading(false);
        return;
      }

      const mapped = data.map((row) => mapRow(row as Record<string, unknown>));
      setActiveNegotiations(mapped.filter((n) => !['accepted', 'ordered', 'rejected'].includes(n.status)));
      setClosedNegotiations(mapped.filter((n) => ['accepted', 'ordered', 'rejected'].includes(n.status)));
      
      const initialInputs: Record<string, number> = {};
      mapped.forEach(m => {
        initialInputs[m.id] = Math.round(m.offeredPrice * 1.05);
      });
      setCounterInputs(initialInputs);
      setLoading(false);
    }
    fetchNegotiations();
  }, [supabase, user?.id]);

  const handleCounter = async (id: string) => {
    const counterPrice = counterInputs[id];
    if (!counterPrice || counterPrice <= 0) {
      alert('Please enter a valid counter-offer price.');
      return;
    }

    await supabase
      .from('negotiations')
      .update({ status: 'countered', current_price: counterPrice })
      .eq('id', id);

    setActiveNegotiations((prev) =>
      prev.map((n) => (n.id === id ? { ...n, status: 'countered', offeredPrice: counterPrice } : n))
    );
    setToast(`Counter-offer of ৳${counterPrice.toLocaleString()} sent to buyer!`);
    setTimeout(() => setToast(null), 3000);
  };

  const handleReject = async (item: NegotiationView) => {
    await supabase
      .from('negotiations')
      .update({ status: 'rejected' })
      .eq('id', item.id);

    setActiveNegotiations((prev) => prev.filter((n) => n.id !== item.id));
    setClosedNegotiations((prev) => [{ ...item, status: 'rejected' }, ...prev]);
    setToast('Offer rejected.');
    setTimeout(() => setToast(null), 3000);
  };

  const copyCheckoutLink = (id: string) => {
    const url = `${window.location.origin}/checkout?negotiation=${id}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2500);
    });
  };

  const handleAccept = async (item: NegotiationView) => {
    await supabase
      .from('negotiations')
      .update({ status: 'accepted', final_price: item.offeredPrice })
      .eq('id', item.id);

    if (item.buyerId && user?.id) {
      await sendCheckoutLinkInChat(supabase, {
        negotiationId: item.id,
        sellerId: user.id,
        buyerId: item.buyerId,
        sellerName: profile?.name || user.email || 'Seller',
      });
    }

    setActiveNegotiations((prev) => prev.filter((n) => n.id !== item.id));
    setClosedNegotiations((prev) => [
      { ...item, status: 'accepted', finalPrice: item.offeredPrice },
      ...prev,
    ]);
    setToast(`Deal accepted at ৳${item.offeredPrice.toLocaleString()}!`);
    setTimeout(() => setToast(null), 3000);
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-500 animate-pulse">Loading negotiations...</div>;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 relative">
      {toast && (
        <div className="fixed top-6 right-6 bg-slate-900 text-white text-xs font-bold px-5 py-3 rounded-2xl shadow-2xl z-50 animate-bounce">
          {toast}
        </div>
      )}

      <div>
        <h1 className="text-2xl font-bold text-slate-900">Bulk Price Negotiations</h1>
        <p className="text-sm text-slate-500 mt-1">Review, counter-offer, or accept bulk deal requests from buyers</p>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-800">Active Requests ({activeNegotiations.length})</h2>
        {activeNegotiations.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-500 text-sm">
            No pending negotiations at this time.
          </div>
        ) : (
          activeNegotiations.map((item) => {
            const currentCounter = counterInputs[item.id] ?? Math.round(item.offeredPrice * 1.05);
            return (
              <div key={item.id} className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col lg:flex-row gap-6 shadow-sm">
                <div className="flex gap-4 lg:w-1/3">
                  <img src={item.image} alt={item.product} className="w-20 h-20 rounded-2xl object-cover bg-slate-100 shrink-0" />
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">{item.product}</h3>
                    <p className="text-xs text-slate-500 mt-1">Quantity: <span className="font-semibold text-slate-800">{item.qty} units</span></p>
                    <span className={`inline-block mt-2 text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full ${
                      item.status === 'countered' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {item.status}
                    </span>
                  </div>
                </div>

                <div className="lg:w-1/4 border-l border-slate-100 pl-6 flex flex-col justify-center">
                  <span className="text-xs text-slate-400">Regular Unit Price</span>
                  <div className="text-sm text-slate-400 line-through">৳{item.originalPrice.toLocaleString()}</div>
                  <span className="text-xs text-slate-500 mt-2">Buyer's Offer / Unit</span>
                  <div className="text-2xl font-black text-emerald-600">৳{item.offeredPrice.toLocaleString()}</div>
                  <span className="text-[11px] text-slate-500 mt-1 font-semibold">Total: ৳{(item.offeredPrice * item.qty).toLocaleString()}</span>
                </div>

                <div className="flex-1 border-l border-slate-100 pl-6 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-center">
                      <p className="text-xs font-bold text-slate-700">Buyer: {item.buyer}</p>
                    </div>
                    <p className="text-xs text-slate-600 italic mt-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      &quot;{item.message}&quot;
                    </p>
                  </div>

                  {/* Negotiation Action Bar */}
                  <div className="mt-4 space-y-3">
                    {/* Custom Counter-Offer Input */}
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                      <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
                        Your Counter-Offer Price (৳ per unit)
                      </label>
                      <div className="flex gap-2 items-center">
                        <input
                          type="number"
                          value={currentCounter}
                          onChange={(e) => setCounterInputs(prev => ({ ...prev, [item.id]: Number(e.target.value) }))}
                          className="w-32 bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-sm font-bold text-slate-900 outline-none focus:border-primary"
                        />
                        <button
                          type="button"
                          onClick={() => setCounterInputs(prev => ({ ...prev, [item.id]: Math.round(item.offeredPrice * 1.05) }))}
                          className="px-2 py-1 text-[11px] bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold rounded"
                        >
                          +5%
                        </button>
                        <button
                          type="button"
                          onClick={() => setCounterInputs(prev => ({ ...prev, [item.id]: Math.round(item.offeredPrice * 1.10) }))}
                          className="px-2 py-1 text-[11px] bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold rounded"
                        >
                          +10%
                        </button>
                        <button
                          type="button"
                          onClick={() => handleCounter(item.id)}
                          className="ml-auto px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg transition shadow-sm"
                        >
                          Send Counter
                        </button>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAccept(item)}
                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl text-xs transition shadow-md shadow-emerald-600/20"
                      >
                        ✓ Accept Buyer's ৳{item.offeredPrice.toLocaleString()}
                      </button>
                      <button
                        onClick={() => handleReject(item)}
                        className="px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 font-bold rounded-xl text-xs transition border border-red-200"
                      >
                        ✕ Reject
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {closedNegotiations.length > 0 && (
        <div className="space-y-4 pt-6 border-t border-slate-200">
          <h2 className="text-lg font-semibold text-slate-500">History ({closedNegotiations.length})</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {closedNegotiations.map((item) => (
              <div key={item.id} className="bg-slate-50 rounded-2xl border p-4 flex gap-4">
                <img src={item.image} alt={item.product} className="w-16 h-16 rounded-xl object-cover grayscale" />
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold text-slate-900 text-xs">{item.product}</h3>
                    <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded ${
                      item.status === 'accepted' || item.status === 'ordered' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {item.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">{item.buyer} · {item.qty} units</p>
                  {item.finalPrice && (
                    <p className="text-xs font-bold text-slate-900 mt-1">Settled at ৳{item.finalPrice.toLocaleString()} / unit</p>
                  )}
                  {item.status === 'accepted' && (
                    <button
                      type="button"
                      onClick={() => copyCheckoutLink(item.id)}
                      className="mt-2 text-xs font-bold text-primary hover:underline block"
                    >
                      {copiedId === item.id ? '✓ Link copied!' : '📋 Copy buyer checkout link'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
