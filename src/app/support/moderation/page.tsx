"use client";

import React, { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";

export default function ModerationPage() {
  const [negotiations, setNegotiations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    fetchNegotiations();
  }, []);

  async function fetchNegotiations() {
    setLoading(true);
    const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString();

    const { data, error } = await supabase
      .from("negotiations")
      .select(`
        id, current_price, status, quantity, message, created_at, updated_at,
        buyer:users!negotiations_buyer_id_fkey (name),
        seller:users!negotiations_seller_id_fkey (name),
        products (name, price)
      `)
      .in("status", ["open", "countered", "deadlocked"])
      .order("updated_at", { ascending: false });

    if (error) {
      console.error(error);
      setLoading(false);
      return;
    }

    const flagged = (data || []).filter(
      (n) =>
        n.status === "deadlocked" ||
        (["open", "countered"].includes(n.status) && n.updated_at < twoDaysAgo)
    );
    setNegotiations(flagged.length ? flagged : data || []);
    setLoading(false);
  }

  const handleIntervene = async (id: string) => {
    const { error } = await supabase
      .from("negotiations")
      .update({ status: "agent_intervened", message: "Support agent joined the negotiation." })
      .eq("id", id);

    if (!error) {
      setNegotiations((prev) =>
        prev.map((n) => (n.id === id ? { ...n, status: "agent_intervened" } : n))
      );
    }
  };

  const displayStatus = (status: string, updatedAt: string) => {
    const stale = new Date(updatedAt) < new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
    if (status === "deadlocked") return "Deadlocked";
    if (status === "agent_intervened") return "Agent Intervened";
    if (stale) return "Flagged for Review";
    return status;
  };

  if (loading) return <div className="p-8 text-slate-400">Loading negotiations...</div>;

  return (
    <div className="p-8 max-w-6xl mx-auto text-slate-100">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Negotiation Moderation</h1>
        <p className="text-sm text-slate-400 mt-1">Intervene in deadlocked or stale bulk order negotiations.</p>
      </div>

      {negotiations.length === 0 ? (
        <p className="text-slate-500">No negotiations need moderation right now.</p>
      ) : (
        <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-900 border-b border-slate-800 text-slate-400">
              <tr>
                <th className="px-6 py-4 font-semibold">ID</th>
                <th className="px-6 py-4 font-semibold">Parties</th>
                <th className="px-6 py-4 font-semibold">Product</th>
                <th className="px-6 py-4 font-semibold">Last Offer</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {negotiations.map((n) => (
                <tr key={n.id} className="hover:bg-slate-900/50">
                  <td className="px-6 py-4 font-mono text-white">{n.id.substring(0, 8)}...</td>
                  <td className="px-6 py-4">
                    <div className="text-white font-medium">{n.buyer?.name} (Buyer)</div>
                    <div className="text-xs text-slate-400">{n.seller?.name} (Seller)</div>
                  </td>
                  <td className="px-6 py-4 text-slate-300">
                    {n.products?.name}
                    {n.quantity ? ` (×${n.quantity})` : ""}
                  </td>
                  <td className="px-6 py-4 font-bold text-teal-400">৳{Number(n.current_price).toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                      {displayStatus(n.status, n.updated_at)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {n.status !== "agent_intervened" && (
                      <button
                        onClick={() => handleIntervene(n.id)}
                        className="text-teal-400 font-semibold text-xs bg-teal-500/10 px-3 py-1.5 rounded-lg border border-teal-500/30"
                      >
                        Intervene
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
