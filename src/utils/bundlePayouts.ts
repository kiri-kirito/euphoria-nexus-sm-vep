import type { SupabaseClient } from '@supabase/supabase-js';
import type { CartItem } from '@/store/useCartStore';

export type RevenueSplit = Record<string, number>;

export interface PickupStop {
  seller_id: string;
  store_name: string;
  address: string;
  sequence: number;
}

/** Partial bundle return: Total Paid - original price of kept item(s) */
export function calculatePartialBundleRefund(
  bundlePaidTotal: number,
  items: Array<{ product_id: string; unit_price: number; quantity: number; catalog_price?: number }>,
  returnedProductId: string
): number {
  const keptOriginal = items
    .filter((i) => i.product_id !== returnedProductId)
    .reduce((sum, i) => sum + (i.catalog_price ?? i.unit_price) * i.quantity, 0);
  return Math.max(0, Math.round(bundlePaidTotal - keptOriginal));
}

export function splitBundleRevenue(
  bundleSubtotal: number,
  revenueSplit: RevenueSplit
): Array<{ sellerId: string; amount: number }> {
  const entries = Object.entries(revenueSplit).filter(([, frac]) => Number(frac) > 0);
  if (!entries.length) return [];

  const totalFrac = entries.reduce((s, [, f]) => s + Number(f), 0) || 1;
  return entries.map(([sellerId, frac]) => ({
    sellerId,
    amount: Math.round((bundleSubtotal * Number(frac)) / totalFrac),
  }));
}

async function findDbBundle(
  supabase: SupabaseClient,
  productIds: string[]
): Promise<{ id: string; revenue_split: RevenueSplit; total_price: number } | null> {
  if (productIds.length < 2) return null;

  const { data: rows } = await supabase
    .from('bundle_items')
    .select('bundle_id, product_id, product_bundles(id, revenue_split, total_price)')
    .in('product_id', productIds);

  if (!rows?.length) return null;

  const byBundle = new Map<string, Set<string>>();
  const bundleMeta = new Map<string, { revenue_split: RevenueSplit; total_price: number }>();

  for (const row of rows) {
    const bid = row.bundle_id as string;
    if (!byBundle.has(bid)) byBundle.set(bid, new Set());
    byBundle.get(bid)!.add(row.product_id as string);

    const pb = row.product_bundles as { id?: string; revenue_split?: RevenueSplit; total_price?: number } | null;
    if (pb?.id) {
      bundleMeta.set(bid, {
        revenue_split: (pb.revenue_split as RevenueSplit) || {},
        total_price: Number(pb.total_price) || 0,
      });
    }
  }

  const wanted = new Set(productIds);
  for (const [bundleId, products] of byBundle) {
    if (productIds.every((id) => products.has(id))) {
      const meta = bundleMeta.get(bundleId);
      if (meta) return { id: bundleId, ...meta };
    }
  }

  return null;
}

export async function processBundleOrderAfterCheckout(
  supabase: SupabaseClient,
  orderId: string,
  items: CartItem[],
  shippingAddress: string
): Promise<void> {
  const groups = new Map<string, CartItem[]>();
  for (const item of items) {
    if (!item.bundleId) continue;
    const list = groups.get(item.bundleId) || [];
    list.push(item);
    groups.set(item.bundleId, list);
  }

  for (const [, group] of groups) {
    const productIds = group.map((i) => i.id).filter(Boolean);
    const bundleSubtotal = group.reduce((s, i) => s + i.price * i.quantity, 0);
    const sellerIds = [...new Set(group.map((i) => i.sellerId).filter(Boolean))] as string[];

    let revenueSplit: RevenueSplit = {};
    let dbBundleId: string | null = null;

    const dbBundle = await findDbBundle(supabase, productIds);
    if (dbBundle) {
      revenueSplit = dbBundle.revenue_split;
      dbBundleId = dbBundle.id;
      await supabase.from('orders').update({ bundle_id: dbBundleId }).eq('id', orderId);
    } else if (sellerIds.length >= 2) {
      const originalSum = bundleSubtotal || 1;
      revenueSplit = Object.fromEntries(
        sellerIds.map((sid) => {
          const sellerTotal = group
            .filter((i) => i.sellerId === sid)
            .reduce((s, i) => s + i.price * i.quantity, 0);
          return [sid, sellerTotal / originalSum];
        })
      );
    }

    const payouts = splitBundleRevenue(bundleSubtotal, revenueSplit);
    if (payouts.length) {
      await supabase.from('seller_payouts').insert(
        payouts.map((p) => ({
          order_id: orderId,
          seller_id: p.sellerId,
          bundle_id: dbBundleId,
          amount: p.amount,
          status: 'pending',
        }))
      );
    }

    const pickupStops: PickupStop[] = [];
    if (sellerIds.length) {
      const { data: stores } = await supabase
        .from('stores')
        .select('user_id, store_name, settings')
        .in('user_id', sellerIds);

      sellerIds.forEach((sellerId, index) => {
        const store = stores?.find((s) => s.user_id === sellerId);
        const settings = (store?.settings as Record<string, unknown>) || {};
        pickupStops.push({
          seller_id: sellerId,
          store_name: store?.store_name || 'Seller',
          address: String(settings.address || `Seller hub — ${store?.store_name || sellerId.slice(0, 8)}`),
          sequence: index + 1,
        });
      });
    }

    const pickupSummary =
      pickupStops.length > 1
        ? `Multi-pickup (${pickupStops.length} sellers): ${pickupStops.map((s) => s.store_name).join(' → ')}`
        : pickupStops[0]?.address || 'Seller Hub — Dhaka';

    await supabase
      .from('deliveries')
      .update({
        pickup_address: pickupSummary,
        pickup_stops: pickupStops,
        delivery_address: shippingAddress,
      })
      .eq('order_id', orderId);
  }
}

export async function loadOrderRefundAmount(
  supabase: SupabaseClient,
  orderId: string,
  complaintType: string,
  description: string
): Promise<number> {
  const { data: order } = await supabase
    .from('orders')
    .select('total_amount, bundle_id')
    .eq('id', orderId)
    .maybeSingle();

  if (!order) return 0;
  const orderTotal = Number(order.total_amount);

  if (complaintType !== 'return' && complaintType !== 'refund') {
    return orderTotal;
  }

  const { data: items } = await supabase
    .from('order_items')
    .select('product_id, unit_price, quantity, products(price)')
    .eq('order_id', orderId);

  if (!items?.length) return orderTotal;

  const isPartialReturn =
    complaintType === 'return' &&
    (description.includes('[RETURN REQUEST]') || description.toLowerCase().includes('return')) &&
    items.length > 1;

  if (!isPartialReturn || !order.bundle_id) {
    return orderTotal;
  }

  const returnedMatch = description.match(/product[:\s]+([a-f0-9-]{36})/i);
  const returnedId = returnedMatch?.[1] || items[0]?.product_id;

  const mapped = items.map((i) => ({
    product_id: i.product_id as string,
    unit_price: Number(i.unit_price),
    quantity: Number(i.quantity),
    catalog_price: Number((i.products as { price?: number } | null)?.price ?? i.unit_price),
  }));

  const bundlePaid = mapped.reduce((s, i) => s + i.unit_price * i.quantity, 0);
  return calculatePartialBundleRefund(bundlePaid, mapped, returnedId);
}
