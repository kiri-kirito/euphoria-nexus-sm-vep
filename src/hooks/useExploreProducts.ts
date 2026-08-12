'use client';

import { useQuery } from '@tanstack/react-query';
import {
  exploreProductsQueryKey,
  fetchExploreProducts,
  type ExploreProductsParams,
} from '@/lib/queries/products';

export function useExploreProducts(params: ExploreProductsParams) {
  return useQuery({
    queryKey: exploreProductsQueryKey(params),
    queryFn: () => fetchExploreProducts(params),
  });
}
