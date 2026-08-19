'use server';

import { createAdminClient, AdminServiceKeyMissingError } from '@/utils/supabase/server-admin';
import { revalidatePath } from 'next/cache';

export async function toggleSellerApproval(sellerId: string, currentStatus: boolean) {
  try {
    const supabase = createAdminClient();
    const nextStatus = !currentStatus;
    
    // Update store approval status
    await supabase.from('stores').update({ is_approved: nextStatus }).eq('user_id', sellerId);
    
    // Update user role based on approval status
    if (nextStatus) {
      await supabase.from('users').update({ role: 'seller' }).eq('id', sellerId);
    } else {
      // Revert to buyer if revoked
      await supabase.from('users').update({ role: 'buyer' }).eq('id', sellerId);
    }
    
    revalidatePath('/admin/sellers');
    revalidatePath('/admin/users'); // Also revalidate users page since role changed
  } catch (err) {
    if (err instanceof AdminServiceKeyMissingError) {
      throw new Error('Admin service key not configured on server');
    }
    throw err;
  }
}
