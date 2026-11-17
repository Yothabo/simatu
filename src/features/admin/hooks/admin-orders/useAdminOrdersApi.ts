import { useCallback } from 'react';
import { supabase } from '../../../../utils/supabase';
import {
  createAdminRequestId,
  getAdminFlowId,
  logAdminTiming,
  startAdminTimer,
} from '../../auth/adminRequestTelemetry';

type OrdersApiMethod = 'GET' | 'PATCH' | 'DELETE';

export function useAdminOrdersApi(userId: string | null) {
  return useCallback(
    async (
      method: OrdersApiMethod,
      body?: Record<string, string>,
    ): Promise<Record<string, unknown>> => {
      const requestId = createAdminRequestId();
      const flowId = getAdminFlowId();
      const totalStartedAt = startAdminTimer();
      const sessionStartedAt = startAdminTimer();
      const {
        data: { session: currentSession },
        error: sessionError,
      } = await supabase.auth.getSession();

      logAdminTiming('admin.orders.session_lookup', requestId, sessionStartedAt, {
        outcome: sessionError ? 'error' : currentSession ? 'session_found' : 'missing_session',
      });

      if (
        sessionError ||
        !currentSession?.access_token ||
        currentSession.user.id !== userId
      ) {
        logAdminTiming('admin.orders.total', requestId, totalStartedAt, {
          method,
          outcome: 'invalid_session',
        });
        throw new Error('Your admin session has expired. Please sign in again.');
      }

      const fetchStartedAt = startAdminTimer();
      let response: Response;
      try {
        response = await fetch('/api/orders', {
          method,
          headers: {
            Authorization: `Bearer ${currentSession.access_token}`,
            Accept: 'application/json',
            'X-Request-ID': requestId,
            'X-Admin-Flow-ID': flowId,
            ...(body ? { 'Content-Type': 'application/json' } : {}),
          },
          ...(body ? { body: JSON.stringify(body) } : {}),
        });
      } catch (error) {
        logAdminTiming('admin.orders.total', requestId, totalStartedAt, {
          method,
          outcome: 'network_error',
          errorName: error instanceof Error ? error.name : 'UnknownError',
        });
        throw error;
      }

      logAdminTiming('admin.orders.fetch', requestId, fetchStartedAt, {
        method,
        httpStatus: response.status,
      });

      const parseStartedAt = startAdminTimer();
      const data = await response.json();
      logAdminTiming('admin.orders.parse', requestId, parseStartedAt, {
        method,
        rowCount: Array.isArray(data.orders) ? data.orders.length : null,
      });

      if (!response.ok) {
        logAdminTiming('admin.orders.total', requestId, totalStartedAt, {
          method,
          httpStatus: response.status,
          outcome: 'http_error',
        });
        throw new Error(data.error || 'The order request failed.');
      }

      logAdminTiming('admin.orders.total', requestId, totalStartedAt, {
        method,
        httpStatus: response.status,
        outcome: 'success',
      });
      return data;
    },
    [userId],
  );
}
