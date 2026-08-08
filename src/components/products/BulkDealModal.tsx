'use client';

import React, { useState } from 'react';
import { io } from 'socket.io-client';

interface BulkDealModalProps {
  isOpen: boolean;
  onClose: () => void;
  productName?: string;
  productId?: string;
}

import { useAuthStore } from '@/store/useAuthStore';

export default function BulkDealModal({ isOpen, onClose, productName = 'Product', productId }: BulkDealModalProps) {
  const { user } = useAuthStore();
  const [quantity, setQuantity] = useState('');
  const [targetPrice, setTargetPrice] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      alert("You must be logged in to negotiate");
      return;
    }

    // Connect to Socket.io backend (Express server on port 5000)
    const socket = io('http://localhost:5000/negotiations');
    
    // Emit the new_negotiation event
    socket.emit('new_negotiation', {
      productId,
      productName,
      quantity,
      targetPrice,
      message,
      buyerId: user.id, // Real user ID
      sellerId: 'seller-mock-id', // Ideally from product.seller
    });

    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      socket.disconnect();
      onClose();
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col border border-slate-100">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-purple-100 text-purple-600 rounded-xl">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Negotiate Bulk Deal</h2>
              <p className="text-xs text-slate-500">B2B Direct Offer to Seller</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 hover:bg-slate-200/60 rounded-full transition"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {submitted ? (
          <div className="p-8 text-center flex flex-col items-center justify-center gap-3">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center animate-bounce">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-slate-900">Negotiation Offer Sent!</h3>
            <p className="text-xs text-slate-500 max-w-xs">
              The seller will review your offer for <span className="font-semibold text-slate-800">{productName}</span> and respond shortly in your negotiations inbox.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 text-xs text-slate-600">
              Requesting custom pricing for <span className="font-bold text-slate-900">{productName}</span>
            </div>
            
            <div>
              <label htmlFor="quantity" className="block text-xs font-semibold text-slate-700 mb-1">Required Quantity</label>
              <input 
                type="text" 
                id="quantity"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="e.g. 500 units, 5 tons" 
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs outline-none focus:border-primary focus:bg-white transition"
                required
              />
            </div>
            
            <div>
              <label htmlFor="targetPrice" className="block text-xs font-semibold text-slate-700 mb-1">Offered Unit Price (৳ Taka)</label>
              <input 
                type="text" 
                id="targetPrice"
                value={targetPrice}
                onChange={(e) => setTargetPrice(e.target.value)}
                placeholder="e.g. ৳380/kg or ৳28,000/unit" 
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs outline-none focus:border-primary focus:bg-white transition"
                required
              />
            </div>
            
            <div>
              <label htmlFor="message" className="block text-xs font-semibold text-slate-700 mb-1">Message to Seller</label>
              <textarea 
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
                placeholder="Specify delivery location, payment timeline, or specifications..." 
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs outline-none focus:border-primary focus:bg-white transition resize-none"
                required
              ></textarea>
            </div>
            
            <div className="flex gap-3 mt-2">
              <button 
                type="button" 
                onClick={onClose}
                className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-700 text-xs rounded-xl hover:bg-slate-50 font-bold transition"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="flex-1 px-4 py-2.5 bg-primary hover:bg-primary-dark text-white text-xs rounded-xl font-bold transition shadow-md shadow-primary/20"
              >
                Send Offer
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
