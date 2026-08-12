'use server';

import { createAdminClient, AdminServiceKeyMissingError } from '@/utils/supabase/server-admin';
import { revalidatePath } from 'next/cache';

export async function toggleSellerApproval(sellerId: string, currentStatus: boolean) {
  try {
    const supabase = createAdminClient();
    await supabase.from('stores').update({ is_approved: !currentStatus }).eq('user_id', sellerId);
    revalidatePath('/admin/sellers');
  } catch (err) {
    if (err instanceof AdminServiceKeyMissingError) {
      throw new Error('Admin service key not configured on server');
    }
    throw err;
  }
}
