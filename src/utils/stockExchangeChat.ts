import type { SupabaseClient } from '@supabase/supabase-js';
import { io } from 'socket.io-client';
import { getBackendSocketUrl } from '@/utils/backendUrl';
import { buildSocketAuthOptions } from '@/utils/socketAuth';

export async function openStockExchangeChat(
  supabase: SupabaseClient,
  params: {
    fromSellerId: string;
    toSellerId: string;
    fromName: string;
    requestId: string;
    fulfillmentType: string;
  }
): Promise<void> {
  const text = `Stock exchange deal accepted (request #${params.requestId.slice(0, 8)}). Fulfillment: ${params.fulfillmentType.replace('_', ' ')}. Coordinate transfer details here.`;

  await supabase.from('chat_messages').insert({
    sender_id: params.fromSellerId,
    receiver_id: params.toSellerId,
    sender_name: params.fromName,
    text,
  });

  try {
    const socketOpts = await buildSocketAuthOptions();
    const socket = io(getBackendSocketUrl('/chat'), socketOpts);
    socket.emit('send_message', {
      senderId: params.fromSellerId,
      senderName: params.fromName,
      receiverId: params.toSellerId,
      text,
    });
    setTimeout(() => socket.disconnect(), 500);
  } catch {
    /* DB persisted */
  }
}
