'use client';

import { useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';

/** Re-fetch when a Supabase table changes (requires Realtime enabled on that table). */
export function useSupabaseRealtime(
  table: string,
  onChange: () => void,
  enabled = true
) {
  useEffect(() => {
    if (!enabled) return;
    const supabase = createClient();
    const channel = supabase
      .channel(`realtime:${table}:${Date.now()}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table },
        () => onChange()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [table, onChange, enabled]);
}
