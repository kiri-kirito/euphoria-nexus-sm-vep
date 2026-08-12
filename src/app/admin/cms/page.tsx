import React from 'react';
import { getAdminSupabase } from '@/utils/supabase/server-admin';
import AgentClient from './AgentClient';

export const dynamic = 'force-dynamic';

export default async function AgentManagement() {
  const supabase = await getAdminSupabase();
  
  const { data: deliveryAgents } = await supabase
    .from('users')
    .select('*, deliveries(id, status)')
    .eq('role', 'agent');
    
  const { data: supportAgents } = await supabase
    .from('users')
    .select('*, complaints!assigned_to(id, status)')
    .eq('role', 'support');

  return <AgentClient deliveryAgents={deliveryAgents || []} supportAgents={supportAgents || []} />
}
