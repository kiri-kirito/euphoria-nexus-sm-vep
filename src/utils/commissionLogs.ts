import type { SupabaseClient } from '@supabase/supabase-js';

export async function recordCommissionLogs(
  supabase: SupabaseClient,
  orderId: string,
  orderTotal: number
): Promise<void> {
  const { data: settings } = await supabase
    .from('platform_settings')
    .select('commission_rate')
    .limit(1)
    .maybeSingle();

  const rate = Number(settings?.commission_rate ?? 10);
  const { data: items } = await supabase
    .from('order_items')
    .select('seller_id, quantity, unit_price')
    .eq('order_id', orderId);

  if (!items?.length) return;

  const bySeller = new Map<string, number>();
  for (const item of items) {
    if (!item.seller_id) continue;
    const line = Number(item.unit_price) * Number(item.quantity);
    bySeller.set(item.seller_id, (bySeller.get(item.seller_id) || 0) + line);
  }

  const rows = [...bySeller.entries()].map(([sellerId, gross]) => {
    const commission = Math.round(gross * (rate / 100));
    return {
      order_id: orderId,
      seller_id: sellerId,
      gross_amount: gross,
      commission_rate: rate,
      commission_amount: commission,
      net_amount: gross - commission,
    };
  });

  if (rows.length) {
    await supabase.from('commission_logs').insert(rows);
  }
}
