import { createClient } from '@/utils/supabase/client';
import { useAuthStore } from '@/store/useAuthStore';

/** Sign out from Supabase, clear local session/mock role, redirect home. */
export async function signOutAndRedirect(href = '/') {
  const supabase = createClient();
  await supabase.auth.signOut();
  useAuthStore.getState().clearSession();
  if (typeof window !== 'undefined') {
    localStorage.removeItem('mockUserRole');
    document.cookie = 'mockUserRole=; path=/; max-age=0';
    window.location.href = href;
  }
}
