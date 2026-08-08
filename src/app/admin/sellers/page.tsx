import { createAdminClient } from '@/utils/supabase/server-admin';
import SellersClient from './SellersClient';

export const dynamic = 'force-dynamic';

export default async function AdminSellers() {
  const supabase = createAdminClient();
  const { data: sellers } = await supabase
    .from('stores')
    .select('*, users(name, email, phone, created_at)')
    .order('created_at', {ascending: false});
    
  return <SellersClient sellers={sellers || []} />;
}
