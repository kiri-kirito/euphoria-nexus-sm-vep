"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { useAuthStore } from "@/store/useAuthStore";
import { resolveProductImage } from "@/utils/productImages";
import { bundleDetailPath } from "@/utils/bundles";

interface ProductOption {
  id: string;
  name: string;
  price: number;
  seller_id: string;
  image: string;
}

export default function BundlingPage() {
  const [activeTab, setActiveTab] = useState<"explore" | "my-bundles">("explore");
  const [allBundles, setAllBundles] = useState<any[]>([]);
  const [myProducts, setMyProducts] = useState<ProductOption[]>([]);
  const [otherProducts, setOtherProducts] = useState<ProductOption[]>([]);
  const [selectedMine, setSelectedMine] = useState("");
  const [selectedPartner, setSelectedPartner] = useState("");
  const [bundleName, setBundleName] = useState("");
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const supabase = createClient();
  const { user } = useAuthStore();

  useEffect(() => {
    if (!user?.id) return;
    loadData(user.id);
  }, [user?.id]);

  async function loadData(sellerId: string) {
    setLoading(true);

    const [{ data: bundles }, { data: mine }, { data: others }] = await Promise.all([
      supabase
        .from("product_bundles")
        .select(`
          id, bundle_name, total_price, revenue_split,
          bundle_items (product_id, products (id, name, price, seller_id, images))
        `)
        .order("created_at", { ascending: false }),
      supabase.from("products").select("id, name, price, seller_id, images").eq("seller_id", sellerId).eq("status", "active"),
      supabase.from("products").select("id, name, price, seller_id, images").neq("seller_id", sellerId).eq("status", "active").limit(30),
    ]);

    setAllBundles(bundles || []);
    setMyProducts(
      (mine || []).map((p) => ({
        id: p.id,
        name: p.name,
        price: Number(p.price),
        seller_id: p.seller_id,
        image: resolveProductImage(p),
      }))
    );
    setOtherProducts(
      (others || []).map((p) => ({
        id: p.id,
        name: p.name,
        price: Number(p.price),
        seller_id: p.seller_id,
        image: resolveProductImage(p),
      }))
    );
    setLoading(false);
  }

  const myBundleIds = allBundles.filter((b) => {
    const items = b.bundle_items || [];
    return items.some((bi: any) => bi.products?.seller_id === user?.id);
  });

  const exploreBundles = allBundles.filter((b) => {
    const items = b.bundle_items || [];
    const sellerIds = new Set(items.map((bi: any) => bi.products?.seller_id).filter(Boolean));
    return sellerIds.size > 1 && !sellerIds.has(user?.id);
  });

  const handleCreateBundle = async () => {
    if (!user?.id || !selectedMine || !selectedPartner || !bundleName.trim()) return;
    setCreating(true);

    const p1 = myProducts.find((p) => p.id === selectedMine);
    const p2 = otherProducts.find((p) => p.id === selectedPartner);
    if (!p1 || !p2) {
      setCreating(false);
      return;
    }

    const originalTotal = p1.price + p2.price;
    const bundlePrice = Math.round(originalTotal * 0.85);
    const revenue_split = {
      [p1.seller_id]: p1.price / originalTotal,
      [p2.seller_id]: p2.price / originalTotal,
    };

    const { data: bundleRow, error } = await supabase
      .from("product_bundles")
      .insert({ bundle_name: bundleName, total_price: bundlePrice, revenue_split })
      .select("id")
      .single();

    if (error || !bundleRow) {
      alert("Failed to create bundle: " + error?.message);
      setCreating(false);
      return;
    }

    await supabase.from("bundle_items").insert([
      { bundle_id: bundleRow.id, product_id: p1.id },
      { bundle_id: bundleRow.id, product_id: p2.id },
    ]);

    setBundleName("");
    setSelectedMine("");
    setSelectedPartner("");
    await loadData(user.id);
    setActiveTab("my-bundles");
    setCreating(false);
  };

  if (loading) return <div className="p-8 text-slate-500 animate-pulse">Loading bundles...</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Cross-Seller Bundling</h1>
        <p className="text-slate-500 text-sm mt-1">Create bundles with other sellers — buyers get one delivery fee.</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
        <h2 className="font-bold text-slate-900">Create New Bundle</h2>
        <input
          type="text"
          placeholder="Bundle name (e.g. WFH Starter Pack)"
          value={bundleName}
          onChange={(e) => setBundleName(e.target.value)}
          className="w-full border rounded-xl px-4 py-2 text-sm"
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <select value={selectedMine} onChange={(e) => setSelectedMine(e.target.value)} className="border rounded-xl px-4 py-2 text-sm">
            <option value="">Your product...</option>
            {myProducts.map((p) => (
              <option key={p.id} value={p.id}>{p.name} — ৳{p.price.toLocaleString()}</option>
            ))}
          </select>
          <select value={selectedPartner} onChange={(e) => setSelectedPartner(e.target.value)} className="border rounded-xl px-4 py-2 text-sm">
            <option value="">Partner product (another seller)...</option>
            {otherProducts.map((p) => (
              <option key={p.id} value={p.id}>{p.name} — ৳{p.price.toLocaleString()}</option>
            ))}
          </select>
        </div>
        <button
          onClick={handleCreateBundle}
          disabled={creating}
          className="bg-primary text-white px-6 py-2.5 rounded-xl font-semibold text-sm disabled:opacity-50"
        >
          {creating ? "Creating..." : "Create Bundle Proposal"}
        </button>
      </div>

      <div className="flex gap-4 border-b border-slate-200">
        {(["explore", "my-bundles"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3 text-sm font-semibold border-b-2 ${activeTab === tab ? "border-primary text-primary" : "border-transparent text-slate-500"}`}
          >
            {tab === "explore" ? "Other Sellers' Bundles" : `My Bundles (${myBundleIds.length})`}
          </button>
        ))}
      </div>

      {activeTab === "explore" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {exploreBundles.length === 0 ? (
            <p className="text-slate-500 col-span-full">No cross-seller bundles from others yet.</p>
          ) : (
            exploreBundles.map((b) => {
              const items = (b.bundle_items || []).map((bi: any) => bi.products).filter(Boolean);
              const ids = items.map((p: any) => p.id) as [string, string];
              return (
                <div key={b.id} className="bg-white rounded-2xl border p-5">
                  <h3 className="font-bold">{b.bundle_name}</h3>
                  <ul className="text-xs text-slate-600 mt-2 space-y-1">
                    {items.map((p: any) => (
                      <li key={p.id}>✓ {p.name}</li>
                    ))}
                  </ul>
                  <p className="text-lg font-black mt-3">৳{Number(b.total_price).toLocaleString()}</p>
                  {ids.length >= 2 && (
                    <Link href={bundleDetailPath(ids)} className="text-primary text-xs font-bold mt-2 inline-block">
                      Preview as buyer →
                    </Link>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {activeTab === "my-bundles" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {myBundleIds.length === 0 ? (
            <p className="text-slate-500">You have no active bundles. Create one above!</p>
          ) : (
            myBundleIds.map((b) => {
              const items = (b.bundle_items || []).map((bi: any) => bi.products).filter(Boolean);
              const ids = items.map((p: any) => p.id) as [string, string];
              return (
                <div key={b.id} className="bg-white rounded-2xl border p-5">
                  <h3 className="font-bold">{b.bundle_name}</h3>
                  <p className="text-sm text-slate-500 mt-1">{items.length} products · ৳{Number(b.total_price).toLocaleString()}</p>
                  {ids.length >= 2 && (
                    <Link href={bundleDetailPath(ids)} className="text-primary text-xs font-bold mt-3 inline-block">
                      View live bundle page →
                    </Link>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
