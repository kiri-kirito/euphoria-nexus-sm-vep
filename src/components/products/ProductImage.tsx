'use client';

import { useState, useEffect } from 'react';
import { resolveProductImage, defaultProductImage } from '@/utils/productImages';

type ProductLike = {
  name?: string;
  category?: string;
  images?: unknown;
  image?: string;
  img?: string;
  [key: string]: unknown;
};

interface ProductImageProps {
  product: ProductLike;
  alt?: string;
  className?: string;
}

export default function ProductImage({ product, alt, className = '' }: ProductImageProps) {
  const primary = resolveProductImage(product);
  const [src, setSrc] = useState(primary);
  const [usedFallback, setUsedFallback] = useState(false);

  useEffect(() => {
    setSrc(resolveProductImage(product));
    setUsedFallback(false);
  }, [product]);

  return (
    <img
      src={src}
      alt={alt || product.name || 'Product'}
      className={className}
      loading="lazy"
      onError={() => {
        if (!usedFallback) {
          setUsedFallback(true);
          setSrc(defaultProductImage(product.category));
        }
      }}
    />
  );
}
