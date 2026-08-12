"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useAuthStore } from "@/store/useAuthStore";

interface StockRequestView {
  id: string;
  product: string;
  quantity: number;
  targetPrice: number;
  status: string;
  requesterLabel: string;
}

export default function BlindBiddingPage() {
  const [requests, setRequests] = useState<StockRequestView[]>([]);
  const [loading, setLoading] = useState(true);
  const [bidAmounts, setBidAmounts] = useState<Record<string, string>>({});
  const supabase = createClient();
  const { user } = useAuthStore();

  useEffect(() => {
    async function fetchRequests() {
      const { data, error } = await supabase
        .from('stock_requests')
        .select(`
          id, quantity, target_price, status,
          products (name),
          users!requesting_seller_id (name)
        `)
        .eq('status', 'open')
        .order('created_at', { ascending: false });

      if (error || !data) {
        setRequests([]);
        setLoading(false);
        return;
      }

      setRequests(
        data.map((row: Record<string, unknown>) => ({
          id: row.id as string,
          product: (row.products as { name?: string })?.name || 'Product',
          quantity: row.quantity as number,
          targetPrice: Number(row.target_price),
          status: (row.status as string) || 'open',
          requesterLabel: 'Anonymous Seller',
        }))
      );
      setLoading(false);
    }
    fetchRequests();
  }, [supabase]);

  const handleBidSubmit = async (requestId: string) => {
    const amount = Number(bidAmounts[requestId]);
    if (!amount || !user?.id) return;

    const { error } = await supabase.from('stock_bids').insert({
      request_id: requestId,
      bidding_seller_id: user.id,
      bid_price: amount,
      status: 'pending',
    });

    if (error) {
      alert('Could not submit bid: ' + error.message);
      return;
    }

    setRequests((prev) =>
      prev.map((r) => (r.id === requestId ? { ...r, status: 'bid_placed' } : r))
    );
    alert(`Bid of ৳${amount.toLocaleString()} submitted securely!`);
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-500 animate-pulse">Loading bidding board...</div>;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Inter-Seller Stock Exchange</h1>
        <p className="text-slate-500 text-sm mt-1">Source products anonymously from other sellers</p>
      </div>

      {requests.length === 0 ? (
        <p className="text-slate-500 py-8 text-center">No open stock requests right now.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {requests.map((req) => (
            <div key={req.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-slate-900 text-lg">{req.product}</h3>
                  <p className="text-sm text-slate-500">Requested by: {req.requesterLabel}</p>
                </div>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700">
                  {req.status === 'open' ? 'Open' : 'Bid Placed'}
                </span>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl flex justify-between mb-6">
                <div>
                  <p className="text-xs text-slate-500 uppercase mb-1">Quantity</p>
                  <p className="font-bold">{req.quantity} units</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-500 uppercase mb-1">Target / unit</p>
                  <p className="font-bold">৳{req.targetPrice.toLocaleString()}</p>
                </div>
              </div>
              {req.status === 'open' ? (
                <div className="flex gap-3 mt-auto">
                  <input
                    type="number"
                    placeholder="Your bid (৳)"
                    className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                    value={bidAmounts[req.id] || ''}
                    onChange={(e) => setBidAmounts({ ...bidAmounts, [req.id]: e.target.value })}
                  />
                  <button
                    onClick={() => handleBidSubmit(req.id)}
                    className="bg-slate-900 text-white font-semibold px-4 py-2 rounded-lg text-sm"
                  >
                    Submit Blind Bid
                  </button>
                </div>
              ) : (
                <p className="text-center text-sm text-slate-600 bg-slate-100 p-3 rounded-lg">Bid submitted — awaiting response.</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
