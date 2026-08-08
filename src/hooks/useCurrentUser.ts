'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';

export function useCurrentUser() {
  const [userId, setUserId] = useState<string | null>(null);
  const [role, setRole] = useState<string>('buyer');
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data }) => {
      if (data.session?.user) {
        setUserId(data.session.user.id);
      }
      // Also check mockUserRole cookie for dev purposes
      const cookieMatch = document.cookie.match(new RegExp('(^| )mockUserRole=([^;]+)'));
      if (cookieMatch && cookieMatch[2]) setRole(cookieMatch[2]);
      setLoading(false);
    });
  }, []);
  
  return { userId, role, loading };
}
