'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useSocket } from '@/hooks/useSocket';
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

function playNotificationChime() {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, ctx.currentTime);
    osc.frequency.setValueAtTime(880, ctx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.35);
  } catch {
    // Ignore audio restrictions
  }
}

export default function GlobalChatWidget() {
  const { user, profile } = useAuthStore();
  const supabase = createClient();
  const { socket } = useSocket('/chat');
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [contacts, setContacts] = useState<ChatContact[]>([]);
  const [receiverId, setReceiverId] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationToast, setNotificationToast] = useState<{ senderId: string; sender: string; text: string } | null>(null);
  const [sendingLock, setSendingLock] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // ── Refs to avoid stale closures in Realtime callback ──
  const isOpenRef = useRef(isOpen);
  const receiverIdRef = useRef(receiverId);
  useEffect(() => { isOpenRef.current = isOpen; }, [isOpen]);
  useEffect(() => { receiverIdRef.current = receiverId; }, [receiverId]);

  // ── Load Contacts prioritized by most recent chat history ──
  const loadContacts = useCallback(async () => {
    if (!user?.id) return;

    const list: ChatContact[] = [];
    const seen = new Set<string>();

    const addContact = (id: string, label: string) => {
      if (!id || id === user.id || seen.has(id)) return;
      seen.add(id);
      list.push({ id, label });
    };

    try {
      // Recent conversations
      const { data: recentChats } = await supabase
        .from('chat_messages')
        .select('sender_id, receiver_id, sender_name, text, created_at')
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order('created_at', { ascending: false })
        .limit(50);

      const recentPartnerIds: string[] = [];
      (recentChats || []).forEach((msg) => {
        const partnerId = msg.sender_id === user.id ? msg.receiver_id : msg.sender_id;
        if (partnerId && partnerId !== user.id && !recentPartnerIds.includes(partnerId)) {
          recentPartnerIds.push(partnerId);
        }
      });

      if (recentPartnerIds.length > 0) {
        const [{ data: partnerUsers }, { data: partnerStores }] = await Promise.all([
          supabase.from('users').select('id, name, role').in('id', recentPartnerIds),
          supabase.from('stores').select('user_id, store_name').in('user_id', recentPartnerIds),
        ]);

        const userMap = new Map((partnerUsers || []).map((u) => [u.id, u]));
        const storeMap = new Map((partnerStores || []).map((s) => [s.user_id, s.store_name]));

        recentPartnerIds.forEach((partnerId) => {
          const partnerUser = userMap.get(partnerId);
          const storeName = storeMap.get(partnerId);
          const roleLabel = partnerUser?.role === 'support' ? 'Support' : partnerUser?.role === 'seller' ? 'Seller' : 'Buyer';
          const name = storeName || partnerUser?.name || 'Partner';
          addContact(partnerId, `${roleLabel}: ${name}`);
        });
      }

      // Support Team
      const { data: supportUsers } = await supabase
        .from('users')
        .select('id, name')
        .eq('role', 'support')
        .limit(5);
      (supportUsers || []).forEach((s) => addContact(s.id, `Support: ${s.name}`));

      // Role-based fallback
      const role = profile?.role || 'buyer';
      if (role === 'buyer') {
        const { data: negs } = await supabase
          .from('negotiations')
          .select('seller_id, seller:users!negotiations_seller_id_fkey(name)')
          .eq('buyer_id', user.id)
          .limit(10);
        (negs || []).forEach((n) => {
          const seller = n.seller as { name?: string } | null;
          addContact(n.seller_id as string, `Seller: ${seller?.name || 'Partner'}`);
        });
      }
      if (role === 'seller') {
        const { data: negs } = await supabase
          .from('negotiations')
          .select('buyer_id, users!buyer_id(name)')
          .eq('seller_id', user.id)
          .limit(10);
        (negs || []).forEach((n) => {
          const buyer = n.users as { name?: string } | null;
          addContact(n.buyer_id as string, `Buyer: ${buyer?.name || 'Customer'}`);
        });
      }
      if (role === 'support' || role === 'admin') {
        const { data: recentBuyers } = await supabase
          .from('complaints')
          .select('buyer_id, users!buyer_id(name)')
          .order('created_at', { ascending: false })
          .limit(10);
        (recentBuyers || []).forEach((c) => {
          const buyer = c.users as { name?: string } | null;
          addContact(c.buyer_id as string, `Buyer: ${buyer?.name || 'Customer'}`);
        });
      }

      if (list.length === 0) {
        list.push({ id: 'system_support', label: 'Support Team' });
      }

      setContacts(list);
      setReceiverId((prev) => (prev && list.some((c) => c.id === prev) ? prev : list[0].id));
    } catch (err) {
      console.error('Error loading chat contacts:', err);
    }
  }, [user?.id, profile?.role, supabase]);

  useEffect(() => { loadContacts(); }, [loadContacts]);

  // ── Load message history for active receiver ──
  useEffect(() => {
    if (!user?.id || !receiverId) return;

    async function loadHistory() {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('id, sender_id, sender_name, receiver_id, text, created_at')
        .or(
          `and(sender_id.eq.${user!.id},receiver_id.eq.${receiverId}),and(sender_id.eq.${receiverId},receiver_id.eq.${user!.id})`
        )
        .order('created_at', { ascending: true })
        .limit(60);

      if (error || !data) return;

      setMessages(
        data.map((row) => ({
          id: row.id,
          senderId: row.sender_id,
          senderName: row.sender_name || 'User',
          receiverId: row.receiver_id,
          text: row.text,
          timestamp: row.created_at,
        }))
      );
    }

    loadHistory();
  }, [user?.id, receiverId, supabase]);

  // ── Supabase Realtime — STABLE subscription (NO receiverId/isOpen in deps) ──
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel('chat_messages_global_' + user.id)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'chat_messages' },
        (payload) => {
          const row = payload.new as any;
          if (!row || !row.id) return;

          const incoming: ChatMessage = {
            id: row.id,
            senderId: row.sender_id,
            senderName: row.sender_name || 'User',
            receiverId: row.receiver_id,
            text: row.text,
            timestamp: row.created_at || new Date().toISOString(),
          };

          // ─ My own message echoed back from DB ─
          if (row.sender_id === user.id) {
            setMessages((prev) => {
              // Find any optimistic or prior matching message and replace it
              const idx = prev.findIndex(
                (m) =>
                  m.id === incoming.id ||
                  (m.senderId === user.id &&
                    m.text === incoming.text &&
                    m.receiverId === incoming.receiverId)
              );
              if (idx !== -1) {
                const next = [...prev];
                next[idx] = incoming;
                return next;
              }
              // No match = probably second DB row from backend; ignore it
              return prev;
            });
            return;
          }

          // ─ Incoming message from another user to me ─
          if (row.receiver_id === user.id) {
            const senderPartnerId = row.sender_id;
            const currentReceiverId = receiverIdRef.current;
            const currentIsOpen = isOpenRef.current;

            // Bump sender to top of contacts
            setContacts((prev) => {
              const existing = prev.find((c) => c.id === senderPartnerId);
              const rest = prev.filter((c) => c.id !== senderPartnerId);
              const contactEntry: ChatContact = existing || {
                id: senderPartnerId,
                label: row.sender_name ? `Partner: ${row.sender_name}` : 'Partner',
              };
              return [contactEntry, ...rest];
            });

            // Add to messages if this is the active conversation
            if (currentReceiverId === senderPartnerId) {
              setMessages((prev) => {
                // Deduplicate by ID AND by (sender + text) to handle double DB rows
                const isDup = prev.some(
                  (m) =>
                    m.id === incoming.id ||
                    (m.senderId === incoming.senderId &&
                      m.text === incoming.text &&
                      m.receiverId === incoming.receiverId)
                );
                return isDup ? prev : [...prev, incoming];
              });
            }

            // Always show notification toast & bump unread count
            // (unless chat is open AND the active contact is the sender)
            if (!currentIsOpen || currentReceiverId !== senderPartnerId) {
              setUnreadCount((c) => c + 1);
              playNotificationChime();
              setNotificationToast({
                senderId: senderPartnerId,
                sender: row.sender_name || 'Partner',
                text: row.text,
              });
              setTimeout(() => setNotificationToast(null), 8000);
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
    // Only depend on user.id — NOT on receiverId or isOpen (use refs instead)
  }, [user?.id, supabase]);

  // ── Socket: register only, NO message handling via socket ──
  // Supabase Realtime is the SINGLE source of truth for all messages.
  // Socket is only used to notify the backend for delivery to offline users.
  useEffect(() => {
    if (!socket || !user) return;
    socket.emit('register_user', user.id);
  }, [socket, user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  // ── Send message: insert to DB only (NO socket emit for message content) ──
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user || !receiverId || sendingLock) return;

    setSendingLock(true);

    const messageText = newMessage.trim();
    const senderName = profile?.name || user.user_metadata?.full_name || user.email?.split('@')[0] || 'User';

    const tempId = 'temp_' + Date.now().toString();
    const optimisticMsg: ChatMessage = {
      id: tempId,
      senderId: user.id,
      senderName,
      receiverId,
      text: messageText,
      timestamp: new Date().toISOString(),
    };

    // Optimistically show in UI immediately
    setMessages((prev) => [...prev, optimisticMsg]);
    setNewMessage('');

    try {
      // Single DB insert — Supabase Realtime handles broadcast to everyone
      const { data: dbRow } = await supabase
        .from('chat_messages')
        .insert({
          sender_id: user.id,
          receiver_id: receiverId,
          sender_name: senderName,
          text: messageText,
        })
        .select('id, created_at')
        .single();

      // Replace optimistic temp ID with real DB ID
      if (dbRow?.id) {
        setMessages((prev) =>
          prev.map((m) => (m.id === tempId ? { ...m, id: dbRow.id, timestamp: dbRow.created_at } : m))
        );
      }

      // Emit to socket ONLY for real-time delivery to recipient (no DB insert on backend)
      if (socket) {
        socket.emit('send_message', {
          id: dbRow?.id || tempId,
          senderId: user.id,
          senderName,
          receiverId,
          text: messageText,
          alreadyPersisted: true,
        });
      }
    } catch (err) {
      console.error('Failed to send message:', err);
    }

    setSendingLock(false);
  };

  if (!user) return null;

  const activeContact = contacts.find((c) => c.id === receiverId);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* ── Incoming Message Notification Toast ── */}
      {notificationToast && (
        <div
          onClick={() => {
            setReceiverId(notificationToast.senderId);
            setIsOpen(true);
            setUnreadCount(0);
            setNotificationToast(null);
          }}
          className="mb-3 bg-slate-900 text-white p-4 rounded-2xl shadow-2xl border-2 border-primary flex items-center gap-3 cursor-pointer hover:bg-slate-800 transition max-w-sm animate-bounce z-50"
        >
          <div className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center font-bold text-base shrink-0 shadow-md animate-pulse">
            💬
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-bold text-slate-100 truncate">{notificationToast.sender}</p>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-semibold">New Message</span>
            </div>
            <p className="text-xs text-slate-300 line-clamp-1 mt-0.5">{notificationToast.text}</p>
            <p className="text-[10px] text-primary-light font-bold mt-1">Click to open conversation →</p>
          </div>
        </div>
      )}

      {isOpen && (
        <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-80 sm:w-96 h-[440px] flex flex-col overflow-hidden mb-4">
          <div className="bg-gradient-to-r from-primary to-primary-dark text-white p-4 flex justify-between items-center shadow-sm">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></div>
              <h3 className="font-bold text-sm">Live Chat & Support</h3>
            </div>
            <button
              onClick={() => {
                setIsOpen(false);
                setUnreadCount(0);
              }}
              className="text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10 transition"
              type="button"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="bg-slate-50 border-b border-slate-200 p-2.5 text-xs flex items-center justify-between">
            <span className="text-slate-500 font-bold">Chat With:</span>
            <select
              value={receiverId}
              onChange={(e) => {
                setReceiverId(e.target.value);
                setUnreadCount(0);
              }}
              className="bg-white border border-slate-200 font-bold text-slate-800 rounded-lg px-2.5 py-1.5 outline-none w-56 text-xs shadow-sm"
            >
              {contacts.map((c) => (
                <option key={c.id} value={c.id}>{c.label}</option>
              ))}
            </select>
          </div>
          {activeContact && (
            <div className="bg-slate-100/80 px-4 py-1.5 border-b border-slate-200/60 flex items-center justify-between text-[11px] text-slate-500">
              <span className="truncate">Active with <strong className="text-slate-800">{activeContact.label}</strong></span>
              <span className="text-emerald-600 font-bold text-[10px] bg-emerald-50 px-1.5 py-0.5 rounded">● Online</span>
            </div>
          )}

          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/60">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-2 text-center p-4">
                <span className="text-3xl">💬</span>
                <p className="text-xs font-medium">No previous messages with this contact. Send a message below to start chatting!</p>
              </div>
            ) : (
              messages.map((msg) => {
                const isMe = msg.senderId === user.id;
                return (
                  <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                    {!isMe && <span className="text-[10px] text-slate-500 ml-1 mb-0.5 font-semibold">{msg.senderName}</span>}
                    <div
                      className={`px-3.5 py-2.5 rounded-2xl max-w-[85%] text-sm ${
                        isMe
                          ? 'bg-primary text-white rounded-br-sm shadow-sm'
                          : 'bg-white border border-slate-200 text-slate-800 rounded-bl-sm shadow-sm'
                      }`}
                    >
                      {msg.text.split(/(https?:\/\/[^\s]+)/g).map((part, i) =>
                        /^https?:\/\//.test(part) ? (
                          <a key={i} href={part} className="underline font-semibold break-all text-emerald-300" target="_blank" rel="noopener noreferrer">
                            {part.includes('checkout?negotiation=') ? '🛒 Complete Negotiated Checkout →' : part}
                          </a>
                        ) : (
                          <span key={i}>{part}</span>
                        )
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

          <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-slate-200 flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 bg-slate-100 border-none rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            <button
              type="submit"
              disabled={!newMessage.trim() || sendingLock}
              className="bg-primary hover:bg-primary-dark text-white rounded-xl p-2.5 w-10 h-10 flex items-center justify-center transition disabled:opacity-50 shadow-md shadow-primary/20"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </form>
        </div>
      )}

      {/* ── Floating Chat Button with Unread Badge ── */}
      <button
        type="button"
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) setUnreadCount(0);
        }}
        className="relative bg-primary hover:bg-primary-dark text-white rounded-full p-4 shadow-2xl shadow-primary/40 transition-transform hover:scale-105"
      >
        {unreadCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[11px] font-extrabold min-w-[22px] h-[22px] px-1 rounded-full flex items-center justify-center border-2 border-white shadow-lg animate-bounce">
            {unreadCount}
          </span>
        )}
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {isOpen ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          )}
        </svg>
      </button>
    </div>
  );
}
