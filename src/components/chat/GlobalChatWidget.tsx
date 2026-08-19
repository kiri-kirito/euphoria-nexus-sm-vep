'use client';

import React, { useState, useEffect, useRef } from 'react';
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

export default function GlobalChatWidget() {
  const { user, profile } = useAuthStore();
  const supabase = createClient();
  const { socket, connected } = useSocket('/chat');
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [contacts, setContacts] = useState<ChatContact[]>([]);
  const [receiverId, setReceiverId] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationToast, setNotificationToast] = useState<{ sender: string; text: string } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load Contacts based on user role and interactions
  useEffect(() => {
    if (!user?.id) return;

    async function loadContacts() {
      const list: ChatContact[] = [];
      const seen = new Set<string>();

      const addContact = (id: string, label: string) => {
        if (!id || id === user!.id || seen.has(id)) return;
        seen.add(id);
        list.push({ id, label });
      };

      const { data: supportUsers } = await supabase
        .from('users')
        .select('id, name')
        .eq('role', 'support')
        .limit(5);
      (supportUsers || []).forEach((s) => addContact(s.id, `Support: ${s.name}`));

      const role = profile?.role || 'buyer';

      if (role === 'buyer') {
        const { data: negs } = await supabase
          .from('negotiations')
          .select('seller_id, seller:users!negotiations_seller_id_fkey(name)')
          .eq('buyer_id', user!.id)
          .limit(10);
        (negs || []).forEach((n) => {
          const seller = n.seller as { name?: string } | null;
          addContact(n.seller_id as string, `Seller: ${seller?.name || 'Partner'}`);
        });

        const { data: orders } = await supabase
          .from('orders')
          .select('order_items(seller_id, users!seller_id(name))')
          .eq('buyer_id', user!.id)
          .limit(5);
        (orders || []).forEach((o) => {
          (o.order_items as { seller_id?: string; users?: { name?: string } }[] | null)?.forEach((oi) => {
            if (oi.seller_id) addContact(oi.seller_id, `Seller: ${oi.users?.name || 'Store'}`);
          });
        });
      }

      if (role === 'seller') {
        const { data: negs } = await supabase
          .from('negotiations')
          .select('buyer_id, users!buyer_id(name)')
          .eq('seller_id', user!.id)
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
    }

    loadContacts();
  }, [user?.id, profile?.role, supabase]);

  // Load message history for active receiver
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
        .limit(50);

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

  // Real-time message subscription with Supabase Realtime Channels
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel('public:chat_messages_realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'chat_messages' },
        (payload) => {
          const row = payload.new as any;
          const incoming: ChatMessage = {
            id: row.id || Date.now().toString(),
            senderId: row.sender_id,
            senderName: row.sender_name || 'User',
            receiverId: row.receiver_id,
            text: row.text,
            timestamp: row.created_at || new Date().toISOString(),
          };

          // If it's a message for the current active conversation
          if (
            (row.sender_id === user.id && row.receiver_id === receiverId) ||
            (row.sender_id === receiverId && row.receiver_id === user.id)
          ) {
            setMessages((prev) => (prev.some((m) => m.id === incoming.id) ? prev : [...prev, incoming]));
          }

          // If incoming message is for me
          if (row.receiver_id === user.id && row.sender_id !== user.id) {
            if (!isOpen || receiverId !== row.sender_id) {
              setUnreadCount((c) => c + 1);
              setNotificationToast({
                sender: row.sender_name || 'Partner',
                text: row.text,
              });
              setTimeout(() => setNotificationToast(null), 5000);
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, receiverId, isOpen, supabase]);

  // Socket sync fallback
  useEffect(() => {
    if (!socket || !user) return;

    socket.emit('register_user', user.id);

    const handleReceiveMessage = (msg: ChatMessage) => {
      if (msg.senderId !== receiverId && msg.receiverId !== receiverId && msg.senderId !== user.id) return;
      setMessages((prev) => (prev.some((m) => m.id === msg.id) ? prev : [...prev, msg]));
    };

    socket.on('receive_message', handleReceiveMessage);

    return () => {
      socket.off('receive_message', handleReceiveMessage);
    };
  }, [socket, user, receiverId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user || !receiverId) return;

    const messagePayload = {
      senderId: user.id,
      senderName: profile?.name || user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
      receiverId,
      text: newMessage.trim(),
    };

    // Optimistically update UI
    const optimisticMsg: ChatMessage = {
      id: Date.now().toString(),
      ...messagePayload,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimisticMsg]);
    setNewMessage('');

    // Insert to Supabase DB (triggers Realtime for recipient)
    await supabase.from('chat_messages').insert({
      sender_id: user.id,
      receiver_id: receiverId,
      sender_name: messagePayload.senderName,
      text: messagePayload.text,
    });

    if (socket) {
      socket.emit('send_message', messagePayload);
    }
  };

  if (!user) return null;

  const activeContact = contacts.find((c) => c.id === receiverId);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Real-Time Incoming Message Toast Notification */}
      {notificationToast && !isOpen && (
        <div
          onClick={() => {
            setIsOpen(true);
            setUnreadCount(0);
            setNotificationToast(null);
          }}
          className="mb-3 bg-slate-900 text-white p-4 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-3 cursor-pointer hover:bg-slate-800 transition max-w-sm animate-bounce"
        >
          <div className="w-9 h-9 bg-primary rounded-full flex items-center justify-center font-bold text-sm shrink-0">
            💬
          </div>
          <div>
            <p className="text-xs font-bold text-slate-200">{notificationToast.sender}</p>
            <p className="text-xs text-slate-400 line-clamp-1">{notificationToast.text}</p>
          </div>
        </div>
      )}

      {isOpen && (
        <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-80 sm:w-96 h-[420px] flex flex-col overflow-hidden mb-4 animate-fade-in">
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
            <span className="text-slate-500 font-medium">To:</span>
            <select
              value={receiverId}
              onChange={(e) => {
                setReceiverId(e.target.value);
                setUnreadCount(0);
              }}
              className="bg-white border border-slate-200 font-bold text-slate-800 rounded-lg px-2 py-1 outline-none w-56"
            >
              {contacts.map((c) => (
                <option key={c.id} value={c.id}>{c.label}</option>
              ))}
            </select>
          </div>
          {activeContact && (
            <p className="text-[10px] text-slate-400 px-4 py-1 border-b border-slate-100 truncate bg-white">
              Connected with {activeContact.label}
            </p>
          )}

          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/60">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-2">
                <p className="text-xs">No messages yet. Send a message to start conversation!</p>
              </div>
            ) : (
              messages.map((msg) => {
                const isMe = msg.senderId === user.id;
                return (
                  <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                    {!isMe && <span className="text-[10px] text-slate-500 ml-1 mb-0.5">{msg.senderName}</span>}
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
              disabled={!newMessage.trim()}
              className="bg-primary hover:bg-primary-dark text-white rounded-xl p-2.5 w-10 h-10 flex items-center justify-center transition disabled:opacity-50 shadow-md shadow-primary/20"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </form>
        </div>
      )}

      {/* Floating Chat Trigger Button with Unread Badge */}
      <button
        type="button"
        onClick={() => {
          setIsOpen(!isOpen);
          setUnreadCount(0);
        }}
        className="relative bg-primary hover:bg-primary-dark text-white rounded-full p-4 shadow-2xl shadow-primary/40 transition-transform hover:scale-105"
      >
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[11px] font-extrabold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-md animate-pulse">
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
