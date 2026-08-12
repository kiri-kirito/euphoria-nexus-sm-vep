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

export default function GlobalChatWidget() {
  const { user, profile } = useAuthStore();
  const supabase = createClient();
  const { socket, connected, error: socketError } = useSocket('/chat');
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [receiverId, setReceiverId] = useState('system_support'); // Default recipient
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user?.id) return;

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

  useEffect(() => {
    if (!socket || !user) return;

    socket.emit('register_user', user.id);

    const handleReceiveMessage = (msg: ChatMessage) => {
      setMessages((prev) => (prev.some((m) => m.id === msg.id) ? prev : [...prev, msg]));
    };

    socket.on('receive_message', handleReceiveMessage);

    return () => {
      socket.off('receive_message', handleReceiveMessage);
    };
  }, [socket, user]);

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;

    const messagePayload = {
      senderId: user.id,
      senderName: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
      receiverId: receiverId,
      text: newMessage.trim(),
    };

    if (socket) {
      socket.emit('send_message', messagePayload);
    } else {
      await supabase.from('chat_messages').insert({
        sender_id: user.id,
        receiver_id: receiverId,
        sender_name: messagePayload.senderName,
        text: messagePayload.text,
      });
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          ...messagePayload,
          timestamp: new Date().toISOString(),
        },
      ]);
    }

    setNewMessage('');
  };

  if (!user) return null; // Don't show chat widget if not logged in

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Chat Window */}
      {isOpen && (
        <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-80 h-96 flex flex-col overflow-hidden mb-4 animate-fade-in">
          {/* Header */}
          <div className="bg-primary text-white p-3 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${connected ? 'bg-emerald-400 animate-pulse' : 'bg-slate-400'}`}></div>
              <h3 className="font-bold text-sm">{connected ? 'Messages' : 'Connecting...'}</h3>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-white hover:text-slate-200 p-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {socketError && (
            <p className="text-[10px] text-amber-600 bg-amber-50 px-3 py-1 border-b border-amber-100">
              Chat offline — check NEXT_PUBLIC_BACKEND_URL on Vercel
            </p>
          )}
          <div className="bg-slate-50 border-b border-slate-200 p-2 text-xs">
            <span className="text-slate-500 mr-2">To:</span>
            <select 
              value={receiverId} 
              onChange={(e) => setReceiverId(e.target.value)}
              className="bg-transparent border-none font-semibold text-slate-700 outline-none w-48"
            >
              <option value="system_support">Support Agent</option>
              {(profile?.role === 'buyer' || !profile?.role) && <option value="seller_123">Seller (Demo)</option>}
              {profile?.role === 'seller' && <option value="buyer_123">Buyer (Demo)</option>}
            </select>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/50">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-2">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <p className="text-xs">No messages yet.</p>
              </div>
            ) : (
              messages.map((msg, idx) => {
                const isMe = msg.senderId === user.id;
                return (
                  <div key={idx} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                    {!isMe && <span className="text-[10px] text-slate-500 ml-1 mb-0.5">{msg.senderName}</span>}
                    <div className={`px-3 py-2 rounded-2xl max-w-[85%] text-sm ${
                      isMe 
                        ? 'bg-primary text-white rounded-br-sm' 
                        : 'bg-white border border-slate-200 text-slate-700 rounded-bl-sm shadow-sm'
                    }`}>
                      {msg.text}
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

          {/* Input Area */}
          <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-slate-200 flex gap-2">
            <input 
              type="text" 
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 bg-slate-100 border-none rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            <button 
              type="submit"
              disabled={!newMessage.trim()}
              className="bg-primary hover:bg-primary-dark text-white rounded-full p-2 w-9 h-9 flex items-center justify-center transition disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              <svg className="w-4 h-4 ml-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </form>
        </div>
      )}

      {/* Toggle Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="bg-primary hover:bg-primary-dark text-white rounded-full p-4 shadow-xl shadow-primary/30 transition-transform hover:scale-105"
      >
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
