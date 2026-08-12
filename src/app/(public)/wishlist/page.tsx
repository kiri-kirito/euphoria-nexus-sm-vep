"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import { useAuthStore } from "@/store/useAuthStore";
import { fetchWishlistProducts, removeFromWishlist } from "@/utils/wishlist";
import { resolveProductImage } from "@/utils/productImages";

export default function WishlistPage() {
  const { user } = useAuthStore();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) {
      setLoading(false);
      return;
    }
    fetchWishlistProducts(user.id).then((data) => {
      setItems(data);
      setLoading(false);
    });
  }, [user?.id]);

  const handleRemove = async (productId: string) => {
    if (!user?.id) return;
    await removeFromWishlist(user.id, productId);
    setItems((prev) => prev.filter((i) => i.product_id !== productId));
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-extrabold text-slate-900 mb-8">My Wishlist</h1>

        {!user ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-sm">
            <p className="text-slate-600 mb-6">Sign in to save products to your wishlist.</p>
            <Link href="/register" className="inline-flex px-8 py-3 bg-primary text-white font-bold rounded-xl">
              Sign In / Register
            </Link>
          </div>
        ) : loading ? (
          <p className="text-slate-500 animate-pulse">Loading wishlist...</p>
        ) : items.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Your Wishlist is Empty</h2>
            <p className="text-slate-600 mb-8">Save items you love and come back later.</p>
            <Link href="/explore" className="inline-flex px-8 py-3 bg-primary text-white font-bold rounded-xl">
              Explore Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item) => {
              const p = item.products;
              if (!p) return null;
              const img = resolveProductImage(p);
              return (
                <div key={item.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                  <Link href={`/product/${p.id}`}>
                    <img src={img} alt={p.name} className="w-full h-48 object-cover" />
                  </Link>
                  <div className="p-4">
                    <Link href={`/product/${p.id}`}>
                      <h3 className="font-bold text-slate-900 hover:text-primary">{p.name}</h3>
                    </Link>
                    <p className="text-xs text-slate-500 mt-1">{p.users?.name}</p>
                    <p className="text-lg font-black mt-2">৳{Number(p.price).toLocaleString()}</p>
                    <div className="flex gap-2 mt-4">
                      <Link
                        href={`/product/${p.id}`}
                        className="flex-1 text-center py-2 bg-primary text-white text-sm font-bold rounded-lg"
                      >
                        View
                      </Link>
                      <button
                        onClick={() => handleRemove(p.id)}
                        className="px-4 py-2 border border-slate-200 text-slate-600 text-sm rounded-lg hover:bg-rose-50 hover:text-rose-600"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
