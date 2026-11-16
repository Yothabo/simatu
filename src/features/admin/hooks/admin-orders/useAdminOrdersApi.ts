import { useCallback } from 'react';
import { supabase } from '../../../../utils/supabase';

type OrdersApiMethod = 'GET' | 'PATCH' | 'DELETE';

export function useAdminOrdersApi(userId: string | null) {
  return useCallback(
    async (
      method: OrdersApiMethod,
      body?: Record<string, string>,
    ): Promise<Record<string, unknown>> => {
      const {
        data: { session: currentSession },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (
        sessionError ||
        !currentSession?.access_token ||
        currentSession.user.id !== userId
      ) {
        throw new Error(
          'Your admin session has expired. Please sign in again.',
        );
      }

      const response = await fetch('/api/orders', {
        method,
        headers: {
          Authorization: `Bearer ${currentSession.access_token}`,
          Accept: 'application/json',
          ...(body ? { 'Content-Type': 'application/json' } : {}),
        },
        ...(body ? { body: JSON.stringify(body) } : {}),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'The order request failed.');
      }

      return data;
    },
    [userId],
  );
}
