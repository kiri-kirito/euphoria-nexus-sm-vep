"use server";

import { getAdminSupabase } from '@/utils/supabase/server-admin';

export async function exportOrdersToCSV() {
  const supabase = await getAdminSupabase();
  const { data: orders } = await supabase.from('orders').select('*, users!buyer_id(name, email)').limit(500);
  
  if (!orders) return null;
  
  const csv = [
    'Order ID,Buyer Name,Buyer Email,Total Amount,Status,Date',
    ...orders.map(o => `${o.id},${o.users?.name || ''},${o.users?.email || ''},${o.total_amount},${o.status},${new Date(o.created_at).toLocaleDateString()}`)
  ].join('\n');
  
  return csv;
}
