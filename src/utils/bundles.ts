import { resolveProductImage } from './productImages';

export interface BundleProduct {
  id: string;
  name: string;
  price: number;
  image: string;
  seller_id?: string;
  seller?: string;
}

export interface NormalizedBundle {
  id: string;
  title: string;
  bundlePrice: number;
  originalTotal: number;
  savings: number;
  sellerCount: number;
  item1: BundleProduct;
  item2: BundleProduct;
  productIds: [string, string];
}

function mapProduct(raw: any): BundleProduct {
  return {
    id: raw.id,
    name: raw.name,
    price: Number(raw.price || 0),
    image: resolveProductImage(raw),
    seller_id: raw.seller_id,
    seller: raw.users?.name || raw.seller || 'Seller',
  };
}

/** Build bundle view models from DB product_bundles rows */
export function normalizeDbBundles(rows: any[]): NormalizedBundle[] {
  return rows
    .map((row) => {
      const items = (row.bundle_items || [])
        .map((bi: any) => bi.products)
        .filter(Boolean)
        .slice(0, 2);
      if (items.length < 2) return null;

      const item1 = mapProduct(items[0]);
      const item2 = mapProduct(items[1]);
      const originalTotal = item1.price + item2.price;
      const bundlePrice = Number(row.total_price) || Math.round(originalTotal * 0.85);
      const savings = Math.max(0, originalTotal - bundlePrice);
      const sellerIds = new Set([item1.seller_id, item2.seller_id].filter(Boolean));

      return {
        id: row.id,
        title: row.bundle_name || `${item1.name.split(' ')[0]} & ${item2.name.split(' ')[0]} Combo`,
        bundlePrice,
        originalTotal,
        savings,
        sellerCount: sellerIds.size || 1,
        item1,
        item2,
        productIds: [item1.id, item2.id] as [string, string],
      };
    })
    .filter(Boolean) as NormalizedBundle[];
}

/** Fallback: pair consecutive products (different sellers preferred) */
export function buildPairBundles(products: any[], limit = 12): NormalizedBundle[] {
  const bundles: NormalizedBundle[] = [];
  const used = new Set<string>();

  for (let i = 0; i < products.length && bundles.length < limit; i++) {
    const p1 = mapProduct(products[i]);
    if (used.has(p1.id)) continue;

    let partnerIdx = -1;
    for (let j = i + 1; j < products.length; j++) {
      const p2Candidate = products[j];
      if (p1.seller_id && p2Candidate.seller_id !== p1.seller_id) {
        partnerIdx = j;
        break;
      }
    }
    if (partnerIdx === -1 && i + 1 < products.length) partnerIdx = i + 1;
    if (partnerIdx === -1) continue;

    const p2 = mapProduct(products[partnerIdx]);
    used.add(p1.id);
    used.add(p2.id);

    const originalTotal = p1.price + p2.price;
    const bundlePrice = Math.round(originalTotal * 0.85);
    const savings = originalTotal - bundlePrice;
    const sellerIds = new Set([p1.seller_id, p2.seller_id].filter(Boolean));

    bundles.push({
      id: `pair-${p1.id}-${p2.id}`,
      title: `${p1.name.split(' ')[0]} & ${p2.name.split(' ')[0]} Combo Pack`,
      bundlePrice,
      originalTotal,
      savings,
      sellerCount: sellerIds.size || 1,
      item1: p1,
      item2: p2,
      productIds: [p1.id, p2.id],
    });
  }

  return bundles;
}

export function bundleDetailPath(productIds: [string, string]): string {
  return `/bundle/${productIds[0]}/${productIds[1]}`;
}
