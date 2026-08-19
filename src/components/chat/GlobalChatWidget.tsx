'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { createClient } from '@/utils/supabase/client';

interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  receiverId: string;
  text: string;
  timestamp: string;
}

interface ChatContact {
  id: string;
  label: string;
}

function playChime() {
  try {
    const AC = window.AudioContext || (window as any).webkitAudioContext;
    if (!AC) return;
    const ctx = new AC();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(660, ctx.currentTime);
    osc.frequency.setValueAtTime(880, ctx.currentTime + 0.12);
    gain.gain.setValueAtTime(0.18, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.4);
  } catch { /* ignore */ }
}

export default function GlobalChatWidget() {
  const { user, profile } = useAuthStore();
  const supabase = createClient();

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [contacts, setContacts] = useState<ChatContact[]>([]);
  const [receiverId, setReceiverId] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationToast, setNotificationToast] = useState<{ senderId: string; sender: string; text: string } | null>(null);
  const [isSending, setIsSending] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  // Use refs to avoid stale closures in async callbacks
  const isOpenRef = useRef(false);
  const receiverIdRef = useRef('');

  useEffect(() => { isOpenRef.current = isOpen; }, [isOpen]);
  useEffect(() => { receiverIdRef.current = receiverId; }, [receiverId]);

  // ── Load contacts prioritized by most recent chat ──
  const loadContacts = useCallback(async () => {
    if (!user?.id) return;
    const list: ChatContact[] = [];
    const seen = new Set<string>();

    const add = (id: string, label: string) => {
      if (!id || id === user.id || seen.has(id)) return;
      seen.add(id);
      list.push({ id, label });
    };

    // Recent chat partners first (most recent at top)
    const { data: recentChats } = await supabase
      .from('chat_messages')
      .select('sender_id, receiver_id, sender_name')
      .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
      .order('created_at', { ascending: false })
      .limit(40);

    const partnerIds: string[] = [];
    (recentChats || []).forEach((m) => {
      const pid = m.sender_id === user.id ? m.receiver_id : m.sender_id;
      if (pid && pid !== user.id && !partnerIds.includes(pid)) partnerIds.push(pid);
    });

    if (partnerIds.length > 0) {
      const [{ data: pUsers }, { data: pStores }] = await Promise.all([
        supabase.from('users').select('id, name, role').in('id', partnerIds),
        supabase.from('stores').select('user_id, store_name').in('user_id', partnerIds),
      ]);
      const uMap = new Map((pUsers || []).map((u) => [u.id, u]));
      const sMap = new Map((pStores || []).map((s) => [s.user_id, s.store_name]));
      partnerIds.forEach((pid) => {
        const u = uMap.get(pid);
        const storeName = sMap.get(pid);
        const role = u?.role === 'support' ? 'Support' : u?.role === 'seller' ? 'Seller' : 'Buyer';
        add(pid, `${role}: ${storeName || u?.name || 'Partner'}`);
      });
    }

    // Support team fallback
    const { data: supportUsers } = await supabase.from('users').select('id, name').eq('role', 'support').limit(3);
    (supportUsers || []).forEach((s) => add(s.id, `Support: ${s.name}`));

    // Role-based contacts
    const role = profile?.role || 'buyer';
    if (role === 'buyer') {
      const { data: negs } = await supabase
        .from('negotiations')
        .select('seller_id, seller:users!negotiations_seller_id_fkey(name)')
        .eq('buyer_id', user.id).limit(8);
      (negs || []).forEach((n) => {
        const seller = n.seller as { name?: string } | null;
        add(n.seller_id as string, `Seller: ${seller?.name || 'Partner'}`);
      });
    }
    if (role === 'seller') {
      const { data: negs } = await supabase
        .from('negotiations').select('buyer_id, users!buyer_id(name)')
        .eq('seller_id', user.id).limit(8);
      (negs || []).forEach((n) => {
        const buyer = n.users as { name?: string } | null;
        add(n.buyer_id as string, `Buyer: ${buyer?.name || 'Customer'}`);
      });
    }
    if (role === 'support' || role === 'admin') {
      const { data: buyers } = await supabase
        .from('complaints').select('buyer_id, users!buyer_id(name)')
        .order('created_at', { ascending: false }).limit(10);
      (buyers || []).forEach((c) => {
        const b = c.users as { name?: string } | null;
        add(c.buyer_id as string, `Buyer: ${b?.name || 'Customer'}`);
      });
    }

    if (list.length === 0) list.push({ id: 'system_support', label: 'Support Team' });

    setContacts(list);
    setReceiverId((prev) => (prev && list.some((c) => c.id === prev) ? prev : list[0]?.id || ''));
  }, [user?.id, profile?.role, supabase]);

  useEffect(() => { loadContacts(); }, [loadContacts]);

  // ── Load message history when receiver changes ──
  useEffect(() => {
    if (!user?.id || !receiverId) return;
    supabase
      .from('chat_messages')
      .select('id, sender_id, sender_name, receiver_id, text, created_at')
      .or(`and(sender_id.eq.${user.id},receiver_id.eq.${receiverId}),and(sender_id.eq.${receiverId},receiver_id.eq.${user.id})`)
      .order('created_at', { ascending: true })
      .limit(60)
      .then(({ data }) => {
        if (!data) return;
        setMessages(data.map((row) => ({
          id: row.id,
          senderId: row.sender_id,
          senderName: row.sender_name || 'User',
          receiverId: row.receiver_id,
          text: row.text,
          timestamp: row.created_at,
        })));
      });
  }, [user?.id, receiverId, supabase]);

  // ── Supabase Broadcast: subscribe to a personal channel for incoming messages ──
  // This does NOT require Realtime publication or RLS on the table.
  // When sender sends, they broadcast to recipient's personal channel via supabase.
  useEffect(() => {
    if (!user?.id) return;

    // Subscribe to my personal broadcast channel
    const myChannel = supabase
      .channel(`chat_inbox_${user.id}`)
      .on('broadcast', { event: 'new_message' }, (payload) => {
        const msg = payload.payload as ChatMessage;
        if (!msg || msg.receiverId !== user.id) return;

        const currentReceiverId = receiverIdRef.current;
        const currentIsOpen = isOpenRef.current;

        // Bump sender to top of contacts
        setContacts((prev) => {
          const existing = prev.find((c) => c.id === msg.senderId);
          const rest = prev.filter((c) => c.id !== msg.senderId);
          const entry = existing || { id: msg.senderId, label: `Partner: ${msg.senderName}` };
          return [entry, ...rest];
        });

        // Add to messages if it's the active conversation
        if (currentReceiverId === msg.senderId) {
          setMessages((prev) => {
            const isDup = prev.some(
              (m) => m.id === msg.id ||
                (m.senderId === msg.senderId && m.text === msg.text && m.receiverId === msg.receiverId)
            );
            return isDup ? prev : [...prev, msg];
          });
        }

        // Show notification if chat is closed or on different contact
        if (!currentIsOpen || currentReceiverId !== msg.senderId) {
          setUnreadCount((c) => c + 1);
          playChime();
          setNotificationToast({ senderId: msg.senderId, sender: msg.senderName, text: msg.text });
          setTimeout(() => setNotificationToast(null), 8000);
        }
      })
      .subscribe((status) => {
        console.log('[Chat] Broadcast channel status:', status);
      });

    return () => {
      supabase.removeChannel(myChannel);
    };
  }, [user?.id, supabase]);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  // ── Send message ──
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user || !receiverId || isSending) return;

    setIsSending(true);
    const text = newMessage.trim();
    const senderName = profile?.name || user.user_metadata?.full_name || user.email?.split('@')[0] || 'User';
    const tempId = `temp_${Date.now()}`;

    const optimistic: ChatMessage = {
      id: tempId,
      senderId: user.id,
      senderName,
      receiverId,
      text,
      timestamp: new Date().toISOString(),
    };

    // Show immediately in sender's UI
    setMessages((prev) => [...prev, optimistic]);
    setNewMessage('');

    try {
      // 1. Persist to database
      const { data: dbRow } = await supabase
        .from('chat_messages')
        .insert({ sender_id: user.id, receiver_id: receiverId, sender_name: senderName, text })
        .select('id, created_at')
        .single();

      const finalId = dbRow?.id || tempId;
      const finalTime = dbRow?.created_at || new Date().toISOString();

      // Replace temp ID with real DB ID in sender's message list
      setMessages((prev) =>
        prev.map((m) => m.id === tempId ? { ...m, id: finalId, timestamp: finalTime } : m)
      );

      // 2. Broadcast to recipient's personal channel (instant WebSocket delivery)
      const outgoing: ChatMessage = {
        id: finalId,
        senderId: user.id,
        senderName,
        receiverId,
        text,
        timestamp: finalTime,
      };

      await supabase
        .channel(`chat_inbox_${receiverId}`)
        .send({
          type: 'broadcast',
          event: 'new_message',
          payload: outgoing,
        });

    } catch (err) {
      console.error('[Chat] Send failed:', err);
    }

    setIsSending(false);
  };

  if (!user) return null;

  const activeContact = contacts.find((c) => c.id === receiverId);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">

      {/* ── Incoming Notification Toast ── */}
      {notificationToast && (
        <div
          onClick={() => {
            setReceiverId(notificationToast.senderId);
            setIsOpen(true);
            setUnreadCount(0);
            setNotificationToast(null);
          }}
          className="bg-slate-900 text-white p-3.5 rounded-2xl shadow-2xl border-2 border-primary flex items-center gap-3 cursor-pointer hover:bg-slate-800 transition max-w-xs w-72"
          style={{ animation: 'slideInRight 0.3s ease-out' }}
        >
          <div className="w-9 h-9 bg-primary rounded-full flex items-center justify-center text-lg shrink-0 animate-pulse">
            💬
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-white truncate">{notificationToast.sender}</p>
            <p className="text-[11px] text-slate-300 line-clamp-1 mt-0.5">{notificationToast.text}</p>
            <p className="text-[10px] text-primary-light font-semibold mt-1">Tap to reply →</p>
          </div>
        </div>
      )}

      {/* ── Chat Window ── */}
      {isOpen && (
        <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-80 sm:w-96 h-[440px] flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary to-primary-dark text-white p-4 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <h3 className="font-bold text-sm">Live Chat & Support</h3>
            </div>
            <button
              type="button"
              onClick={() => { setIsOpen(false); setUnreadCount(0); }}
              className="text-white/70 hover:text-white p-1 rounded-full hover:bg-white/10 transition"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Contact Selector */}
          <div className="bg-slate-50 border-b border-slate-200 px-3 py-2 flex items-center gap-2">
            <span className="text-[10px] font-bold text-slate-400 shrink-0">TO:</span>
            <select
              value={receiverId}
              onChange={(e) => { setReceiverId(e.target.value); setUnreadCount(0); }}
              className="flex-1 bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-xs font-semibold text-slate-800 outline-none focus:border-primary"
            >
              {contacts.map((c) => (
                <option key={c.id} value={c.id}>{c.label}</option>
              ))}
            </select>
          </div>

          {activeContact && (
            <div className="px-4 py-1 bg-slate-100/50 border-b border-slate-200/50 flex items-center justify-between">
              <span className="text-[10px] text-slate-500 truncate">
                Chatting with <strong className="text-slate-700">{activeContact.label}</strong>
              </span>
              <span className="text-[9px] text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded shrink-0">● Online</span>
            </div>
          )}

          {/* Message List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/50">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 text-center gap-2">
                <span className="text-3xl">💬</span>
                <p className="text-xs">No messages yet. Say hello!</p>
              </div>
            ) : (
              messages.map((msg) => {
                const isMe = msg.senderId === user.id;
                return (
                  <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                    {!isMe && <span className="text-[10px] text-slate-500 ml-1 mb-0.5 font-semibold">{msg.senderName}</span>}
                    <div className={`px-3.5 py-2.5 rounded-2xl max-w-[85%] text-sm leading-relaxed ${
                      isMe
                        ? 'bg-primary text-white rounded-br-sm shadow-sm'
                        : 'bg-white border border-slate-200 text-slate-800 rounded-bl-sm shadow-sm'
                    }`}>
                      {msg.text.split(/(https?:\/\/[^\s]+)/g).map((part, i) =>
                        /^https?:\/\//.test(part) ? (
                          <a key={i} href={part} target="_blank" rel="noopener noreferrer"
                            className="underline font-semibold break-all text-emerald-300">
                            {part.includes('checkout?negotiation=') ? '🛒 Complete Checkout →' : part}
                          </a>
                        ) : <span key={i}>{part}</span>
                      )}
                    </div>
                    <span className="text-[9px] text-slate-400 mt-0.5 mx-1">
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-slate-200 flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 bg-slate-100 border-none rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              disabled={isSending}
            />
            <button
              type="submit"
              disabled={!newMessage.trim() || isSending}
              className="bg-primary hover:bg-primary-dark text-white rounded-xl w-10 h-10 flex items-center justify-center transition disabled:opacity-40 shadow-md"
            >
              {isSending ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              )}
            </button>
          </form>
        </div>
      )}

      {/* ── Floating Button with Unread Badge ── */}
      <button
        type="button"
        onClick={() => { setIsOpen((o) => !o); if (!isOpen) setUnreadCount(0); }}
        className="relative bg-primary hover:bg-primary-dark text-white rounded-full p-4 shadow-2xl shadow-primary/40 transition-transform hover:scale-105 active:scale-95"
      >
        {unreadCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-extrabold min-w-[20px] h-5 px-1 rounded-full flex items-center justify-center border-2 border-white shadow-lg">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {isOpen ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          )}
        </svg>
      </button>
    </div>
  );
}
