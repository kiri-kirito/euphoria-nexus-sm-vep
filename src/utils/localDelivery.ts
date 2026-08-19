import type { SupabaseClient } from '@supabase/supabase-js';
import type { CartItem } from '@/store/useCartStore';
import { io } from 'socket.io-client';
import { getBackendSocketUrl } from '@/utils/backendUrl';
import { buildSocketAuthOptions } from '@/utils/socketAuth';

export async function sellersOfferSameDay(
  supabase: SupabaseClient,
  sellerIds: string[]
): Promise<boolean> {
  if (!sellerIds.length) return false;
  const { data } = await supabase
    .from('stores')
    .select('user_id, settings')
    .in('user_id', sellerIds);

  if (!data?.length) return false;
  return data.every((s) => {
    const settings = (s.settings as Record<string, unknown>) || {};
    return settings.same_day_delivery === true;
  });
}

export async function configureLocalDelivery(
  supabase: SupabaseClient,
  orderId: string,
  items: CartItem[],
  isExpress: boolean
): Promise<{ isPriority: boolean; deliveryType: string }> {
  const sellerIds = [...new Set(items.map((i) => i.sellerId).filter(Boolean))] as string[];
  const sameDay = isExpress && (await sellersOfferSameDay(supabase, sellerIds));
  const deliveryType = sameDay ? 'same_day' : isExpress ? 'express' : 'standard';
  const isPriority = sameDay || isExpress;

  const updatePayload: Record<string, unknown> = {
    is_priority: isPriority,
    delivery_type: deliveryType,
  };
  if (sameDay) {
    updatePayload.pickup_address = `Same-day local route — ${sellerIds.length} seller pickup(s) → buyer`;
  }

  await supabase.from('deliveries').update(updatePayload).eq('order_id', orderId);

  if (isPriority) {
    await pingOnlineDeliveryAgents(supabase, orderId, deliveryType);
  }

  return { isPriority, deliveryType };
}

export async function pingOnlineDeliveryAgents(
  supabase: SupabaseClient,
  orderId: string,
  deliveryType: string
): Promise<void> {
  const { data: agents } = await supabase
    .from('users')
    .select('id, name')
    .in('role', ['agent', 'delivery'])
    .eq('is_banned', false)
    .limit(20);

  if (!agents?.length) return;

  const title =
    deliveryType === 'same_day' ? '⚡ Same-day delivery ping' : '🚀 Priority delivery available';
  const body = `New ${deliveryType.replace('_', ' ')} order ready for pickup — order #${orderId.slice(0, 8)}`;

  await supabase.from('notifications').insert(
    agents.map((a) => ({
      user_id: a.id,
      title,
      body,
      link: '/delivery/dashboard',
    }))
  );

  try {
    const socketOpts = await buildSocketAuthOptions();
    const socket = io(getBackendSocketUrl('/delivery'), socketOpts);
    socket.emit('priority_ping', {
      orderId,
      deliveryType,
      agentIds: agents.map((a) => a.id),
      message: body,
    });
    setTimeout(() => socket.disconnect(), 500);
  } catch {
    /* notifications table is fallback */
  }
}

export async function createNotification(
  supabase: SupabaseClient,
  userId: string,
  title: string,
  body: string,
  link?: string
): Promise<void> {
  await supabase.from('notifications').insert({
    user_id: userId,
    title,
    body,
    link: link || null,
  });
}
