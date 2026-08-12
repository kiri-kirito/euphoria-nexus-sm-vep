import type { SupabaseClient } from '@supabase/supabase-js';
import { io } from 'socket.io-client';
import { getBackendSocketUrl } from '@/utils/backendUrl';
import { buildSocketAuthOptions } from '@/utils/socketAuth';

export function negotiationCheckoutUrl(negotiationId: string, origin?: string): string {
  const base = origin || (typeof window !== 'undefined' ? window.location.origin : '');
  return `${base}/checkout?negotiation=${negotiationId}`;
}

export function checkoutLinkMessage(negotiationId: string, origin?: string): string {
  const url = negotiationCheckoutUrl(negotiationId, origin);
  return `✅ Bulk deal accepted! Your custom checkout link: ${url}`;
}

export async function sendCheckoutLinkInChat(
  supabase: SupabaseClient,
  params: {
    negotiationId: string;
    sellerId: string;
    buyerId: string;
    sellerName: string;
    origin?: string;
  }
): Promise<void> {
  const text = checkoutLinkMessage(params.negotiationId, params.origin);

  await supabase.from('chat_messages').insert({
    sender_id: params.sellerId,
    receiver_id: params.buyerId,
    sender_name: params.sellerName,
    text,
  });

  try {
    const socketOpts = await buildSocketAuthOptions();
    const socket = io(getBackendSocketUrl('/chat'), socketOpts);
    socket.emit('send_message', {
      senderId: params.sellerId,
      senderName: params.sellerName,
      receiverId: params.buyerId,
      text,
    });
    setTimeout(() => socket.disconnect(), 500);
  } catch {
    /* DB message is source of truth */
  }
}
