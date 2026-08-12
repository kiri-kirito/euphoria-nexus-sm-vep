"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/useCartStore";
import { resolveProductImage } from "@/utils/productImages";

interface BundleProduct {
  id: string;
  name: string;
  price: number;
  seller_id?: string;
  images?: unknown;
  image?: string;
}

interface Props {
  item1: BundleProduct;
  item2: BundleProduct;
}

export default function BundleAddToCartButton({ item1, item2 }: Props) {
  const addItem = useCartStore((s) => s.addItem);
  const router = useRouter();
  const [added, setAdded] = useState(false);
  const bundleId = `bundle-${item1.id}-${item2.id}`;

  const handleAdd = () => {
    const img1 = item1.image || resolveProductImage(item1);
    const img2 = item2.image || resolveProductImage(item2);

    addItem({
      id: item1.id,
      name: item1.name,
      price: Number(item1.price),
      quantity: 1,
      image: img1,
      sellerId: item1.seller_id,
      bundleId,
    });
    addItem({
      id: item2.id,
      name: item2.name,
      price: Number(item2.price),
      quantity: 1,
      image: img2,
      sellerId: item2.seller_id,
      bundleId,
    });

    setAdded(true);
    setTimeout(() => router.push("/cart"), 600);
  };

  return (
    <button
      type="button"
      onClick={handleAdd}
      className="w-full py-4 px-8 bg-primary hover:bg-primary-dark text-white font-bold text-lg rounded-xl shadow-lg shadow-primary/30 transition-all flex items-center justify-center gap-2"
    >
      {added ? "Added! Redirecting..." : "Add Bundle to Cart (1 delivery fee)"}
    </button>
  );
}
