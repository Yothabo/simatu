import { useCallback } from 'react';
import { supabase } from '../../../../utils/supabase';
import {
  createAdminRequestId,
  getAdminFlowId,
  logAdminTiming,
  startAdminTimer,
} from '../../auth/adminRequestTelemetry';

type ProductsApiMethod = 'GET' | 'PATCH' | 'DELETE';

export function useProductsApi(userId: string | null) {
  return useCallback(
    async (
      method: ProductsApiMethod,
      body?: Record<string, string | boolean>,
      adminScope = false,
    ) => {
      const requestId = createAdminRequestId();
      const flowId = getAdminFlowId();
      const totalStartedAt = startAdminTimer();
      const sessionStartedAt = startAdminTimer();
      const {
        data: { session: currentSession },
        error: sessionError,
      } = await supabase.auth.getSession();

      logAdminTiming('admin.products.session_lookup', requestId, sessionStartedAt, {
        outcome: sessionError ? 'error' : currentSession ? 'session_found' : 'missing_session',
      });

      if (
        sessionError ||
        !currentSession?.access_token ||
        currentSession.user.id !== userId
      ) {
        logAdminTiming('admin.products.total', requestId, totalStartedAt, {
          method,
          outcome: 'invalid_session',
        });
        throw new Error('Your admin session has expired. Please sign in again.');
      }

      const url = adminScope ? '/api/products?scope=admin' : '/api/products';
      const fetchStartedAt = startAdminTimer();
      const response = await fetch(url, {
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

      logAdminTiming('admin.products.fetch', requestId, fetchStartedAt, {
        method,
        httpStatus: response.status,
      });

      const parseStartedAt = startAdminTimer();
      const data = await response.json();
      logAdminTiming('admin.products.parse', requestId, parseStartedAt, {
        method,
        rowCount: Array.isArray(data.products) ? data.products.length : null,
      });

      if (!response.ok) {
        logAdminTiming('admin.products.total', requestId, totalStartedAt, {
          method,
          httpStatus: response.status,
          outcome: 'http_error',
        });
        throw new Error(data.error || 'The product request failed.');
      }

      logAdminTiming('admin.products.total', requestId, totalStartedAt, {
        method,
        httpStatus: response.status,
        outcome: 'success',
      });
      return data;
    },
    [userId],
  );
}
