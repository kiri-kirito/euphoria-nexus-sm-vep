"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { createClient } from "@/utils/supabase/client";
import { useAuthStore } from "@/store/useAuthStore";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { io } from "socket.io-client";
import { getBackendSocketUrl } from "@/utils/backendUrl";
import { buildSocketAuthOptions } from "@/utils/socketAuth";
import { openStockExchangeChat } from "@/utils/stockExchangeChat";

interface StockRequestView {
  id: string;
  product: string;
  productId?: string;
  quantity: number;
  targetPrice: number;
  status: string;
  fulfillmentType: string;
  requesterId: string;
  requesterLabel: string;
  createdAt: string;
  myBid?: {
    id: string;
    bidPrice: number;
    status: string;
    createdAt: string;
  };
}

interface MySubmittedBidView {
  id: string;
  requestId: string;
  productName: string;
  quantity: number;
  targetPrice: number;
  myBidPrice: number;
  status: string; // 'pending' | 'accepted' | 'rejected'
  requestStatus: string;
  fulfillmentType: string;
  requestingSellerId: string;
  createdAt: string;
}

interface MyRequestView {
  id: string;
  product: string;
  quantity: number;
  targetPrice: number;
  status: string;
  fulfillmentType: string;
  createdAt: string;
  bids: { id: string; bidderId: string; bidPrice: number; status: string; createdAt: string }[];
}

export default function BlindBiddingPage() {
  const [activeTab, setActiveTab] = useState<"open-board" | "my-bids" | "my-requests">("open-board");
  const [myBidsFilter, setMyBidsFilter] = useState<"all" | "accepted" | "pending" | "rejected">("all");

  const [requests, setRequests] = useState<StockRequestView[]>([]);
  const [mySubmittedBids, setMySubmittedBids] = useState<MySubmittedBidView[]>([]);
  const [myRequests, setMyRequests] = useState<MyRequestView[]>([]);
  const [myProducts, setMyProducts] = useState<{ id: string; name: string; price: number }[]>([]);

  const [bidAmounts, setBidAmounts] = useState<Record<string, string>>({});
  const [postProductId, setPostProductId] = useState("");
  const [postQty, setPostQty] = useState("10");
  const [postTarget, setPostTarget] = useState("");
  const [postFulfillment, setPostFulfillment] = useState<"bulk_transfer" | "dropship">("bulk_transfer");
  const [showPostModal, setShowPostModal] = useState(false);
  const [posting, setPosting] = useState(false);
  const [submittingBidId, setSubmittingBidId] = useState<string | null>(null);
  const [escrowStatusMap, setEscrowStatusMap] = useState<Map<string, { amount: number; status: string }>>(new Map());
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const supabase = createClient();
  const { user, profile } = useAuthStore();
  const { userId, loading: userLoading } = useCurrentUser();

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 4000);
  };

  const loadData = useCallback(async () => {
    try {
      let sellerId = user?.id || userId;
      if (!sellerId) {
        const { data: sellers } = await supabase.from("users").select("id").eq("role", "seller").limit(1);
        sellerId = sellers?.[0]?.id;
      }
      if (!sellerId) {
        setLoading(false);
        return;
      }

      // 1. Fetch my submitted bids to other sellers' requests
      const { data: myBidsData } = await supabase
        .from("stock_bids")
        .select(`
          id, request_id, bid_price, status, created_at,
          stock_requests!inner (
            id, quantity, target_price, status, fulfillment_type, requesting_seller_id,
            products (name)
          )
        `)
        .eq("bidding_seller_id", sellerId)
        .order("created_at", { ascending: false });

      const parsedMyBids: MySubmittedBidView[] = (myBidsData || []).map((b: any) => {
        const req = b.stock_requests;
        const prod = req?.products;
        return {
          id: b.id,
          requestId: b.request_id,
          productName: prod?.name || "Inventory Product",
          quantity: Number(req?.quantity || 1),
          targetPrice: Number(req?.target_price || 0),
          myBidPrice: Number(b.bid_price || 0),
          status: b.status || "pending",
          requestStatus: req?.status || "open",
          fulfillmentType: req?.fulfillment_type || "bulk_transfer",
          requestingSellerId: req?.requesting_seller_id,
          createdAt: b.created_at,
        };
      });
      setMySubmittedBids(parsedMyBids);

      const myBidsByRequestId = new Map<string, { id: string; bidPrice: number; status: string; createdAt: string }>();
      parsedMyBids.forEach((b) => {
        myBidsByRequestId.set(b.requestId, {
          id: b.id,
          bidPrice: b.myBidPrice,
          status: b.status,
          createdAt: b.createdAt,
        });
      });

      // 2. Fetch Open Stock Exchange Board (only open requests from other sellers)
      const { data: openRequestsData } = await supabase
        .from("stock_requests")
        .select(`
          id, quantity, target_price, status, product_id, requesting_seller_id, fulfillment_type, created_at,
          products (name)
        `)
        .eq("status", "open")
        .neq("requesting_seller_id", sellerId)
        .order("created_at", { ascending: false });

      const parsedOpenRequests: StockRequestView[] = (openRequestsData || []).map((r: any) => ({
        id: r.id,
        productId: r.product_id,
        product: r.products?.name || "Inventory Item",
        quantity: Number(r.quantity || 1),
        targetPrice: Number(r.target_price || 0),
        status: r.status,
        fulfillmentType: r.fulfillment_type || "bulk_transfer",
        requesterId: r.requesting_seller_id,
        requesterLabel: "Anonymous Vendor",
        createdAt: r.created_at,
        myBid: myBidsByRequestId.get(r.id),
      }));
      setRequests(parsedOpenRequests);

      // 3. Fetch My Store Products (for posting a new request)
      const { data: prods } = await supabase
        .from("products")
        .select("id, name, price")
        .eq("seller_id", sellerId)
        .order("name", { ascending: true });
      setMyProducts(prods || []);

      // 4. Fetch Requests Posted By Me
      const { data: myPostedReqs } = await supabase
        .from("stock_requests")
        .select(`
          id, quantity, target_price, status, fulfillment_type, created_at,
          products (name),
          stock_bids (id, bidding_seller_id, bid_price, status, created_at)
        `)
        .eq("requesting_seller_id", sellerId)
        .order("created_at", { ascending: false });

      const parsedMyRequests: MyRequestView[] = (myPostedReqs || []).map((r: any) => ({
        id: r.id,
        product: r.products?.name || "Inventory Item",
        quantity: Number(r.quantity || 1),
        targetPrice: Number(r.target_price || 0),
        status: r.status,
        fulfillmentType: r.fulfillment_type || "bulk_transfer",
        createdAt: r.created_at,
        bids: (r.stock_bids || []).map((b: any) => ({
          id: b.id,
          bidderId: b.bidding_seller_id,
          bidPrice: Number(b.bid_price || 0),
          status: b.status,
          createdAt: b.created_at,
        })),
      }));
      setMyRequests(parsedMyRequests);

      // 5. Fetch Escrow Records for requests & bids
      const { data: escrowList } = await supabase
        .from("escrow")
        .select("stock_request_id, amount, status");
      
      const eMap = new Map<string, { amount: number; status: string }>();
      (escrowList || []).forEach((e: any) => {
        if (e.stock_request_id) {
          eMap.set(e.stock_request_id, { amount: Number(e.amount), status: e.status });
        }
      });
      setEscrowStatusMap(eMap);
    } catch (err) {
      console.error("Error loading bidding board:", err);
    } finally {
      setLoading(false);
    }
  }, [user?.id, userId, supabase]);

  useEffect(() => {
    if (!userLoading) {
      loadData();
    }
  }, [userLoading, loadData]);

  // Submit a blind bid
  const handleBidSubmit = async (req: StockRequestView) => {
    let sellerId = user?.id || userId;
    if (!sellerId) {
      const { data: sellers } = await supabase.from("users").select("id").eq("role", "seller").limit(1);
      sellerId = sellers?.[0]?.id;
    }
    if (!sellerId) {
      showToast("Please log in as a seller to submit a bid.", "error");
      return;
    }

    const amountStr = bidAmounts[req.id];
    const amount = Number(amountStr);
    if (!amount || amount <= 0) {
      showToast("Please enter a valid bid price per unit.", "error");
      return;
    }

    setSubmittingBidId(req.id);

    try {
      // Check if bid already exists in DB
      const { data: existing } = await supabase
        .from("stock_bids")
        .select("id")
        .eq("request_id", req.id)
        .eq("bidding_seller_id", sellerId)
        .maybeSingle();

      if (existing) {
        showToast("You have already submitted a blind bid on this request.", "error");
        setSubmittingBidId(null);
        await loadData();
        return;
      }

      const { data: bidRow, error } = await supabase
        .from("stock_bids")
        .insert({
          request_id: req.id,
          bidding_seller_id: sellerId,
          bid_price: amount,
          status: "pending",
        })
        .select("id")
        .single();

      if (error) throw error;

      // Socket emission for real-time notification
      try {
        const socketOpts = await buildSocketAuthOptions();
        const socket = io(getBackendSocketUrl("/bidding"), socketOpts);
        socket.emit("submit_bid", {
          requestId: req.id,
          requesterId: req.requesterId,
          biddingSellerId: sellerId,
          amount,
        });
        setTimeout(() => socket.disconnect(), 500);
      } catch {
        /* DB is source of truth */
      }

      showToast(`Blind bid of ৳${amount.toLocaleString()}/unit placed securely!`);
      setBidAmounts((prev) => ({ ...prev, [req.id]: "" }));
      await loadData();
    } catch (err: any) {
      showToast(err?.message || "Could not submit bid.", "error");
    } finally {
      setSubmittingBidId(null);
    }
  };

  // Accept a bid on my posted request
  const handleAcceptBid = async (requestId: string, bid: { id: string; bidderId: string; bidPrice: number }) => {
    let sellerId = user?.id || userId;
    if (!sellerId) return;

    if (!confirm(`Accept anonymous bid of ৳${bid.bidPrice.toLocaleString()}/unit? This will initiate Escrow and open a coordination chat.`)) {
      return;
    }

    try {
      // 1. Mark accepted bid
      await supabase.from("stock_bids").update({ status: "accepted" }).eq("id", bid.id);

      // 2. Mark other bids for this request as rejected
      await supabase.from("stock_bids").update({ status: "rejected" }).eq("request_id", requestId).neq("id", bid.id);

      // 3. Mark the stock request as fulfilled/closed so it is removed from the board for all sellers
      await supabase.from("stock_requests").update({ status: "fulfilled" }).eq("id", requestId);

      const req = myRequests.find((r) => r.id === requestId);
      const totalAmount = bid.bidPrice * (req?.quantity || 1);

      // 4. Create escrow record
      await supabase.from("escrow").insert({
        stock_request_id: requestId,
        from_seller_id: bid.bidderId,
        to_seller_id: sellerId,
        amount: totalAmount,
        status: "held",
        description: `Stock exchange escrow for ${req?.product || 'Inventory'} (${req?.quantity || 1} units)`,
      });

      // 5. Open private Stock Exchange Chat between both sellers
      const { data: requestRow } = await supabase
        .from("stock_requests")
        .select("fulfillment_type")
        .eq("id", requestId)
        .maybeSingle();

      await openStockExchangeChat(supabase, {
        fromSellerId: sellerId,
        toSellerId: bid.bidderId,
        fromName: profile?.name || user?.email || "Partner Seller",
        requestId,
        fulfillmentType: (requestRow?.fulfillment_type as string) || "bulk_transfer",
      });

      showToast("Bid accepted! Escrow initiated and private chat opened.");
      await loadData();
    } catch (err: any) {
      showToast(err?.message || "Failed to accept bid.", "error");
    }
  };

  // Post a new stock request
  const handlePostRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    let sellerId = user?.id || userId;
    if (!sellerId) {
      const { data: sellers } = await supabase.from("users").select("id").eq("role", "seller").limit(1);
      sellerId = sellers?.[0]?.id;
    }
    if (!sellerId || !postProductId || !postTarget) return;

    setPosting(true);
    const quantity = parseInt(postQty, 10) || 1;
    const targetPrice = parseFloat(postTarget) || 0;

    try {
      const { error } = await supabase.from("stock_requests").insert({
        requesting_seller_id: sellerId,
        product_id: postProductId,
        quantity,
        target_price: targetPrice,
        status: "open",
        fulfillment_type: postFulfillment,
      });

      if (error) throw error;

      showToast("Stock request posted anonymously to the exchange board!");
      setPostProductId("");
      setPostTarget("");
      setPostQty("10");
      setShowPostModal(false);
      await loadData();
    } catch (err: any) {
      showToast(err?.message || "Failed to post stock request.", "error");
    } finally {
      setPosting(false);
    }
  };

  const filteredMyBids = useMemo(() => {
    if (myBidsFilter === "all") return mySubmittedBids;
    return mySubmittedBids.filter((b) => b.status === myBidsFilter);
  }, [mySubmittedBids, myBidsFilter]);

  if (loading || userLoading) {
    return <div className="p-8 text-center text-slate-500 font-medium animate-pulse">Loading Inter-Seller Stock Exchange...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-2xl shadow-2xl text-white font-bold text-sm flex items-center gap-2 animate-bounce ${
            toast.type === "error" ? "bg-red-600" : "bg-emerald-600"
          }`}
        >
          <span>{toast.type === "error" ? "⚠️" : "✅"}</span>
          <span>{toast.text}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Inter-Seller Stock Exchange</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Anonymous blind bidding network for sourcing and supplying inventory between verified sellers
          </p>
        </div>
        <button
          onClick={() => setShowPostModal(true)}
          className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-5 py-2.5 rounded-xl font-semibold text-sm shadow-md shadow-primary/30 transition-all hover:scale-105 self-start sm:self-auto"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Post Restock Request
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 gap-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab("open-board")}
          className={`pb-3 px-4 text-sm font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === "open-board"
              ? "border-primary text-primary"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <span>📋 Open Exchange Board</span>
          <span className="text-xs bg-slate-100 px-2 py-0.5 rounded-full text-slate-700 font-extrabold">
            {requests.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("my-bids")}
          className={`pb-3 px-4 text-sm font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === "my-bids"
              ? "border-primary text-primary"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <span>🏷️ My Submitted Bids</span>
          {mySubmittedBids.length > 0 && (
            <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-extrabold">
              {mySubmittedBids.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab("my-requests")}
          className={`pb-3 px-4 text-sm font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === "my-requests"
              ? "border-primary text-primary"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <span>📦 My Stock Requests</span>
          <span className="text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full font-extrabold">
            {myRequests.length}
          </span>
        </button>
      </div>

      {/* TAB 1: Open Exchange Board */}
      {activeTab === "open-board" && (
        <div className="space-y-6">
          <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 text-xs text-slate-600 flex items-start gap-3">
            <span className="text-lg">🔒</span>
            <div>
              <p className="font-bold text-slate-900">100% Anonymous Blind Bidding Protocol</p>
              <p className="mt-0.5 text-slate-600">
                Other sellers cannot see your bid. You can submit exactly one private offer per stock request. When the requester accepts an offer, the deal enters Escrow and opens a private transfer chat.
              </p>
            </div>
          </div>

          {requests.length === 0 ? (
            <div className="bg-white rounded-3xl p-16 text-center border border-slate-200 text-slate-500">
              <span className="text-4xl block mb-3">📦</span>
              <p className="font-bold text-base text-slate-800">No open stock requests from other sellers</p>
              <p className="text-xs mt-1">Check back later or post your own inventory request using the button above.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {requests.map((req) => {
                const hasMyBid = !!req.myBid;
                return (
                  <div
                    key={req.id}
                    className={`bg-white rounded-3xl border p-6 flex flex-col justify-between shadow-sm transition-all hover:shadow-md ${
                      hasMyBid ? "border-emerald-300 bg-emerald-50/20" : "border-slate-200"
                    }`}
                  >
                    <div>
                      <div className="flex justify-between items-start mb-3 gap-2">
                        <div>
                          <h3 className="font-bold text-slate-900 text-base line-clamp-1">{req.product}</h3>
                          <p className="text-xs text-slate-400 mt-0.5">Posted by: {req.requesterLabel}</p>
                        </div>
                        <span
                          className={`text-[11px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                            hasMyBid
                              ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                              : "bg-blue-50 text-blue-700 border border-blue-200"
                          }`}
                        >
                          {hasMyBid ? `Bid Placed (${req.myBid?.status})` : "Open For Bids"}
                        </span>
                      </div>

                      {/* Request Specs */}
                      <div className="grid grid-cols-3 gap-2 bg-slate-50 rounded-2xl p-3.5 mb-5 border border-slate-100 text-center">
                        <div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase">Needed</p>
                          <p className="text-sm font-extrabold text-slate-800 mt-0.5">{req.quantity} units</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase">Target / Unit</p>
                          <p className="text-sm font-extrabold text-primary mt-0.5">৳{req.targetPrice.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase">Fulfillment</p>
                          <p className="text-xs font-bold text-slate-700 mt-0.5 capitalize truncate">
                            {req.fulfillmentType.replace("_", " ")}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Bidding Section */}
                    {hasMyBid ? (
                      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-center">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-slate-500 font-semibold">Your Blind Offer:</span>
                          <span className="text-sm font-extrabold text-emerald-800">
                            ৳{req.myBid?.bidPrice.toLocaleString()}/unit
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-slate-500">
                          <span>Total Deal Value:</span>
                          <span className="font-bold text-slate-800">
                            ৳{((req.myBid?.bidPrice || 0) * req.quantity).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-[10px] text-emerald-700 font-bold mt-2 bg-white/70 py-1 rounded-lg">
                          Offer submitted securely · Awaiting requester decision
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3 pt-3 border-t border-slate-100">
                        <div className="flex gap-2">
                          {/* Quick Presets */}
                          <button
                            type="button"
                            onClick={() =>
                              setBidAmounts((prev) => ({ ...prev, [req.id]: String(req.targetPrice) }))
                            }
                            className="text-[10px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1 rounded-lg transition"
                          >
                            At Target (৳{req.targetPrice})
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setBidAmounts((prev) => ({
                                ...prev,
                                [req.id]: String(Math.round(req.targetPrice * 0.95)),
                              }))
                            }
                            className="text-[10px] font-bold bg-purple-50 hover:bg-purple-100 text-purple-700 px-2.5 py-1 rounded-lg transition"
                          >
                            -5% (৳{Math.round(req.targetPrice * 0.95)})
                          </button>
                        </div>

                        <div className="flex gap-2">
                          <div className="relative flex-1">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">৳</span>
                            <input
                              type="number"
                              placeholder="Your bid per unit..."
                              value={bidAmounts[req.id] || ""}
                              onChange={(e) =>
                                setBidAmounts((prev) => ({ ...prev, [req.id]: e.target.value }))
                              }
                              className="w-full pl-7 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white"
                            />
                          </div>
                          <button
                            type="button"
                            disabled={submittingBidId === req.id}
                            onClick={() => handleBidSubmit(req)}
                            className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition shadow-sm disabled:opacity-50 flex items-center gap-1 shrink-0"
                          >
                            {submittingBidId === req.id ? "Submitting..." : "Submit Bid"}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: My Submitted Bids (Status: Accepted / Pending / Rejected) */}
      {activeTab === "my-bids" && (
        <div className="space-y-5">
          {/* Subfilter tabs */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl">
              {(
                [
                  { id: "all", label: "All Bids" },
                  { id: "accepted", label: "Accepted 🟢" },
                  { id: "pending", label: "Pending 🟡" },
                  { id: "rejected", label: "Rejected 🔴" },
                ] as const
              ).map((f) => (
                <button
                  key={f.id}
                  onClick={() => setMyBidsFilter(f.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    myBidsFilter === f.id
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
            <span className="text-xs text-slate-400 font-semibold">{filteredMyBids.length} total</span>
          </div>

          {filteredMyBids.length === 0 ? (
            <div className="bg-white rounded-3xl p-16 text-center border border-slate-200 text-slate-500">
              <span className="text-4xl block mb-3">🏷️</span>
              <p className="font-bold text-base text-slate-800">No submitted bids found in this filter</p>
              <p className="text-xs mt-1">Switch to the Open Exchange Board to bid on inventory requests.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {filteredMyBids.map((b) => {
                const isAccepted = b.status === "accepted";
                const isRejected = b.status === "rejected";
                const isPending = b.status === "pending";

                return (
                  <div
                    key={b.id}
                    className={`bg-white rounded-3xl border p-6 flex flex-col justify-between shadow-sm transition-all ${
                      isAccepted
                        ? "border-emerald-300 ring-2 ring-emerald-400/20"
                        : isRejected
                        ? "border-red-200 opacity-80"
                        : "border-slate-200"
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between mb-3 gap-2">
                        <div>
                          <h3 className="font-bold text-slate-900 text-base">{b.productName}</h3>
                          <p className="text-xs text-slate-400 mt-0.5">
                            Placed on {new Date(b.createdAt).toLocaleDateString("en-GB", { timeZone: "Asia/Dhaka" })}
                          </p>
                        </div>
                        <span
                          className={`text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider ${
                            isAccepted
                              ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                              : isRejected
                              ? "bg-red-100 text-red-700 border border-red-200"
                              : "bg-amber-100 text-amber-800 border border-amber-200"
                          }`}
                        >
                          {isAccepted ? "Accepted 🟢" : isRejected ? "Rejected 🔴" : "Pending Decision 🟡"}
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-2 bg-slate-50 rounded-2xl p-3.5 mb-4 border border-slate-100 text-center text-xs">
                        <div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase">Requested Qty</p>
                          <p className="font-extrabold text-slate-800 mt-0.5">{b.quantity} units</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase">Target Price</p>
                          <p className="font-extrabold text-slate-600 mt-0.5">৳{b.targetPrice.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase">Your Bid</p>
                          <p className="font-extrabold text-emerald-700 mt-0.5">৳{b.myBidPrice.toLocaleString()}</p>
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                      <div>
                        <span className="text-slate-400 font-medium">Total Deal Value:</span>{" "}
                        <strong className="text-slate-900 font-extrabold">
                          ৳{(b.myBidPrice * b.quantity).toLocaleString()}
                        </strong>
                      </div>

                      {isAccepted && (
                        <span className={`font-bold text-[11px] px-3 py-1.5 rounded-xl border ${
                          escrowStatusMap.get(b.requestId)?.status === 'released'
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                            : 'bg-amber-50 text-amber-800 border-amber-200'
                        }`}>
                          {escrowStatusMap.get(b.requestId)?.status === 'released'
                            ? `💰 Escrow Released: ৳${(escrowStatusMap.get(b.requestId)?.amount || (b.myBidPrice * b.quantity)).toLocaleString()}`
                            : '🔒 Escrow Held (Pending Verification)'}
                        </span>
                      )}
                      {isRejected && (
                        <span className="text-red-500 font-semibold text-[11px]">Another bid was chosen</span>
                      )}
                      {isPending && (
                        <span className="text-slate-500 font-medium text-[11px]">Under Review</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: My Stock Requests (Received Bids) */}
      {activeTab === "my-requests" && (
        <div className="space-y-6">
          {myRequests.length === 0 ? (
            <div className="bg-white rounded-3xl p-16 text-center border border-slate-200 text-slate-500">
              <span className="text-4xl block mb-3">📦</span>
              <p className="font-bold text-base text-slate-800">You have not posted any restock requests yet</p>
              <p className="text-xs mt-1">Need inventory? Post a restock request to receive anonymous bids from other sellers.</p>
              <button
                onClick={() => setShowPostModal(true)}
                className="mt-4 bg-primary text-white text-xs font-bold px-4 py-2.5 rounded-xl hover:bg-primary-dark transition"
              >
                Post First Request
              </button>
            </div>
          ) : (
            <div className="space-y-5">
              {myRequests.map((req) => (
                <div key={req.id} className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-4 border-b border-slate-100">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-slate-900 text-lg">{req.product}</h3>
                        <span
                          className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase ${
                            req.status === "open"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-emerald-100 text-emerald-800"
                          }`}
                        >
                          {req.status === "open" ? "Active Request" : "Deal Closed / Fulfilled"}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        Needed: <strong>{req.quantity} units</strong> · Target: <strong>৳{req.targetPrice.toLocaleString()}/unit</strong> · Fulfillment: <span className="capitalize">{req.fulfillmentType.replace("_", " ")}</span>
                      </p>
                    </div>
                    <span className="text-xs text-slate-400">
                      Posted on {new Date(req.createdAt).toLocaleDateString("en-GB", { timeZone: "Asia/Dhaka" })}
                    </span>
                  </div>

                  {/* Received Bids */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Received Blind Bids ({req.bids.length})
                    </h4>

                    {req.bids.length === 0 ? (
                      <p className="text-xs text-slate-400 italic py-2">No vendor bids submitted yet.</p>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {req.bids.map((bid, i) => {
                          const isBidAccepted = bid.status === "accepted";
                          const isBidRejected = bid.status === "rejected";
                          return (
                            <div
                              key={bid.id}
                              className={`p-4 rounded-2xl border flex items-center justify-between gap-3 ${
                                isBidAccepted
                                  ? "bg-emerald-50/50 border-emerald-300"
                                  : isBidRejected
                                  ? "bg-slate-50 border-slate-200 opacity-60"
                                  : "bg-slate-50 border-slate-200"
                              }`}
                            >
                              <div>
                                <p className="text-xs font-bold text-slate-900">
                                  Anonymous Vendor #{i + 1}
                                </p>
                                <p className="text-sm font-extrabold text-emerald-700 mt-0.5">
                                  ৳{bid.bidPrice.toLocaleString()}/unit
                                </p>
                                <p className="text-[10px] text-slate-400">
                                  Total: ৳{(bid.bidPrice * req.quantity).toLocaleString()}
                                </p>
                              </div>

                              {req.status === "open" && bid.status === "pending" && (
                                <button
                                  type="button"
                                  onClick={() => handleAcceptBid(req.id, bid)}
                                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition shadow-sm"
                                >
                                  Accept Bid
                                </button>
                              )}
                              {isBidAccepted && (
                                <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full border ${
                                  escrowStatusMap.get(req.id)?.status === 'released'
                                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                    : 'bg-amber-100 text-amber-800 border-amber-200'
                                }`}>
                                  {escrowStatusMap.get(req.id)?.status === 'released' ? 'Funds Released 🟢' : 'Accepted (Escrow Held) 🔒'}
                                </span>
                              )}
                              {isBidRejected && (
                                <span className="text-slate-400 text-[10px] font-bold">
                                  Declined
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* POST RESTOCK REQUEST MODAL */}
      {showPostModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-200 animate-scale-in">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Post Restock Request</h2>
                <p className="text-xs text-slate-500 mt-0.5">Post an anonymous demand on the inter-seller exchange</p>
              </div>
              <button
                type="button"
                onClick={() => setShowPostModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handlePostRequest} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Product to Restock</label>
                <select
                  required
                  value={postProductId}
                  onChange={(e) => {
                    setPostProductId(e.target.value);
                    const prod = myProducts.find((p) => p.id === e.target.value);
                    if (prod) setPostTarget(String(Math.round(prod.price * 0.85)));
                  }}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-800 outline-none focus:border-primary"
                >
                  <option value="">Select a product from your catalog...</option>
                  {myProducts.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} (Selling @ ৳{p.price})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Units Needed</label>
                  <input
                    required
                    type="number"
                    min={1}
                    value={postQty}
                    onChange={(e) => setPostQty(e.target.value)}
                    placeholder="e.g. 25"
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-800 outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Target Price / Unit (৳)</label>
                  <input
                    required
                    type="number"
                    min={1}
                    value={postTarget}
                    onChange={(e) => setPostTarget(e.target.value)}
                    placeholder="e.g. 500"
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-800 outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Preferred Fulfillment</label>
                <select
                  value={postFulfillment}
                  onChange={(e) => setPostFulfillment(e.target.value as "bulk_transfer" | "dropship")}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-800 outline-none focus:border-primary"
                >
                  <option value="bulk_transfer">📦 Bulk Transfer via Delivery Agent to my Hub</option>
                  <option value="dropship">🚚 Dropship directly to my customer</option>
                </select>
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowPostModal(false)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs py-3 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={posting || myProducts.length === 0}
                  className="flex-1 bg-primary hover:bg-primary-dark text-white font-bold text-xs py-3 rounded-xl transition shadow-md disabled:opacity-50"
                >
                  {posting ? "Posting..." : "Post Anonymous Request"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
