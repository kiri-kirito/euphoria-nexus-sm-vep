"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { useAuthStore } from "@/store/useAuthStore";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { resolveProductImage } from "@/utils/productImages";
import { bundleDetailPath } from "@/utils/bundles";
import { createNotification } from "@/utils/localDelivery";

interface StoreProduct {
  id: string;
  name: string;
  price: number;
  seller_id: string;
  seller_name?: string;
  store_name?: string;
  category?: string;
  quantity?: number;
  image: string;
}

interface BundleItemRecord {
  id: string;
  bundle_name: string;
  total_price: number;
  revenue_split: any;
  created_at: string;
  bundle_items: {
    product_id: string;
    products: {
      id: string;
      name: string;
      price: number;
      seller_id: string;
      images?: any;
      users?: { name?: string };
    };
  }[];
}

export default function BundlingPage() {
  const [activeTab, setActiveTab] = useState<"create-proposal" | "incoming" | "outgoing" | "active-bundles">("create-proposal");

  // Selection states for creating proposal
  const [myProducts, setMyProducts] = useState<StoreProduct[]>([]);
  const [partnerCatalog, setPartnerCatalog] = useState<StoreProduct[]>([]);
  const [selectedMyProdId, setSelectedMyProdId] = useState("");
  const [selectedPartnerProdId, setSelectedPartnerProdId] = useState("");
  const [partnerSearch, setPartnerSearch] = useState("");
  const [partnerCategory, setPartnerCategory] = useState("All");

  const [bundleTitle, setBundleTitle] = useState("");
  const [discountPercent, setDiscountPercent] = useState<number>(10);
  const [proposalMessage, setProposalMessage] = useState("");

  // Counter state
  const [activeCounterBundleId, setActiveCounterBundleId] = useState<string | null>(null);
  const [counterDiscount, setCounterDiscount] = useState<number>(5);
  const [counterNote, setCounterNote] = useState("");

  // Data lists
  const [allBundles, setAllBundles] = useState<BundleItemRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
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

      // 1. Fetch my active products
      const { data: mine } = await supabase
        .from("products")
        .select("id, name, price, seller_id, category, quantity, images")
        .eq("seller_id", sellerId)
        .eq("status", "active")
        .order("name", { ascending: true });

      const parsedMine: StoreProduct[] = (mine || []).map((p) => ({
        id: p.id,
        name: p.name,
        price: Number(p.price || 0),
        seller_id: p.seller_id,
        category: p.category || "General",
        quantity: Number(p.quantity || 0),
        image: resolveProductImage(p),
      }));
      setMyProducts(parsedMine);

      // 2. Fetch other sellers' products with store info
      const [{ data: others }, { data: stores }] = await Promise.all([
        supabase
          .from("products")
          .select("id, name, price, seller_id, category, quantity, images, users!seller_id(name)")
          .neq("seller_id", sellerId)
          .eq("status", "active")
          .limit(100),
        supabase.from("stores").select("user_id, store_name, rating, total_sales"),
      ]);

      const storeMap = new Map((stores || []).map((s) => [s.user_id, s.store_name]));

      const parsedOthers: StoreProduct[] = (others || []).map((p: any) => ({
        id: p.id,
        name: p.name,
        price: Number(p.price || 0),
        seller_id: p.seller_id,
        seller_name: p.users?.name || "Partner Vendor",
        store_name: storeMap.get(p.seller_id) || p.users?.name || "Verified Store",
        category: p.category || "General",
        quantity: Number(p.quantity || 0),
        image: resolveProductImage(p),
      }));
      setPartnerCatalog(parsedOthers);

      // 3. Fetch all bundles
      const { data: bundlesData } = await supabase
        .from("product_bundles")
        .select(`
          id, bundle_name, total_price, revenue_split, created_at,
          bundle_items (
            product_id,
            products (id, name, price, seller_id, images, users!seller_id(name))
          )
        `)
        .order("created_at", { ascending: false });

      setAllBundles((bundlesData as any[]) || []);
    } catch (err) {
      console.error("Bundles load error:", err);
    } finally {
      setLoading(false);
    }
  }, [user?.id, userId, supabase]);

  useEffect(() => {
    if (!userLoading) {
      loadData();
    }
  }, [userLoading, loadData]);

  // Selected Product Objects
  const mySelectedProd = useMemo(
    () => myProducts.find((p) => p.id === selectedMyProdId),
    [myProducts, selectedMyProdId]
  );
  const partnerSelectedProd = useMemo(
    () => partnerCatalog.find((p) => p.id === selectedPartnerProdId),
    [partnerCatalog, selectedPartnerProdId]
  );

  // Auto-generate title when both products are selected
  useEffect(() => {
    if (mySelectedProd && partnerSelectedProd && !bundleTitle) {
      const w1 = mySelectedProd.name.split(" ")[0];
      const w2 = partnerSelectedProd.name.split(" ")[0];
      setBundleTitle(`${w1} + ${w2} Combo Pack`);
    }
  }, [mySelectedProd, partnerSelectedProd, bundleTitle]);

  // Pricing math
  const originalCombined = (mySelectedProd?.price || 0) + (partnerSelectedProd?.price || 0);
  const discountMultiplier = Math.max(0.5, (100 - discountPercent) / 100);
  const comboPrice = Math.round(originalCombined * discountMultiplier);
  const totalSavings = originalCombined - comboPrice;
  const myDiscountedPayout = Math.round((mySelectedProd?.price || 0) * discountMultiplier);
  const partnerDiscountedPayout = Math.round((partnerSelectedProd?.price || 0) * discountMultiplier);

  // Filtered partner catalog
  const filteredPartnerCatalog = useMemo(() => {
    return partnerCatalog.filter((p) => {
      if (partnerCategory !== "All" && p.category !== partnerCategory) return false;
      if (partnerSearch) {
        const q = partnerSearch.toLowerCase();
        const matchName = p.name.toLowerCase().includes(q);
        const matchStore = (p.store_name || "").toLowerCase().includes(q);
        const matchSeller = (p.seller_name || "").toLowerCase().includes(q);
        if (!matchName && !matchStore && !matchSeller) return false;
      }
      return true;
    });
  }, [partnerCatalog, partnerCategory, partnerSearch]);

  const partnerCategories = ["All", ...Array.from(new Set(partnerCatalog.map((p) => p.category).filter(Boolean)))];

  // SUBMIT PROPOSAL
  const handleSendProposal = async (e: React.FormEvent) => {
    e.preventDefault();
    let sellerId = user?.id || userId;
    if (!sellerId) return;

    if (!mySelectedProd || !partnerSelectedProd) {
      showToast("Please select both your product and the partner seller's product.", "error");
      return;
    }

    if (!bundleTitle.trim()) {
      showToast("Please enter a bundle name.", "error");
      return;
    }

    setSubmitting(true);
    try {
      const myStoreName = profile?.store_name || profile?.name || user?.email || "Partner Store";

      const revenue_split = {
        _status: "pending_partner",
        _proposer_id: sellerId,
        _partner_id: partnerSelectedProd.seller_id,
        _proposer_store_name: myStoreName,
        _partner_store_name: partnerSelectedProd.store_name || partnerSelectedProd.seller_name,
        _discount_percent: discountPercent,
        _original_price: originalCombined,
        _message: proposalMessage || undefined,
        _last_action_by: sellerId,
        // Individual splits
        [mySelectedProd.seller_id]: originalCombined > 0 ? (mySelectedProd.price / originalCombined) : 0.5,
        [partnerSelectedProd.seller_id]: originalCombined > 0 ? (partnerSelectedProd.price / originalCombined) : 0.5,
      };

      const { data: bundleRow, error } = await supabase
        .from("product_bundles")
        .insert({
          bundle_name: bundleTitle.trim(),
          total_price: comboPrice,
          revenue_split,
        })
        .select("id")
        .single();

      if (error || !bundleRow) throw error || new Error("Failed to insert bundle");

      await supabase.from("bundle_items").insert([
        { bundle_id: bundleRow.id, product_id: mySelectedProd.id },
        { bundle_id: bundleRow.id, product_id: partnerSelectedProd.id },
      ]);

      // Notify partner seller
      await createNotification(
        supabase,
        partnerSelectedProd.seller_id,
        "New Cross-Seller Bundle Proposal",
        `${myStoreName} invited you to create a combo bundle: "${bundleTitle.trim()}" (${discountPercent}% OFF)`,
        "/seller/bundling"
      );

      showToast(`Bundle proposal sent to ${partnerSelectedProd.store_name}!`);
      setBundleTitle("");
      setSelectedMyProdId("");
      setSelectedPartnerProdId("");
      setProposalMessage("");
      setActiveTab("outgoing");
      await loadData();
    } catch (err: any) {
      showToast(err?.message || "Failed to send proposal.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  // ACCEPT INCOMING OR COUNTERED PROPOSAL
  const handleAcceptProposal = async (bundle: BundleItemRecord) => {
    let sellerId = user?.id || userId;
    if (!sellerId) return;

    if (!confirm(`Accept and publish "${bundle.bundle_name}" to the live marketplace?`)) return;

    try {
      const existingSplit = bundle.revenue_split || {};
      const updatedSplit = {
        ...existingSplit,
        _status: "active",
        _last_action_by: sellerId,
      };

      await supabase
        .from("product_bundles")
        .update({
          revenue_split: updatedSplit,
        })
        .eq("id", bundle.id);

      // Notify proposer
      const otherSellerId = existingSplit._proposer_id === sellerId ? existingSplit._partner_id : existingSplit._proposer_id;
      if (otherSellerId) {
        await createNotification(
          supabase,
          otherSellerId,
          "Bundle Proposal Accepted!",
          `"${bundle.bundle_name}" is now mutually approved and live on the store catalog!`,
          "/seller/bundling"
        );
      }

      showToast(`"${bundle.bundle_name}" is now live on the marketplace! 🎉`);
      await loadData();
    } catch (err: any) {
      showToast(err?.message || "Failed to accept proposal.", "error");
    }
  };

  // COUNTER PROPOSAL
  const handleSendCounter = async (bundle: BundleItemRecord) => {
    let sellerId = user?.id || userId;
    if (!sellerId) return;

    try {
      const existingSplit = bundle.revenue_split || {};
      const origPrice = Number(existingSplit._original_price || bundle.total_price);
      const newComboPrice = Math.round(origPrice * ((100 - counterDiscount) / 100));

      const updatedSplit = {
        ...existingSplit,
        _status: "countered",
        _counter_discount_percent: counterDiscount,
        _counter_note: counterNote || undefined,
        _last_action_by: sellerId,
      };

      await supabase
        .from("product_bundles")
        .update({
          total_price: newComboPrice,
          revenue_split: updatedSplit,
        })
        .eq("id", bundle.id);

      const targetSellerId = existingSplit._proposer_id === sellerId ? existingSplit._partner_id : existingSplit._proposer_id;
      if (targetSellerId) {
        await createNotification(
          supabase,
          targetSellerId,
          "Counter-Offer on Bundle Proposal",
          `Partner proposed ${counterDiscount}% discount on "${bundle.bundle_name}"`,
          "/seller/bundling"
        );
      }

      showToast(`Counter-offer of ${counterDiscount}% discount sent!`);
      setActiveCounterBundleId(null);
      setCounterNote("");
      await loadData();
    } catch (err: any) {
      showToast(err?.message || "Failed to send counter.", "error");
    }
  };

  // REJECT / DECLINE PROPOSAL
  const handleDeclineProposal = async (bundle: BundleItemRecord) => {
    let sellerId = user?.id || userId;
    if (!sellerId) return;

    if (!confirm("Decline this bundle proposal?")) return;

    try {
      const existingSplit = bundle.revenue_split || {};
      const updatedSplit = {
        ...existingSplit,
        _status: "rejected",
        _last_action_by: sellerId,
      };

      await supabase
        .from("product_bundles")
        .update({ revenue_split: updatedSplit })
        .eq("id", bundle.id);

      showToast("Bundle proposal declined.");
      await loadData();
    } catch (err: any) {
      showToast(err?.message || "Failed to decline proposal.", "error");
    }
  };

  // Categorize bundles
  const mySellerId = user?.id || userId;

  const incomingProposals = useMemo(() => {
    return allBundles.filter((b) => {
      const split = b.revenue_split;
      const status = split?._status;
      if (!status || status === "active" || status === "rejected") return false;
      // It's incoming for me if I am the partner and last action was by proposer, OR if I am proposer and partner countered
      if (split._partner_id === mySellerId && (status === "pending_partner" || (status === "countered" && split._last_action_by !== mySellerId))) {
        return true;
      }
      if (split._proposer_id === mySellerId && status === "countered" && split._last_action_by !== mySellerId) {
        return true;
      }
      return false;
    });
  }, [allBundles, mySellerId]);

  const outgoingProposals = useMemo(() => {
    return allBundles.filter((b) => {
      const split = b.revenue_split;
      const status = split?._status;
      if (!status || status === "active") return false;
      // Outgoing if I initiated it or if I sent the latest counter
      if (split._proposer_id === mySellerId || split._partner_id === mySellerId) {
        return true;
      }
      return false;
    });
  }, [allBundles, mySellerId]);

  const activeStoreBundles = useMemo(() => {
    return allBundles.filter((b) => {
      const split = b.revenue_split;
      const status = split?._status;
      if (status && status !== "active") return false;
      // Participant check
      const items = b.bundle_items || [];
      return items.some((bi) => bi.products?.seller_id === mySellerId) || split?.[mySellerId || ""] != null;
    });
  }, [allBundles, mySellerId]);

  if (loading || userLoading) {
    return <div className="p-8 text-center text-slate-500 font-medium animate-pulse">Loading Cross-Seller Bundling...</div>;
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
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Cross-Seller Bundling</h1>
        <p className="text-slate-500 text-sm mt-0.5">
          Collaborate with other sellers to co-list combo deals — buyers pay a single unified delivery fee and both sellers boost sales
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab("create-proposal")}
          className={`pb-3 px-4 text-sm font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === "create-proposal"
              ? "border-primary text-primary"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <span>➕ Propose New Bundle</span>
        </button>

        <button
          onClick={() => setActiveTab("incoming")}
          className={`pb-3 px-4 text-sm font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === "incoming"
              ? "border-primary text-primary"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <span>📥 Incoming Proposals</span>
          {incomingProposals.length > 0 && (
            <span className="text-xs bg-primary text-white px-2 py-0.5 rounded-full font-extrabold animate-pulse">
              {incomingProposals.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab("outgoing")}
          className={`pb-3 px-4 text-sm font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === "outgoing"
              ? "border-primary text-primary"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <span>📤 Outgoing Proposals</span>
          <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full font-extrabold">
            {outgoingProposals.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("active-bundles")}
          className={`pb-3 px-4 text-sm font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === "active-bundles"
              ? "border-primary text-primary"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <span>🌟 Active Store Bundles</span>
          <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-extrabold">
            {activeStoreBundles.length}
          </span>
        </button>
      </div>

      {/* TAB 1: CREATE PROPOSAL */}
      {activeTab === "create-proposal" && (
        <form onSubmit={handleSendProposal} className="space-y-6">
          <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 text-xs text-slate-600 flex items-start gap-3">
            <span className="text-lg">🤝</span>
            <div>
              <p className="font-bold text-slate-900">How Cross-Seller Collaboration Works</p>
              <p className="mt-0.5 text-slate-600">
                1. Pick your item & select another seller's complementary product. <br />
                2. Set the combo discount %. We send a formal proposal to the partner seller. <br />
                3. Once both sellers agree (or counter-offer), the bundle automatically goes live on the marketplace!
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Step 1: Select My Product */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center font-bold">1</span>
                    Select Your Product
                  </h2>
                  <span className="text-xs text-slate-400 font-semibold">{myProducts.length} in stock</span>
                </div>

                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {myProducts.map((p) => {
                    const isSelected = p.id === selectedMyProdId;
                    return (
                      <div
                        key={p.id}
                        onClick={() => setSelectedMyProdId(p.id)}
                        className={`p-3 rounded-2xl border flex items-center gap-3 cursor-pointer transition-all ${
                          isSelected
                            ? "border-primary bg-primary/5 shadow-sm ring-2 ring-primary/20"
                            : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                        }`}
                      >
                        <img src={p.image} alt={p.name} className="w-12 h-12 rounded-xl object-cover bg-slate-100 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-slate-900 truncate">{p.name}</p>
                          <p className="text-[11px] text-slate-500">{p.category} · Stock: {p.quantity}</p>
                        </div>
                        <span className="text-xs font-extrabold text-primary shrink-0">৳{p.price.toLocaleString()}</span>
                      </div>
                    );
                  })}
                  {myProducts.length === 0 && (
                    <p className="text-xs text-slate-400 text-center py-8">No products found in your store.</p>
                  )}
                </div>
              </div>

              {mySelectedProd && (
                <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-semibold">Selected Item:</span>
                  <span className="font-extrabold text-slate-900 truncate max-w-xs">{mySelectedProd.name} (৳{mySelectedProd.price})</span>
                </div>
              )}
            </div>

            {/* Step 2: Select Partner Product & Specific Seller */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs flex items-center justify-center font-bold">2</span>
                    Select Partner Product & Seller
                  </h2>
                </div>

                {/* Filters */}
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    placeholder="Search partner products or stores..."
                    value={partnerSearch}
                    onChange={(e) => setPartnerSearch(e.target.value)}
                    className="flex-1 border border-slate-200 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-300"
                  />
                  <select
                    value={partnerCategory}
                    onChange={(e) => setPartnerCategory(e.target.value)}
                    className="border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-700 bg-white"
                  >
                    {partnerCategories.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {filteredPartnerCatalog.map((p) => {
                    const isSelected = p.id === selectedPartnerProdId;
                    return (
                      <div
                        key={p.id}
                        onClick={() => setSelectedPartnerProdId(p.id)}
                        className={`p-3 rounded-2xl border flex items-center gap-3 cursor-pointer transition-all ${
                          isSelected
                            ? "border-indigo-600 bg-indigo-50/40 shadow-sm ring-2 ring-indigo-400/20"
                            : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                        }`}
                      >
                        <img src={p.image} alt={p.name} className="w-12 h-12 rounded-xl object-cover bg-slate-100 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-slate-900 truncate">{p.name}</p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md truncate max-w-[140px]">
                              🏪 {p.store_name}
                            </span>
                            <span className="text-[10px] text-slate-400">· {p.category}</span>
                          </div>
                        </div>
                        <span className="text-xs font-extrabold text-slate-900 shrink-0">৳{p.price.toLocaleString()}</span>
                      </div>
                    );
                  })}
                  {filteredPartnerCatalog.length === 0 && (
                    <p className="text-xs text-slate-400 text-center py-8">No partner products match your search.</p>
                  )}
                </div>
              </div>

              {partnerSelectedProd && (
                <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-semibold">Partner Store:</span>
                  <span className="font-extrabold text-indigo-700 truncate max-w-xs">🏪 {partnerSelectedProd.store_name} ({partnerSelectedProd.name})</span>
                </div>
              )}
            </div>
          </div>

          {/* Step 3: Bundle Terms, Discount & Live Calculations */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-5">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-emerald-600 text-white text-xs flex items-center justify-center font-bold">3</span>
              Configure Bundle Terms & Combo Discount
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Bundle Combo Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. WFH Starter Pack (Keyboard + Mouse)"
                  value={bundleTitle}
                  onChange={(e) => setBundleTitle(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-800 outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Proposed Combo Discount (%)</label>
                <div className="flex gap-2">
                  {[5, 10, 15, 20].map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setDiscountPercent(d)}
                      className={`flex-1 py-2 rounded-xl text-xs font-extrabold transition-all ${
                        discountPercent === d
                          ? "bg-emerald-600 text-white shadow-sm"
                          : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                      }`}
                    >
                      {d}% OFF
                    </button>
                  ))}
                  <input
                    type="number"
                    min={1}
                    max={50}
                    value={discountPercent}
                    onChange={(e) => setDiscountPercent(Math.max(1, Math.min(50, Number(e.target.value) || 1)))}
                    className="w-16 border border-slate-200 rounded-xl text-center text-xs font-bold"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Proposal Note for Partner Seller (Optional)</label>
              <input
                type="text"
                placeholder="e.g. Hello! Our items complement each other perfectly. Let's offer a 10% combo discount to boost sales!"
                value={proposalMessage}
                onChange={(e) => setProposalMessage(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-800 outline-none focus:border-primary"
              />
            </div>

            {/* Live Pricing Breakdown Card */}
            {mySelectedProd && partnerSelectedProd && (
              <div className="bg-emerald-50/50 border border-emerald-200 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-emerald-200/60 pb-3">
                  <div>
                    <h3 className="font-bold text-emerald-950 text-sm">{bundleTitle || "Combo Bundle Deal"}</h3>
                    <p className="text-[11px] text-emerald-700 mt-0.5">
                      {mySelectedProd.name} + {partnerSelectedProd.name}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-400 line-through">৳{originalCombined.toLocaleString()}</span>
                    <p className="text-xl font-black text-emerald-900">৳{comboPrice.toLocaleString()}</p>
                    <span className="text-[10px] font-bold text-emerald-700">Buyer Saves ৳{totalSavings.toLocaleString()} ({discountPercent}% OFF)</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div className="bg-white/80 rounded-xl p-3 border border-emerald-100">
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Your Product Share</p>
                    <p className="font-bold text-slate-900 mt-0.5">{mySelectedProd.name}</p>
                    <div className="flex items-baseline justify-between mt-1">
                      <span className="text-slate-400 text-[11px]">Original: ৳{mySelectedProd.price.toLocaleString()}</span>
                      <span className="font-extrabold text-primary text-xs">You Payout: ৳{myDiscountedPayout.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="bg-white/80 rounded-xl p-3 border border-emerald-100">
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Partner Share (🏪 {partnerSelectedProd.store_name})</p>
                    <p className="font-bold text-slate-900 mt-0.5">{partnerSelectedProd.name}</p>
                    <div className="flex items-baseline justify-between mt-1">
                      <span className="text-slate-400 text-[11px]">Original: ৳{partnerSelectedProd.price.toLocaleString()}</span>
                      <span className="font-extrabold text-indigo-700 text-xs">Partner Payout: ৳{partnerDiscountedPayout.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting || !mySelectedProd || !partnerSelectedProd}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm py-3.5 rounded-2xl transition shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {submitting ? "Sending Collaboration Proposal..." : `🚀 Send Bundle Proposal to ${partnerSelectedProd ? partnerSelectedProd.store_name : "Partner Seller"}`}
            </button>
          </div>
        </form>
      )}

      {/* TAB 2: INCOMING PROPOSALS */}
      {activeTab === "incoming" && (
        <div className="space-y-5">
          {incomingProposals.length === 0 ? (
            <div className="bg-white rounded-3xl p-16 text-center border border-slate-200 text-slate-500">
              <span className="text-4xl block mb-3">📥</span>
              <p className="font-bold text-base text-slate-800">No pending incoming proposals</p>
              <p className="text-xs mt-1">When another seller proposes a cross-bundle with your items, you will see it here.</p>
            </div>
          ) : (
            <div className="space-y-5">
              {incomingProposals.map((bundle) => {
                const split = bundle.revenue_split || {};
                const isCounter = split._status === "countered";
                const isProposerMe = split._proposer_id === mySellerId;
                const otherStore = isProposerMe ? (split._partner_store_name || "Partner Store") : (split._proposer_store_name || "Proposer Store");
                const currentDiscount = isCounter ? (split._counter_discount_percent || split._discount_percent || 10) : (split._discount_percent || 10);
                const isCounterFormOpen = activeCounterBundleId === bundle.id;

                const items = bundle.bundle_items || [];
                const item1 = items[0]?.products;
                const item2 = items[1]?.products;

                return (
                  <div key={bundle.id} className="bg-white rounded-3xl border border-primary/30 p-6 shadow-sm space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-slate-900 text-lg">{bundle.bundle_name}</h3>
                          <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary">
                            {isCounter ? `Counter-Offer: ${currentDiscount}% OFF` : `Proposal: ${currentDiscount}% OFF`}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                          From: <strong>🏪 {otherStore}</strong> · Created on {new Date(bundle.created_at).toLocaleDateString("en-GB", { timeZone: "Asia/Dhaka" })}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-slate-400">Combo Price for Buyer</p>
                        <p className="text-xl font-black text-emerald-800">৳{bundle.total_price.toLocaleString()}</p>
                      </div>
                    </div>

                    {/* Paired Items Preview */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      {item1 && (
                        <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-3">
                          <img src={resolveProductImage(item1)} alt={item1.name} className="w-10 h-10 rounded-xl object-cover" />
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-slate-900 truncate">{item1.name}</p>
                            <p className="text-[11px] text-slate-400">Original: ৳{Number(item1.price).toLocaleString()}</p>
                          </div>
                        </div>
                      )}
                      {item2 && (
                        <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-3">
                          <img src={resolveProductImage(item2)} alt={item2.name} className="w-10 h-10 rounded-xl object-cover" />
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-slate-900 truncate">{item2.name}</p>
                            <p className="text-[11px] text-slate-400">Original: ৳{Number(item2.price).toLocaleString()}</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Proposal or Counter Note */}
                    {(split._message || split._counter_note) && (
                      <div className="bg-slate-50 p-3 rounded-2xl text-xs text-slate-600 italic border border-slate-100">
                        "{split._counter_note || split._message}"
                      </div>
                    )}

                    {/* Counter Form */}
                    {isCounterFormOpen ? (
                      <div className="bg-indigo-50/60 p-4 rounded-2xl border border-indigo-200 space-y-3">
                        <p className="text-xs font-bold text-indigo-950">Counter with your preferred discount:</p>
                        <div className="flex gap-2">
                          {[3, 5, 8, 10].map((d) => (
                            <button
                              key={d}
                              type="button"
                              onClick={() => setCounterDiscount(d)}
                              className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition ${
                                counterDiscount === d ? "bg-indigo-600 text-white" : "bg-white text-slate-700 border"
                              }`}
                            >
                              {d}% OFF
                            </button>
                          ))}
                          <input
                            type="number"
                            min={1}
                            max={50}
                            value={counterDiscount}
                            onChange={(e) => setCounterDiscount(Number(e.target.value) || 1)}
                            className="w-16 bg-white border border-slate-300 rounded-xl text-center text-xs font-bold"
                          />
                        </div>
                        <input
                          type="text"
                          placeholder="Add counter explanation (optional)..."
                          value={counterNote}
                          onChange={(e) => setCounterNote(e.target.value)}
                          className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs"
                        />
                        <div className="flex gap-2 justify-end">
                          <button
                            type="button"
                            onClick={() => setActiveCounterBundleId(null)}
                            className="px-4 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-200 rounded-xl"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSendCounter(bundle)}
                            className="px-4 py-1.5 text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700 rounded-xl shadow-sm"
                          >
                            Submit Counter-Offer
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100 justify-end">
                        <button
                          type="button"
                          onClick={() => handleDeclineProposal(bundle)}
                          className="px-4 py-2 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 transition border border-red-200"
                        >
                          Decline
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setActiveCounterBundleId(bundle.id);
                            setCounterDiscount(Math.max(1, currentDiscount - 5));
                          }}
                          className="px-4 py-2 rounded-xl text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 transition border border-indigo-200"
                        >
                          💬 Propose Counter-Offer
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAcceptProposal(bundle)}
                          className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition shadow-sm"
                        >
                          ✅ Accept & Publish Bundle
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: OUTGOING PROPOSALS */}
      {activeTab === "outgoing" && (
        <div className="space-y-5">
          {outgoingProposals.length === 0 ? (
            <div className="bg-white rounded-3xl p-16 text-center border border-slate-200 text-slate-500">
              <span className="text-4xl block mb-3">📤</span>
              <p className="font-bold text-base text-slate-800">No outgoing bundle proposals</p>
              <p className="text-xs mt-1">Use the Propose New Bundle tab to invite another seller to collaborate.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {outgoingProposals.map((bundle) => {
                const split = bundle.revenue_split || {};
                const status = split._status || "pending_partner";
                const isCountered = status === "countered";
                const isRejected = status === "rejected";
                const isPending = status === "pending_partner";

                const isCounterFromPartner = isCountered && split._last_action_by !== mySellerId;
                const partnerStore = split._proposer_id === mySellerId ? split._partner_store_name : split._proposer_store_name;

                return (
                  <div key={bundle.id} className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-slate-900 text-base">{bundle.bundle_name}</h3>
                          <span
                            className={`text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider ${
                              isCountered
                                ? "bg-purple-100 text-purple-800 border border-purple-200"
                                : isRejected
                                ? "bg-red-100 text-red-700 border border-red-200"
                                : "bg-amber-100 text-amber-800 border border-amber-200"
                            }`}
                          >
                            {isCountered ? "Counter-Offer Received 🟣" : isRejected ? "Declined 🔴" : "Pending Partner Review 🟡"}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                          Partner: <strong>🏪 {partnerStore || "Vendor Store"}</strong> · Combo Price: <strong>৳{bundle.total_price.toLocaleString()}</strong> ({split._discount_percent || 10}% OFF)
                        </p>
                      </div>
                      <span className="text-xs text-slate-400">
                        {new Date(bundle.created_at).toLocaleDateString("en-GB", { timeZone: "Asia/Dhaka" })}
                      </span>
                    </div>

                    {isCounterFromPartner && (
                      <div className="bg-purple-50 p-4 rounded-2xl border border-purple-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                          <p className="text-xs font-bold text-purple-900">
                            Partner countered with {split._counter_discount_percent}% discount!
                          </p>
                          {split._counter_note && (
                            <p className="text-xs text-purple-700 italic mt-0.5">"{split._counter_note}"</p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => handleAcceptProposal(bundle)}
                            className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition shadow-sm"
                          >
                            Accept Counter & Publish
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

      {/* TAB 4: ACTIVE STORE BUNDLES */}
      {activeTab === "active-bundles" && (
        <div className="space-y-5">
          {activeStoreBundles.length === 0 ? (
            <div className="bg-white rounded-3xl p-16 text-center border border-slate-200 text-slate-500">
              <span className="text-4xl block mb-3">🌟</span>
              <p className="font-bold text-base text-slate-800">No active cross-seller bundles yet</p>
              <p className="text-xs mt-1">Propose or accept a bundle proposal to see your live store combos here.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {activeStoreBundles.map((bundle) => {
                const items = (bundle.bundle_items || []).map((bi) => bi.products).filter(Boolean);
                const p1 = items[0];
                const p2 = items[1];
                const pIds = [p1?.id || "", p2?.id || ""] as [string, string];

                return (
                  <div key={bundle.id} className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div>
                          <h3 className="font-bold text-slate-900 text-base">{bundle.bundle_name}</h3>
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            Live on Storefront 🟢
                          </span>
                        </div>
                        <p className="text-xl font-black text-slate-900">৳{bundle.total_price.toLocaleString()}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-2 my-4">
                        {p1 && (
                          <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-2">
                            <img src={resolveProductImage(p1)} alt={p1.name} className="w-10 h-10 rounded-lg object-cover" />
                            <p className="text-xs font-semibold text-slate-800 truncate">{p1.name}</p>
                          </div>
                        )}
                        {p2 && (
                          <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-2">
                            <img src={resolveProductImage(p2)} alt={p2.name} className="w-10 h-10 rounded-lg object-cover" />
                            <p className="text-xs font-semibold text-slate-800 truncate">{p2.name}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-xs text-slate-400">Single Delivery Fee for Buyer</span>
                      <Link
                        href={bundleDetailPath(pIds)}
                        className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
                      >
                        View Combo in Store →
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
