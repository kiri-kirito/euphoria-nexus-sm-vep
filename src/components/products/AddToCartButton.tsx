'use client';

import React, { useState } from 'react';
import { useCartStore } from '@/store/useCartStore';

interface AddToCartButtonProps {
  product: {
    id: string;
    name: string;
    price: number;
    image: string;
    sellerId: string;
  };
}

export default function AddToCartButton({ product }: AddToCartButtonProps) {
  const addItem = useCartStore((state) => state.addItem);
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      image: product.image,
      sellerId: product.sellerId,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <button 
      onClick={handleAdd}
      className={`w-full font-bold py-4 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 ${
        added 
          ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/20' 
          : 'bg-primary hover:bg-primary-dark text-white shadow-primary/20'
      }`}
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 11h14l1 12H4L5 11z" /></svg>
      {added ? 'Added to Cart!' : 'Add to Cart'}
    </button>
  );
}
