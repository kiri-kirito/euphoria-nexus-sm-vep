import { createAdminClient } from '@/utils/supabase/server-admin';
import UsersClient from './UsersClient';

export const dynamic = 'force-dynamic';

export default async function AdminUsers() {
  const supabase = createAdminClient();
  const { data: users } = await supabase.from('users').select('*').order('created_at', {ascending: false});
  return <UsersClient users={users || []} />;
}
