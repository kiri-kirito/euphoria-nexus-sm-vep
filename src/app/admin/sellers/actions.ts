'use server';

import { createAdminClient } from '@/utils/supabase/server-admin';
import { revalidatePath } from 'next/cache';

export async function toggleSellerApproval(sellerId: string, currentStatus: boolean) {
  const supabase = createAdminClient();
  await supabase.from('stores').update({ is_approved: !currentStatus }).eq('user_id', sellerId);
  revalidatePath('/admin/sellers');
}
