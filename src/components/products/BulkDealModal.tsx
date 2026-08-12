'use client';

import React, { useState } from 'react';
import { io } from 'socket.io-client';
import { createClient } from '@/utils/supabase/client';
import { useAuthStore } from '@/store/useAuthStore';

interface BulkDealModalProps {
  isOpen: boolean;
  onClose: () => void;
  productName?: string;
  productId?: string;
  sellerId?: string;
  originalPrice?: number;
}

export default function BulkDealModal({
  isOpen,
  onClose,
  productName = 'Product',
  productId,
  sellerId,
  originalPrice = 0,
}: BulkDealModalProps) {
  const { user } = useAuthStore();
  const supabase = createClient();
  const [quantity, setQuantity] = useState('');
  const [targetPrice, setTargetPrice] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!user) {
      setError('You must be logged in to negotiate');
      return;
    }
    if (!productId || !sellerId) {
      setError('Product or seller information is missing');
      return;
    }

    const qty = parseInt(quantity.replace(/\D/g, ''), 10) || 1;
    const offered = parseFloat(targetPrice.replace(/[^\d.]/g, '')) || 0;

    const { error: dbError } = await supabase.from('negotiations').insert({
      buyer_id: user.id,
      seller_id: sellerId,
      product_id: productId,
      current_price: offered,
      original_price: originalPrice || offered,
      quantity: qty,
      message: message || `Bulk request for ${qty} units`,
      status: 'open',
    });

    if (dbError) {
      setError(dbError.message);
      return;
    }

    try {
      const baseUrl = process.env.NEXT_PUBLIC_SOCKET_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
      const socket = io(`${baseUrl}/negotiations`, { transports: ['websocket', 'polling'] });
      socket.emit('new_negotiation', {
        productId,
        productName,
        quantity: qty,
        targetPrice: offered,
        message,
        buyerId: user.id,
        sellerId,
      });
      setTimeout(() => socket.disconnect(), 500);
    } catch {
      /* socket optional — DB record is source of truth */
    }

    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      onClose();
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-100">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h2 className="text-lg font-bold text-slate-900">Negotiate Bulk Deal</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1.5 rounded-full" aria-label="Close">✕</button>
        </div>

        {submitted ? (
          <div className="p-8 text-center">
            <h3 className="text-xl font-bold text-slate-900">Offer Sent!</h3>
            <p className="text-xs text-slate-500 mt-2">The seller will see this in their negotiations inbox.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
            {error && <p className="text-red-600 text-xs bg-red-50 p-2 rounded-lg">{error}</p>}
            <div className="bg-slate-50 p-3 rounded-xl text-xs">
              Product: <span className="font-bold">{productName}</span>
            </div>
            <input type="text" value={quantity} onChange={(e) => setQuantity(e.target.value)} placeholder="Quantity (e.g. 50)" className="w-full border rounded-xl px-3 py-2 text-xs" required />
            <input type="text" value={targetPrice} onChange={(e) => setTargetPrice(e.target.value)} placeholder="Offered unit price (৳)" className="w-full border rounded-xl px-3 py-2 text-xs" required />
            <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={3} placeholder="Message to seller" className="w-full border rounded-xl px-3 py-2 text-xs resize-none" required />
            <div className="flex gap-3">
              <button type="button" onClick={onClose} className="flex-1 py-2.5 border rounded-xl text-xs font-bold">Cancel</button>
              <button type="submit" className="flex-1 py-2.5 bg-primary text-white rounded-xl text-xs font-bold">Send Offer</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
