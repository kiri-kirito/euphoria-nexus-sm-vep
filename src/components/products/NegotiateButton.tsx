'use client';

import { useState } from 'react';
import BulkDealModal from './BulkDealModal';

interface Props {
  productId: string;
  productName: string;
  sellerId?: string;
  price?: number;
  className?: string;
}

export default function NegotiateButton({ productId, productName, sellerId, price, className }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={className || "w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2"}
      >
        <svg className={className ? "w-4 h-4 text-purple-400" : "w-5 h-5 text-purple-400"} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
        Negotiate
      </button>

      <BulkDealModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        productId={productId}
        productName={productName}
        sellerId={sellerId}
        originalPrice={price}
      />
    </>
  );
}
