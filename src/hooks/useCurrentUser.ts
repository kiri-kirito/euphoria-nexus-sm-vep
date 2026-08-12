'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';

export function useCurrentUser() {
  const [userId, setUserId] = useState<string | null>(null);
  const [role, setRole] = useState<string>('buyer');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
  }, []);

  return { userId, role, loading };
}
