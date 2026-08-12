"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";

interface Negotiation {
  id: number;
  buyer: string;
  location: string;
  product: string;
  image: string;
  originalPrice: number;
  offeredPrice: number;
  discount: string;
  qty: number;
  message: string;
  status: string;
  finalPrice?: number;
}

const MOCK_ACTIVE: Negotiation[] = [
  {
    id: 1,
    buyer: "Rahim Store",
    location: "Dhaka, BD",
    product: "Logitech MX Master 3S",
    image: "https://images.unsplash.com/photo-1527814050087-379381547969?q=80&w=200&auto=format&fit=crop",
    originalPrice: 10500,
    offeredPrice: 9000,
    discount: "14%",
    qty: 25,
    message: "Looking for a better deal on a bulk order for our new branch.",
    status: "Pending"
  }
];

const MOCK_CLOSED: Negotiation[] = [
  {
    id: 4,
    buyer: "Gadget Hub",
    location: "Khulna, BD",
    product: "Sony WH-1000XM4",
    image: "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?q=80&w=200&auto=format&fit=crop",
    originalPrice: 32000,
    offeredPrice: 28000,
    discount: "12%",
    finalPrice: 29500,
    qty: 5,
    message: "",
    status: "Accepted"
  }
];

export default function NegotiationsPage() {
  const [activeNegotiations, setActiveNegotiations] = useState<Negotiation[]>([]);
  const [closedNegotiations, setClosedNegotiations] = useState<Negotiation[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  const [dbActive, setDbActive] = useState(false);

  useEffect(() => {
    async function fetchNegotiations() {
      try {
        const { data, error } = await supabase.from('negotiations').select('*');
        if (error) {
          // Table doesn't exist, use mock fallback
          setActiveNegotiations(MOCK_ACTIVE);
          setClosedNegotiations(MOCK_CLOSED);
          setDbActive(false);
        } else if (data) {
          setActiveNegotiations(data.filter(n => n.status !== 'Accepted'));
          setClosedNegotiations(data.filter(n => n.status === 'Accepted'));
          setDbActive(true);
        }
      } catch (err) {
        setActiveNegotiations(MOCK_ACTIVE);
        setClosedNegotiations(MOCK_CLOSED);
        setDbActive(false);
      } finally {
        setLoading(false);
      }
    }
    fetchNegotiations();
  }, [supabase]);

  const handleCounter = async (id: number) => {
    if (dbActive) {
      await supabase.from('negotiations').update({ status: 'Countered', offeredPrice: 9500 }).eq('id', id);
    }
    setActiveNegotiations(prev => prev.map(n => n.id === id ? { ...n, status: "Countered", offeredPrice: 9500 } : n));
  };

  const handleAccept = async (id: number) => {
    const itemToAccept = activeNegotiations.find(n => n.id === id);
    if (!itemToAccept) return;
    
    if (dbActive) {
      await supabase.from('negotiations').update({ status: 'Accepted', finalPrice: itemToAccept.offeredPrice }).eq('id', id);
    }
    
    const closedItem = { ...itemToAccept, status: "Accepted", finalPrice: itemToAccept.offeredPrice };
    setActiveNegotiations(prev => prev.filter(n => n.id !== id));
    setClosedNegotiations(prev => [closedItem, ...prev]);
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-500 animate-pulse">Loading negotiations...</div>;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Negotiations</h1>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-800">Active Requests ({activeNegotiations.length})</h2>
        <div className="grid grid-cols-1 gap-4">
          {activeNegotiations.map((item) => (
            <div key={item.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col md:flex-row gap-6 hover:shadow-md transition-shadow">
              {/* Product Info */}
              <div className="flex gap-4 md:w-1/3">
                <img src={item.image} alt={item.product} className="w-20 h-20 rounded-xl object-cover bg-slate-100" />
                <div>
                  <h3 className="font-bold text-slate-900 line-clamp-2 leading-tight">{item.product}</h3>
                  <p className="text-sm text-slate-500 mt-1">Qty Requested: <span className="font-semibold text-slate-700">{item.qty} units</span></p>
                  <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-50 text-amber-700 text-xs font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                    {item.status}
                  </div>
                </div>
              </div>

              {/* Pricing */}
              <div className="md:w-1/4 border-l border-slate-100 pl-6 flex flex-col justify-center">
                <div className="text-sm text-slate-500 line-through">৳{item.originalPrice.toLocaleString()}</div>
                <div className="text-xl font-bold text-slate-900">৳{item.offeredPrice.toLocaleString()}</div>
                <div className="text-xs font-medium text-emerald-600 mt-1">They want {item.discount} off</div>
              </div>

              {/* Buyer Info & Actions */}
              <div className="flex-1 border-l border-slate-100 pl-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold">
                      {item.buyer?.charAt(0) || '?'}
                    </div>
                    <span className="text-sm font-semibold text-slate-900">{item.buyer}</span>
                    <span className="text-xs text-slate-400">• {item.location}</span>
                  </div>
                  <p className="text-sm text-slate-600 italic bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    "{item.message}"
                  </p>
                </div>
                <div className="flex gap-3 mt-4">
                  <button onClick={() => handleAccept(item.id)} className="flex-1 bg-primary hover:bg-primary/90 text-white font-semibold py-2 rounded-lg transition-colors text-sm shadow-sm">
                    Accept Offer
                  </button>
                  <button onClick={() => handleCounter(item.id)} className="flex-1 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-semibold py-2 rounded-lg transition-colors text-sm">
                    Counter Offer
                  </button>
                </div>
              </div>
            </div>
          ))}
          {activeNegotiations.length === 0 && (
            <p className="text-slate-500 py-4">No active bulk requests right now.</p>
          )}
        </div>
      </div>

      <div className="space-y-4 pt-6">
        <h2 className="text-lg font-semibold text-slate-500">Closed Negotiations</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 opacity-75">
          {closedNegotiations.map((item) => (
            <div key={item.id} className="bg-slate-50 rounded-2xl border border-slate-200 p-4 flex gap-4">
              <img src={item.image} alt={item.product} className="w-16 h-16 rounded-lg object-cover grayscale" />
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <h3 className="font-semibold text-slate-700 line-clamp-1">{item.product}</h3>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                    item.status === 'Accepted' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {item.status}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">{item.buyer} • {item.qty} units</p>
                <div className="mt-2 text-sm font-medium text-slate-700">
                  {item.status === 'Accepted' ? `Settled at ৳${item.finalPrice?.toLocaleString()}` : `Offered ৳${item.offeredPrice.toLocaleString()}`}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
