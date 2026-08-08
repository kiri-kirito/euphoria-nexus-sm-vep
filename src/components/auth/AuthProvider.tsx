'use client';

import { useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useAuthStore } from '@/store/useAuthStore';

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const setSession = useAuthStore((state) => state.setSession);
  const clearSession = useAuthStore((state) => state.clearSession);
  const supabase = createClient();

  useEffect(() => {
    let mounted = true;

    async function initializeAuth() {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        // Fetch user role and profile from users table
        const { data: userData } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (mounted) {
          setSession(session.user, userData?.role || 'buyer', userData);
        }
      } else {
        if (mounted) clearSession();
      }
    }

    initializeAuth();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const { data: userData } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single();
        
        if (mounted) {
          setSession(session.user, userData?.role || 'buyer', userData);
        }
      } else {
        if (mounted) clearSession();
      }
    });

    return () => {
      mounted = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  return <>{children}</>;
}
