"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { resolveProductImage } from "@/utils/productImages";
import { loadOrderRefundAmount } from "@/utils/bundlePayouts";

interface ChatMessage {
  id: number;
  sender: "User" | "Support";
  text: string;
  time: string;
}

function parseMessages(description: string, resolution: string | null): ChatMessage[] {
  const initial: ChatMessage[] = [
    {
      id: 1,
      sender: "User",
      text: description,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
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
        sender: "Support",
        text: resolution,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      });
    }
  }
  return initial;
}

export default function TicketDetails() {
  const params = useParams();
  const ticketId = params?.id as string;
  const [complaint, setComplaint] = useState<any>(null);
  const [orderItems, setOrderItems] = useState<any[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMsg, setInputMsg] = useState("");
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    if (!ticketId) return;
    loadTicket(ticketId);
  }, [ticketId]);

  async function loadTicket(id: string) {
    setLoading(true);
    const { data, error } = await supabase
      .from("complaints")
      .select(`
        *,
        users!buyer_id (name, email),
        orders (id, total_amount, status, payments (method, status))
      `)
      .eq("id", id)
      .maybeSingle();

    if (error || !data) {
      setLoading(false);
      return;
    }

    setComplaint(data);
    setMessages(parseMessages(data.description, data.resolution));

    const { data: items } = await supabase
      .from("order_items")
      .select("quantity, unit_price, products (id, name, images, seller_id)")
      .eq("order_id", data.order_id);

    setOrderItems(items || []);
    setLoading(false);
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMsg.trim() || !complaint) return;

    const newMsg: ChatMessage = {
      id: messages.length + 1,
      sender: "Support",
      text: inputMsg,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    const updated = [...messages, newMsg];
    setMessages(updated);
    setInputMsg("");

    const supportMsgs = updated.filter((m) => m.sender === "Support");
    await supabase
      .from("complaints")
      .update({ resolution: JSON.stringify(supportMsgs), status: "in_progress" })
      .eq("id", complaint.id);
  };

  const handleProcessRefund = async () => {
    if (!complaint) return;
    const amount = await loadOrderRefundAmount(
      supabase,
      complaint.order_id,
      complaint.complaint_type || 'refund',
      complaint.description || ''
    );
    const isPartial = amount < Number(complaint.orders?.total_amount || 0);
    const resolutionMsg = {
      id: 999,
      sender: 'Support',
      text: isPartial
        ? `Partial bundle refund of ৳${amount.toLocaleString()} approved (bundle discount voided for returned item).`
        : `Refund of ৳${amount.toLocaleString()} approved.`,
      time: new Date().toLocaleTimeString(),
    };
    const updatedResolution = JSON.stringify([...messages, resolutionMsg]);

    await supabase
      .from('complaints')
      .update({
        status: 'resolved',
        complaint_type: 'refund',
        refund_amount: amount,
        resolution: updatedResolution,
      })
      .eq('id', complaint.id);

    if (complaint.order_id) {
      await supabase.from('orders').update({ status: isPartial ? 'partially_refunded' : 'refunded' }).eq('id', complaint.order_id);
      await supabase.from('payments').update({ status: 'refunded' }).eq('order_id', complaint.order_id);
      if (isPartial) {
        await supabase
          .from('seller_payouts')
          .update({ status: 'adjusted' })
          .eq('order_id', complaint.order_id);
      }
    }

    setMessages((prev) => [...prev, resolutionMsg as ChatMessage]);
    setComplaint((prev: any) => ({ ...prev, status: 'resolved' }));
    setToast(`Refund of ৳${amount.toLocaleString()} approved & queued!`);
    setTimeout(() => setToast(null), 3500);
  };

  const handleResolve = async () => {
    if (!complaint) return;
    await supabase.from("complaints").update({ status: "resolved" }).eq("id", complaint.id);
    setToast("Ticket marked as resolved.");
    setTimeout(() => setToast(null), 3000);
  };

  if (loading) return <div className="p-8 text-slate-400">Loading ticket...</div>;
  if (!complaint) return <div className="p-8 text-red-400">Ticket not found.</div>;

  const buyerName = complaint.users?.name || "Buyer";
  const paymentMethod = complaint.orders?.payments?.[0]?.method || "N/A";

  return (
    <div className="flex h-full bg-slate-900 text-slate-100 overflow-hidden relative">
      {toast && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-emerald-600 text-white text-xs font-bold px-5 py-3 rounded-xl shadow-2xl z-50">
          {toast}
        </div>
      )}

      <div className="flex-1 flex flex-col border-r border-slate-800">
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex justify-between items-center">
          <div>
            <h2 className="text-base font-bold text-white">Ticket #{complaint.id.substring(0, 8)}</h2>
            <p className="text-xs text-slate-400">
              Customer: <span className="text-slate-200 font-semibold">{buyerName}</span> ({complaint.users?.email})
            </p>
          </div>
          <span className={`text-xs font-bold px-3 py-1 rounded-full border ${
            complaint.status === "resolved"
              ? "bg-slate-500/20 text-slate-400 border-slate-500/30"
              : "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
          }`}>
            {complaint.status}
          </span>
        </div>

        <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-slate-900">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex flex-col ${msg.sender === "Support" ? "items-end" : "items-start"}`}>
              <div className={`max-w-[75%] rounded-2xl p-4 text-sm ${
                msg.sender === "Support" ? "bg-teal-600 text-white rounded-tr-none" : "bg-slate-950 text-slate-200 border border-slate-800 rounded-tl-none"
              }`}>
                {msg.text}
              </div>
              <span className="text-[10px] text-slate-500 mt-1">
                {msg.sender === "Support" ? "Support Agent" : buyerName} • {msg.time}
              </span>
            </div>
          ))}
        </div>

        <div className="p-4 bg-slate-950 border-t border-slate-800">
          <form onSubmit={handleSendMessage} className="flex gap-3">
            <input
              value={inputMsg}
              onChange={(e) => setInputMsg(e.target.value)}
              placeholder="Type your response..."
              className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-teal-500"
            />
            <button type="submit" className="bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs px-6 py-3 rounded-xl">
              Send Reply
            </button>
          </form>
        </div>
      </div>

      <div className="w-80 bg-slate-950 p-6 overflow-y-auto border-l border-slate-800 flex-shrink-0 flex flex-col justify-between">
        <div>
          <h3 className="text-sm font-bold text-white uppercase mb-4">Associated Order</h3>
          <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 text-xs space-y-2 mb-6">
            <div className="flex justify-between">
              <span className="text-slate-400">Order ID:</span>
              <span className="font-bold text-white">#{complaint.order_id?.substring(0, 8)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Total:</span>
              <span className="font-bold text-emerald-400">৳{Number(complaint.orders?.total_amount || 0).toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Payment:</span>
              <span className="font-bold text-purple-400">{paymentMethod}</span>
            </div>
          </div>

          <h4 className="text-xs font-bold text-slate-400 uppercase mb-3">Order Items</h4>
          <div className="space-y-3">
            {orderItems.map((item, i) => (
              <div key={i} className="bg-slate-900 p-3 rounded-xl border border-slate-800 flex items-center gap-3">
                <img src={resolveProductImage(item.products)} alt="" className="w-10 h-10 object-cover rounded-lg" />
                <div>
                  <p className="text-xs font-bold text-white line-clamp-1">{item.products?.name}</p>
                  <p className="text-[10px] text-slate-400">৳{Number(item.price).toLocaleString()} × {item.quantity}</p>
                </div>
              </div>
            ))}
            {orderItems.length === 0 && <p className="text-xs text-slate-500">No items found for this order.</p>}
          </div>
        </div>

        <div className="pt-6 border-t border-slate-800 space-y-2">
          <button onClick={handleProcessRefund} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold py-2.5 rounded-xl">
            Process Refund
          </button>
          <button onClick={handleResolve} className="w-full bg-slate-900 text-slate-300 text-xs font-bold py-2.5 rounded-xl border border-slate-800">
            Mark Resolved
          </button>
        </div>
      </div>
    </div>
  );
}
