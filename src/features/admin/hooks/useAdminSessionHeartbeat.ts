import { useEffect } from 'react';
import type { Session } from '@supabase/supabase-js';
import { updateAppSession } from '../auth/adminSession.api';
import type { AdminContext } from '../auth/adminAuth.types';

export function useAdminSessionHeartbeat(
  session: Session | null,
  admin: AdminContext | null,
  isAdmin: boolean | null,
) {
  useEffect(() => {
    if (!session || !admin || !isAdmin) return;

    const heartbeat = window.setInterval(() => {
      void updateAppSession(session, 'heartbeat').catch((error) => {
        console.error('Admin session heartbeat failed:', error);
      });
    }, 60_000);

    return () => window.clearInterval(heartbeat);
  }, [session, admin, isAdmin]);
}
