import type { CartItem } from '@/store/useCartStore';

/** Each bundle = 1 fee; each non-bundle seller = 1 fee. */
export function countDeliveryUnits(items: CartItem[]): number {
  const bundleIds = new Set<string>();
  const standaloneSellers = new Set<string>();
  let orphanCount = 0;

  for (const item of items) {
    if (item.bundleId) {
      bundleIds.add(item.bundleId);
    } else if (item.sellerId) {
      standaloneSellers.add(item.sellerId);
    } else {
      orphanCount += 1;
    }
  }

  const units = bundleIds.size + standaloneSellers.size + (orphanCount > 0 ? 1 : 0);
  return Math.max(1, units);
}

export function calcShippingFee(items: CartItem[], ratePerUnit: number): number {
  return countDeliveryUnits(items) * ratePerUnit;
}

export function shippingLabel(items: CartItem[]): string {
  const bundles = new Set(items.filter((i) => i.bundleId).map((i) => i.bundleId)).size;
  const sellers = new Set(items.filter((i) => !i.bundleId && i.sellerId).map((i) => i.sellerId)).size;
  const parts: string[] = [];
  if (bundles) parts.push(`${bundles} bundle${bundles > 1 ? 's' : ''}`);
  if (sellers) parts.push(`${sellers} seller${sellers > 1 ? 's' : ''}`);
  return parts.length ? parts.join(' + ') : 'Standard';
}
