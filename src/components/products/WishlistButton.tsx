"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { addToWishlist, isInWishlist, removeFromWishlist } from "@/utils/wishlist";

interface Props {
  productId: string;
  className?: string;
}

export default function WishlistButton({ productId, className = "" }: Props) {
  const { user } = useAuthStore();
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user?.id) return;
    isInWishlist(user.id, productId).then(setSaved);
  }, [user?.id, productId]);

  const toggle = async () => {
    if (!user?.id) {
      window.location.href = "/register";
      return;
    }
    setLoading(true);
    if (saved) {
      await removeFromWishlist(user.id, productId);
      setSaved(false);
    } else {
      await addToWishlist(user.id, productId);
      setSaved(true);
    }
    setLoading(false);
  };

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={loading}
      aria-label={saved ? "Remove from wishlist" : "Add to wishlist"}
      className={`inline-flex items-center justify-center w-10 h-10 rounded-full border transition-all ${
        saved
          ? "bg-rose-50 border-rose-200 text-rose-500"
          : "bg-white border-slate-200 text-slate-400 hover:text-rose-500 hover:border-rose-200"
      } ${className}`}
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill={saved ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    </button>
  );
}
