'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useAuthStore } from '@/store/useAuthStore';

export function useCurrentUser() {
  const authUser = useAuthStore((state) => state.user);
  const authRole = useAuthStore((state) => state.role);
  const [userId, setUserId] = useState<string | null>(authUser?.id || null);
  const [role, setRole] = useState<string>(authRole || 'buyer');
  const [loading, setLoading] = useState(!authUser?.id);

  useEffect(() => {
    if (authUser?.id) {
      setUserId(authUser.id);
      if (authRole) setRole(authRole);
      setLoading(false);
      return;
    }

    const supabase = createClient();
    supabase.auth.getSession().then(async ({ data }) => {
      if (data.session?.user) {
        setUserId(data.session.user.id);
        const { data: profile } = await supabase
          .from('users')
          .select('role')
          .eq('id', data.session.user.id)
          .maybeSingle();
        if (profile?.role) setRole(profile.role);
      }
      setLoading(false);
    });
  }, [authUser?.id, authRole]);

  return { userId, role, loading };
}
