import { createClient } from '@/utils/supabase/client';

export const BASE_SOCKET_OPTIONS = {
  transports: ['websocket', 'polling'] as ('websocket' | 'polling')[],
  withCredentials: true,
  reconnectionAttempts: 5,
  timeout: 10000,
};

export async function getSocketAuthToken(): Promise<string | null> {
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session?.access_token ?? null;
}

export async function buildSocketAuthOptions() {
  const token = await getSocketAuthToken();
  return {
    ...BASE_SOCKET_OPTIONS,
    auth: token ? { token } : {},
  };
}
