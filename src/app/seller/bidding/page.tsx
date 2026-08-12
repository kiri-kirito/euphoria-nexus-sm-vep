"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";
import { useAuthStore } from "@/store/useAuthStore";
import { io } from "socket.io-client";
import { getBackendSocketUrl } from "@/utils/backendUrl";
import { buildSocketAuthOptions } from "@/utils/socketAuth";

interface StockRequestView {
  id: string;
  product: string;
  productId?: string;
  quantity: number;
  targetPrice: number;
  status: string;
  requesterLabel: string;
}

interface MyRequestView {
  id: string;
  product: string;
  quantity: number;
  targetPrice: number;
  status: string;
  bids: { id: string; bidPrice: number; status: string }[];
}

export default function BlindBiddingPage() {
  const [requests, setRequests] = useState<StockRequestView[]>([]);
  const [myRequests, setMyRequests] = useState<MyRequestView[]>([]);
  const [loading, setLoading] = useState(true);
  const [bidAmounts, setBidAmounts] = useState<Record<string, string>>({});
  const [myProducts, setMyProducts] = useState<{ id: string; name: string }[]>([]);
  const [postProductId, setPostProductId] = useState("");
  const [postQty, setPostQty] = useState("10");
  const [postTarget, setPostTarget] = useState("");
  const [posting, setPosting] = useState(false);
  const supabase = createClient();
  const { user } = useAuthStore();

  const loadBoard = useCallback(async () => {
    const { data, error } = await supabase
      .from("stock_requests")
      .select(`
        id, quantity, target_price, status, product_id, requesting_seller_id,
        products (name),
        users!requesting_seller_id (name)
      `)
      .eq("status", "open")
      .order("created_at", { ascending: false });

    if (error || !data) {
      setRequests([]);
    } else {
      setRequests(
        data
          .filter((row) => row.id && row.requesting_seller_id !== user?.id)
          .map((row: Record<string, unknown>) => ({
            id: row.id as string,
            productId: row.product_id as string | undefined,
            product: (row.products as { name?: string })?.name || "Product",
            quantity: row.quantity as number,
            targetPrice: Number(row.target_price),
            status: (row.status as string) || "open",
            requesterLabel: "Anonymous Seller",
          }))
      );
    }

    if (user?.id) {
      const [{ data: mine }, { data: myReqData }] = await Promise.all([
        supabase.from("products").select("id, name").eq("seller_id", user.id).eq("status", "active").limit(50),
        supabase
        .from("stock_requests")
        .select(`
          id, quantity, target_price, status,
          products (name),
          stock_bids (id, bid_price, status)
        `)
        .eq("requesting_seller_id", user.id)
        .order("created_at", { ascending: false })
        .limit(10),
      ]);

      setMyProducts(mine || []);

      setMyRequests(
        (myReqData || []).map((row: Record<string, unknown>) => ({
          id: row.id as string,
          product: (row.products as { name?: string })?.name || "Product",
          quantity: row.quantity as number,
          targetPrice: Number(row.target_price),
          status: (row.status as string) || "open",
          bids: ((row.stock_bids as { id: string; bid_price: number; status: string }[]) || []).map((b) => ({
            id: b.id,
            bidPrice: Number(b.bid_price),
            status: b.status,
          })),
        }))
      );
    }

    setLoading(false);
  }, [supabase, user?.id]);

  useEffect(() => {
    loadBoard();
  }, [loadBoard]);

  const handleBidSubmit = async (requestId: string, requesterId?: string) => {
    const amount = Number(bidAmounts[requestId]);
    if (!amount || !user?.id) return;

    const { data: bidRow, error } = await supabase
      .from("stock_bids")
      .insert({
        request_id: requestId,
        bidding_seller_id: user.id,
        bid_price: amount,
        status: "pending",
      })
      .select("id")
      .single();

    if (error) {
      alert("Could not submit bid: " + error.message);
      return;
    }

    try {
      const socketOpts = await buildSocketAuthOptions();
      const socket = io(getBackendSocketUrl("/bidding"), socketOpts);
      socket.emit("submit_bid", {
        requestId,
        requesterId,
        biddingSellerId: user.id,
        amount,
      });
      setTimeout(() => socket.disconnect(), 500);
    } catch {
      /* DB is source of truth */
    }

    setRequests((prev) =>
      prev.map((r) => (r.id === requestId ? { ...r, status: "bid_placed" } : r))
    );
    alert(`Bid of ৳${amount.toLocaleString()} submitted securely!`);
  };

  const handleAcceptBid = async (requestId: string, bidId: string) => {
    if (!user?.id) return;

    const { data: bid } = await supabase
      .from("stock_bids")
      .select("bid_price, bidding_seller_id")
      .eq("id", bidId)
      .maybeSingle();

    await supabase.from("stock_bids").update({ status: "accepted" }).eq("id", bidId);
    await supabase.from("stock_requests").update({ status: "closed" }).eq("id", requestId);

    if (bid) {
      await supabase.from("escrow").insert({
        stock_request_id: requestId,
        from_seller_id: bid.bidding_seller_id,
        to_seller_id: user.id,
        amount: bid.bid_price,
        status: "held",
        description: "Stock exchange escrow — awaiting transfer confirmation",
      });
    }

    try {
      const socketOpts = await buildSocketAuthOptions();
      const socket = io(getBackendSocketUrl("/bidding"), socketOpts);
      socket.emit("accept_bid", { requestId, bidId, requesterId: user.id });
      setTimeout(() => socket.disconnect(), 500);
    } catch {
      /* optional */
    }

    await loadBoard();
    alert("Bid accepted — escrow initiated.");
  };

  const handlePostRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id || !postProductId || !postTarget) return;
    setPosting(true);

    const quantity = parseInt(postQty, 10) || 1;
    const targetPrice = parseFloat(postTarget) || 0;

    const { data: row, error } = await supabase
      .from("stock_requests")
      .insert({
        requesting_seller_id: user.id,
        product_id: postProductId,
        quantity,
        target_price: targetPrice,
        status: "open",
      })
      .select("id")
      .single();

    if (error) {
      alert("Could not post request: " + error.message);
      setPosting(false);
      return;
    }

    try {
      const socketOpts = await buildSocketAuthOptions();
      const socket = io(getBackendSocketUrl("/bidding"), socketOpts);
      socket.emit("post_request", {
        id: row?.id,
        requestingSellerId: user.id,
        productId: postProductId,
        quantity,
        targetPrice,
      });
      setTimeout(() => socket.disconnect(), 500);
    } catch {
      /* DB is source of truth */
    }

    setPostProductId("");
    setPostTarget("");
    setPosting(false);
    await loadBoard();
    alert("Stock request posted to the exchange.");
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

      <form onSubmit={handlePostRequest} className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
        <h2 className="font-bold text-slate-900">Post a Stock Request</h2>
        <p className="text-xs text-slate-500">Need inventory from another seller? Post anonymously and receive blind bids.</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <select
            required
            value={postProductId}
            onChange={(e) => setPostProductId(e.target.value)}
            className="border rounded-xl px-4 py-2 text-sm"
          >
            <option value="">Your product to restock...</option>
            {myProducts.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          <input
            required
            type="number"
            min={1}
            value={postQty}
            onChange={(e) => setPostQty(e.target.value)}
            placeholder="Quantity"
            className="border rounded-xl px-4 py-2 text-sm"
          />
          <input
            required
            type="number"
            min={1}
            value={postTarget}
            onChange={(e) => setPostTarget(e.target.value)}
            placeholder="Target price per unit (৳)"
            className="border rounded-xl px-4 py-2 text-sm"
          />
        </div>
        <button
          type="submit"
          disabled={posting || myProducts.length === 0}
          className="bg-primary text-white px-6 py-2.5 rounded-xl font-semibold text-sm disabled:opacity-50"
        >
          {posting ? "Posting..." : "Post to Exchange"}
        </button>
      </form>

      {myRequests.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-slate-900">My Stock Requests</h2>
          {myRequests.map((req) => (
            <div key={req.id} className="bg-white rounded-2xl border border-slate-200 p-5">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-bold text-slate-900">{req.product}</h3>
                  <p className="text-xs text-slate-500">
                    {req.quantity} units · target ৳{req.targetPrice.toLocaleString()}/unit · {req.status}
                  </p>
                </div>
              </div>
              {req.bids.length === 0 ? (
                <p className="text-sm text-slate-500">No blind bids yet.</p>
              ) : (
                <ul className="space-y-2">
                  {req.bids.map((bid) => (
                    <li key={bid.id} className="flex items-center justify-between bg-slate-50 rounded-lg px-3 py-2 text-sm">
                      <span>
                        Anonymous bid: <strong>৳{bid.bidPrice.toLocaleString()}</strong> ({bid.status})
                      </span>
                      {req.status === "open" && bid.status === "pending" && (
                        <button
                          type="button"
                          onClick={() => handleAcceptBid(req.id, bid.id)}
                          className="text-xs font-bold text-white bg-primary px-3 py-1.5 rounded-lg"
                        >
                          Accept
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}

      {requests.length === 0 ? (
        <p className="text-slate-500 py-8 text-center">No open stock requests from other sellers right now.</p>
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
                  {req.status === "open" ? "Open" : "Bid Placed"}
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
              {req.status === "open" ? (
                <div className="flex gap-3 mt-auto">
                  <input
                    type="number"
                    placeholder="Your bid (৳)"
                    className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                    value={bidAmounts[req.id] || ""}
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
                <p className="text-center text-sm text-slate-600 bg-slate-100 p-3 rounded-lg">
                  Bid submitted — awaiting response.
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
