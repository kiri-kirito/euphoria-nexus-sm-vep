"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { resolveProductImage } from "@/utils/productImages";

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
  
  // Selected Item for Refund/Return ('all' or product_id)
  const [selectedItemForAction, setSelectedItemForAction] = useState<string>('all');
  
  // Confirmation Modal State
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    action: 'refund' | 'return' | 'resolve' | null;
    title: string;
    description: string;
    amount?: number;
  }>({
    isOpen: false,
    action: null,
    title: '',
    description: '',
  });

  const supabase = createClient();

  useEffect(() => {
    if (!ticketId) return;
    loadTicket(ticketId);
  }, [ticketId]);

  async function loadTicket(id: string) {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("complaints")
        .select(`
          *,
          users!buyer_id (name, email),
          orders (id, total_amount, status, payments (id, amount, status, transaction_id))
        `)
        .eq("id", id)
        .maybeSingle();

      if (error || !data) {
        console.error("Ticket query error:", error);
        setLoading(false);
        return;
      }

      setComplaint(data);
      setMessages(parseMessages(data.description, data.resolution));

      const { data: items } = await supabase
        .from("order_items")
        .select("quantity, unit_price, product_id, products (id, name, images, seller_id)")
        .eq("order_id", data.order_id);

      setOrderItems(items || []);
    } catch (err) {
      console.error("loadTicket catch:", err);
    } finally {
      setLoading(false);
    }
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

  const getCalculatedRefundAmount = (): number => {
    if (!complaint) return 0;
    if (selectedItemForAction === 'all') {
      return Number(complaint.orders?.total_amount || 0);
    }
    const item = orderItems.find(i => (i.product_id || i.products?.id) === selectedItemForAction);
    if (item) {
      return Number(item.unit_price || 0) * (item.quantity || 1);
    }
    return Number(complaint.orders?.total_amount || 0);
  };

  const openConfirm = (action: 'refund' | 'return' | 'resolve') => {
    if (action === 'refund') {
      const amount = getCalculatedRefundAmount();
      const isItem = selectedItemForAction !== 'all';
      const item = orderItems.find(i => (i.product_id || i.products?.id) === selectedItemForAction);
      setConfirmModal({
        isOpen: true,
        action: 'refund',
        title: 'Confirm Refund',
        description: isItem
          ? `Are you sure you want to refund ৳${amount.toLocaleString()} for "${item?.products?.name || 'Selected Item'}"?`
          : `Are you sure you want to refund the FULL order amount of ৳${amount.toLocaleString()}?`,
        amount,
      });
    } else if (action === 'return') {
      const item = orderItems.find(i => (i.product_id || i.products?.id) === selectedItemForAction);
      setConfirmModal({
        isOpen: true,
        action: 'return',
        title: 'Approve Return Request',
        description: selectedItemForAction !== 'all'
          ? `Approve product return pickup for "${item?.products?.name || 'Selected Item'}"?`
          : 'Approve return pickup for this order?',
      });
    } else if (action === 'resolve') {
      setConfirmModal({
        isOpen: true,
        action: 'resolve',
        title: 'Resolve Ticket',
        description: 'Are you sure you want to mark this support ticket as resolved?',
      });
    }
  };

  const handleExecuteConfirmedAction = async () => {
    if (!complaint || !confirmModal.action) return;

    if (confirmModal.action === 'refund') {
      const amount = confirmModal.amount || getCalculatedRefundAmount();
      const isPartial = amount < Number(complaint.orders?.total_amount || 0);
      const itemName = selectedItemForAction !== 'all'
        ? orderItems.find(i => (i.product_id || i.products?.id) === selectedItemForAction)?.products?.name
        : 'Order';

      const resolutionMsg: ChatMessage = {
        id: messages.length + 1,
        sender: 'Support',
        text: isPartial
          ? `Partial refund of ৳${amount.toLocaleString()} for "${itemName}" has been approved.`
          : `Full refund of ৳${amount.toLocaleString()} has been processed.`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      const updatedMessages = [...messages, resolutionMsg];

      await supabase
        .from('complaints')
        .update({
          status: 'resolved',
          complaint_type: 'refund',
          refund_amount: amount,
          resolution: JSON.stringify(updatedMessages.filter(m => m.sender === 'Support')),
        })
        .eq('id', complaint.id);

      if (complaint.order_id) {
        await supabase.from('orders').update({ status: isPartial ? 'partially_refunded' : 'refunded' }).eq('id', complaint.order_id);
        await supabase.from('payments').update({ status: 'refunded' }).eq('order_id', complaint.order_id);
      }

      setMessages(updatedMessages);
      setComplaint((prev: any) => ({ ...prev, status: 'resolved' }));
      setToast(`Refund of ৳${amount.toLocaleString()} approved!`);
    } else if (confirmModal.action === 'return') {
      const itemName = selectedItemForAction !== 'all'
        ? orderItems.find(i => (i.product_id || i.products?.id) === selectedItemForAction)?.products?.name
        : 'All items';

      const resolutionMsg: ChatMessage = {
        id: messages.length + 1,
        sender: 'Support',
        text: `Return request for "${itemName}" has been APPROVED. A delivery partner will be dispatched to pick up the item.`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      const updatedMessages = [...messages, resolutionMsg];

      await supabase
        .from('complaints')
        .update({
          status: 'in_progress',
          complaint_type: 'return',
          resolution: JSON.stringify(updatedMessages.filter(m => m.sender === 'Support')),
        })
        .eq('id', complaint.id);

      if (complaint.order_id) {
        await supabase.from('orders').update({ status: 'return_approved' }).eq('id', complaint.order_id);
      }

      setMessages(updatedMessages);
      setToast(`Return request approved! Order status updated.`);
    } else if (confirmModal.action === 'resolve') {
      await supabase.from("complaints").update({ status: "resolved" }).eq("id", complaint.id);
      setComplaint((prev: any) => ({ ...prev, status: 'resolved' }));
      setToast("Ticket marked as resolved.");
    }

    setConfirmModal({ isOpen: false, action: null, title: '', description: '' });
    setTimeout(() => setToast(null), 3500);
  };

  if (loading) return <div className="p-8 text-slate-400">Loading ticket...</div>;
  if (!complaint) return <div className="p-8 text-red-400">Ticket not found.</div>;

  const buyerName = complaint.users?.name || "Buyer";
  const rawPayment = complaint.orders?.payments?.[0];
  const paymentMethod = rawPayment?.transaction_id?.startsWith('COD') ? 'Cash on Delivery' : rawPayment?.transaction_id ? `bKash (${rawPayment.transaction_id})` : "Cash on Delivery";

  return (
    <div className="flex h-full bg-slate-900 text-slate-100 overflow-hidden relative">
      {/* Toast Notification */}
      {toast && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-emerald-600 text-white text-xs font-bold px-5 py-3 rounded-xl shadow-2xl z-50">
          {toast}
        </div>
      )}

      {/* Action Confirmation Modal */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-white">{confirmModal.title}</h3>
            <p className="text-sm text-slate-300 leading-relaxed">{confirmModal.description}</p>
            <div className="flex gap-3 justify-end pt-3 border-t border-slate-800">
              <button
                onClick={() => setConfirmModal({ isOpen: false, action: null, title: '', description: '' })}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition"
              >
                Cancel
              </button>
              <button
                onClick={handleExecuteConfirmedAction}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition shadow-md shadow-emerald-600/30"
              >
                Confirm Action
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Chat Thread */}
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
            {complaint.status?.toUpperCase()}
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
              placeholder="Type your response to customer..."
              className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-teal-500"
            />
            <button type="submit" className="bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs px-6 py-3 rounded-xl transition">
              Send Reply
            </button>
          </form>
        </div>
      </div>

      {/* Sidebar: Associated Order & Action Controls */}
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

          {/* Item Selector for Return / Refund */}
          <div className="mb-6">
            <label className="block text-xs font-bold text-slate-300 uppercase mb-2">Target Item for Action</label>
            <select
              value={selectedItemForAction}
              onChange={(e) => setSelectedItemForAction(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 outline-none focus:border-teal-500"
            >
              <option value="all">Full Order (All items — ৳{Number(complaint.orders?.total_amount || 0).toLocaleString()})</option>
              {orderItems.map((item, idx) => (
                <option key={idx} value={item.product_id || item.products?.id}>
                  {item.products?.name} (৳{Number(item.unit_price * (item.quantity || 1)).toLocaleString()})
                </option>
              ))}
            </select>
          </div>

          <h4 className="text-xs font-bold text-slate-400 uppercase mb-3">Order Items</h4>
          <div className="space-y-3">
            {orderItems.map((item, i) => (
              <div key={i} className="bg-slate-900 p-3 rounded-xl border border-slate-800 flex items-center gap-3">
                <img src={resolveProductImage(item.products)} alt="" className="w-10 h-10 object-cover rounded-lg" />
                <div>
                  <p className="text-xs font-bold text-white line-clamp-1">{item.products?.name}</p>
                  <p className="text-[10px] text-slate-400">৳{Number(item.unit_price || 0).toLocaleString()} × {item.quantity}</p>
                </div>
              </div>
            ))}
            {orderItems.length === 0 && <p className="text-xs text-slate-500">No items found for this order.</p>}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-6 border-t border-slate-800 space-y-2 mt-4">
          <button
            type="button"
            onClick={() => openConfirm('return')}
            className="w-full bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold py-2.5 rounded-xl transition shadow-md"
          >
            📦 Approve Return Pickup
          </button>
          <button
            type="button"
            onClick={() => openConfirm('refund')}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold py-2.5 rounded-xl transition shadow-md"
          >
            💰 Process Refund
          </button>
          <button
            type="button"
            onClick={() => openConfirm('resolve')}
            className="w-full bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-bold py-2.5 rounded-xl border border-slate-800 transition"
          >
            ✓ Mark Resolved
          </button>
        </div>
      </div>
    </div>
  );
}
