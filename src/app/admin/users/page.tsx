import { createAdminClient } from '@/utils/supabase/server-admin';
import UsersClient from './UsersClient';

export const dynamic = 'force-dynamic';

const MOCK_USERS = [
  { id: '1', name: 'John Doe (Pending)', email: 'john@seller.com', role: 'seller', phone: '123-456-7890', address: '123 Market St', created_at: new Date().toISOString() },
  { id: '2', name: 'Admin Jane', email: 'jane@admin.com', role: 'admin', phone: '987-654-3210', address: 'HQ', created_at: new Date().toISOString() }
];

export default async function AdminUsers() {
  const supabase = createAdminClient();
  const { data: users, error } = await supabase.from('users').select('*').order('created_at', {ascending: false});
  
  const displayUsers = (error || !users || users.length === 0) ? MOCK_USERS : users;
  
  return <UsersClient users={displayUsers} />;
}
