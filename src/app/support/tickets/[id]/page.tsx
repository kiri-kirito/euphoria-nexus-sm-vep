'use client';

import React, { useState } from 'react';

export default function TicketDetails() {
  const [messages, setMessages] = useState([
    { id: 1, sender: 'User', text: 'Assalamu Alaikum, I received my order #ORD-84392 today, but the Mechanical Keyboard Keycaps set is missing from the package!', time: '10:14 AM' },
    { id: 2, sender: 'Support', text: 'Walaikum Assalam Nusrat. I am very sorry for the inconvenience. Let me inspect the seller dispatch video for order #ORD-84392.', time: '10:16 AM' },
    { id: 3, sender: 'User', text: 'Thank you! The box was sealed, but only the headphones were inside.', time: '10:20 AM' },
  ]);

  const [inputMsg, setInputMsg] = useState('');
  const [toast, setToast] = useState<string | null>(null);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMsg.trim()) return;

    const newMsg = {
      id: messages.length + 1,
      sender: 'Support',
      text: inputMsg,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, newMsg]);
    setInputMsg('');
  };

  const handleProcessRefund = () => {
    setToast('Refund of ৳2,500 approved & queued for bKash disbursement!');
    setTimeout(() => setToast(null), 3500);
  };

  return (
    <div className="flex h-full bg-slate-900 text-slate-100 overflow-hidden relative">
      {toast && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-emerald-600 text-white text-xs font-bold px-5 py-3 rounded-xl shadow-2xl z-50 animate-bounce">
          {toast}
        </div>
      )}

      {/* Main Chat Pane */}
      <div className="flex-1 flex flex-col border-r border-slate-800">
        {/* Chat Header */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-teal-500/20 text-teal-400 border border-teal-500/30 rounded-xl flex items-center justify-center font-bold text-xs">
              TCK
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Ticket #TCK-101 — Missing Item Claim</h2>
              <p className="text-xs text-slate-400">Customer: <span className="text-slate-200 font-semibold">Nusrat Jahan</span> (Dhaka)</p>
            </div>
          </div>
          <span className="bg-emerald-500/20 text-emerald-400 text-xs font-bold px-3 py-1 rounded-full border border-emerald-500/30">
            Active Ticket
          </span>
        </div>

        {/* Message Thread */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-slate-900">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex flex-col ${msg.sender === 'Support' ? 'items-end' : 'items-start'}`}>
              <div className={`max-w-[75%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed shadow-md ${
                msg.sender === 'Support' 
                  ? 'bg-teal-600 text-white rounded-tr-none' 
                  : 'bg-slate-950 text-slate-200 border border-slate-800 rounded-tl-none'
              }`}>
                <p>{msg.text}</p>
              </div>
              <span className="text-[10px] text-slate-500 mt-1 font-semibold">
                {msg.sender === 'Support' ? 'Sabrina (Agent)' : 'Nusrat Jahan'} • {msg.time}
              </span>
            </div>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-4 bg-slate-950 border-t border-slate-800">
          <form onSubmit={handleSendMessage} className="flex gap-3">
            <input 
              type="text"
              value={inputMsg}
              onChange={(e) => setInputMsg(e.target.value)}
              placeholder="Type your response to the customer..." 
              className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-teal-500 placeholder:text-slate-500"
            />
            <button 
              type="submit"
              className="bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs px-6 py-3 rounded-xl transition shadow-lg shadow-teal-600/30"
            >
              Send Reply
            </button>
          </form>
        </div>
      </div>

      {/* Right Sidebar - Order Details */}
      <div className="w-80 bg-slate-950 p-6 overflow-y-auto border-l border-slate-800 flex-shrink-0 flex flex-col justify-between">
        <div>
          <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
            <svg className="w-4 h-4 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 11h14l1 12H4L5 11z" />
            </svg>
            Associated Order
          </h3>

          <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 text-xs space-y-2 mb-6">
            <div className="flex justify-between">
              <span className="text-slate-400">Order ID:</span>
              <span className="font-bold text-white">#ORD-84392</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Total Amount:</span>
              <span className="font-bold text-emerald-400">৳34,500</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Payment:</span>
              <span className="font-bold text-purple-400">bKash Paid</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Seller:</span>
              <span className="font-semibold text-slate-200">AudioWorld BD</span>
            </div>
          </div>

          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Order Items</h4>
          <div className="space-y-3">
            <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 flex items-center gap-3">
              <img 
                src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100&h=100&fit=crop&q=80" 
                alt="Sony WH-1000XM5" 
                className="w-10 h-10 object-cover rounded-lg"
              />
              <div>
                <p className="text-xs font-bold text-white line-clamp-1">Sony WH-1000XM5</p>
                <p className="text-[10px] text-slate-400">৳32,000 • Delivered ✓</p>
              </div>
            </div>

            <div className="bg-slate-900 p-3 rounded-xl border border-red-500/30 flex items-center gap-3 bg-red-500/5">
              <img 
                src="https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=100&h=100&fit=crop&q=80" 
                alt="Keycaps" 
                className="w-10 h-10 object-cover rounded-lg"
              />
              <div>
                <p className="text-xs font-bold text-white line-clamp-1">Mechanical Keycaps</p>
                <p className="text-[10px] text-red-400 font-semibold">৳2,500 • Missing Item ⚠️</p>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-800 space-y-2">
          <button 
            onClick={handleProcessRefund}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold py-2.5 rounded-xl transition shadow-lg shadow-emerald-600/30"
          >
            Process Partial Refund (৳2,500)
          </button>
          <button 
            className="w-full bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-bold py-2.5 rounded-xl border border-slate-800 transition"
          >
            Escalate to Manager
          </button>
        </div>
      </div>
    </div>
  );
}
