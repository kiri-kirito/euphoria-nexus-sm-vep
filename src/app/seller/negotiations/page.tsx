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
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const supabase = createClient();
  const { user, profile } = useAuthStore();

  useEffect(() => {
    async function fetchNegotiations() {
      if (!user?.id) {
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
        .eq('seller_id', user.id)
        .order('created_at', { ascending: false });

      if (error || !data) {
        setActiveNegotiations([]);
        setClosedNegotiations([]);
        setLoading(false);
        return;
      }

      const mapped = data.map((row) => mapRow(row as Record<string, unknown>));
      setActiveNegotiations(mapped.filter((n) => n.status !== 'accepted' && n.status !== 'ordered'));
      setClosedNegotiations(mapped.filter((n) => n.status === 'accepted' || n.status === 'ordered'));
      setLoading(false);
    }
    fetchNegotiations();
  }, [supabase, user?.id]);

  const handleCounter = async (id: string, counterPrice: number) => {
    await supabase
      .from('negotiations')
      .update({ status: 'countered', current_price: counterPrice })
      .eq('id', id);
    setActiveNegotiations((prev) =>
      prev.map((n) => (n.id === id ? { ...n, status: 'countered', offeredPrice: counterPrice } : n))
    );
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
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-500 animate-pulse">Loading negotiations...</div>;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <h1 className="text-2xl font-bold text-slate-900">Negotiations</h1>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Active Requests ({activeNegotiations.length})</h2>
        {activeNegotiations.length === 0 ? (
          <p className="text-slate-500">No active bulk requests right now.</p>
        ) : (
          activeNegotiations.map((item) => (
            <div key={item.id} className="bg-white rounded-2xl border border-slate-200 p-5 flex flex-col md:flex-row gap-6">
              <div className="flex gap-4 md:w-1/3">
                <img src={item.image} alt={item.product} className="w-20 h-20 rounded-xl object-cover bg-slate-100" />
                <div>
                  <h3 className="font-bold text-slate-900">{item.product}</h3>
                  <p className="text-sm text-slate-500">Qty: {item.qty}</p>
                  <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">{item.status}</span>
                </div>
              </div>
              <div className="md:w-1/4 border-l pl-6">
                <div className="text-sm text-slate-400 line-through">৳{item.originalPrice.toLocaleString()}</div>
                <div className="text-xl font-bold">৳{item.offeredPrice.toLocaleString()}</div>
              </div>
              <div className="flex-1 border-l pl-6">
                <p className="text-sm font-semibold">{item.buyer}</p>
                <p className="text-sm text-slate-600 italic mt-2 bg-slate-50 p-2 rounded">&quot;{item.message}&quot;</p>
                <div className="flex gap-3 mt-4">
                  <button onClick={() => handleAccept(item)} className="flex-1 bg-primary text-white font-semibold py-2 rounded-lg text-sm">
                    Accept Offer
                  </button>
                  <button
                    onClick={() => handleCounter(item.id, Math.round(item.offeredPrice * 1.05))}
                    className="flex-1 border border-slate-300 font-semibold py-2 rounded-lg text-sm"
                  >
                    Counter +5%
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {closedNegotiations.length > 0 && (
        <div className="space-y-4 pt-6">
          <h2 className="text-lg font-semibold text-slate-500">Closed</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {closedNegotiations.map((item) => (
              <div key={item.id} className="bg-slate-50 rounded-2xl border p-4 flex gap-4">
                <img src={item.image} alt={item.product} className="w-16 h-16 rounded-lg object-cover grayscale" />
                <div>
                  <h3 className="font-semibold">{item.product}</h3>
                  <p className="text-xs text-slate-500">{item.buyer} · {item.qty} units</p>
                  <p className="text-sm font-medium mt-1">Settled at ৳{item.finalPrice?.toLocaleString()}</p>
                  {item.status === 'accepted' && (
                    <button
                      type="button"
                      onClick={() => copyCheckoutLink(item.id)}
                      className="mt-2 text-xs font-bold text-primary hover:underline"
                    >
                      {copiedId === item.id ? 'Link copied!' : 'Copy buyer checkout link'}
                    </button>
                  )}
                  {item.status === 'ordered' && (
                    <p className="text-xs text-emerald-600 font-semibold mt-1">Buyer completed checkout</p>
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
