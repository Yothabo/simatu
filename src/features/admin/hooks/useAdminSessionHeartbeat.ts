import { useEffect } from 'react';
import type { Session } from '@supabase/supabase-js';
import { updateAppSession } from '../auth/adminSession.api';
import type { AdminContext } from '../auth/adminAuth.types';

const HEARTBEAT_INTERVAL_MS = 60_000;
const HEARTBEAT_TIMEOUT_MS = 8_000;

export function useAdminSessionHeartbeat(
  session: Session | null,
  admin: AdminContext | null,
  isAdmin: boolean | null,
) {
  useEffect(() => {
    if (!session || !admin || !isAdmin) return;

    let active = true;
    let timer: number | undefined;
    let controller: AbortController | null = null;

    const scheduleNextHeartbeat = () => {
      if (!active) return;
      timer = window.setTimeout(() => {
        void sendHeartbeat();
      }, HEARTBEAT_INTERVAL_MS);
    };

    const sendHeartbeat = async () => {
      if (!active || controller) return;

      const requestController = new AbortController();
      controller = requestController;
      const timeout = window.setTimeout(
        () => requestController.abort(),
        HEARTBEAT_TIMEOUT_MS,
      );

      try {
        await updateAppSession(session, 'heartbeat', requestController.signal);
      } catch (error) {
        if (active && !requestController.signal.aborted) {
          console.error('Admin session heartbeat failed:', error);
        }
      } finally {
        window.clearTimeout(timeout);
        if (controller === requestController) controller = null;
        scheduleNextHeartbeat();
      }
    };

    scheduleNextHeartbeat();

    return () => {
      active = false;
      if (timer !== undefined) window.clearTimeout(timer);
      controller?.abort();
    };
  }, [session, admin, isAdmin]);
}
