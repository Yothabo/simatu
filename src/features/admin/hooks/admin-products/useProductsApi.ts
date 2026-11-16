import { useCallback } from 'react';
import { supabase } from '../../../../utils/supabase';

type ProductsApiMethod = 'GET' | 'PATCH' | 'DELETE';

export function useProductsApi(userId: string | null) {
  return useCallback(
    async (
      method: ProductsApiMethod,
      body?: Record<string, string | boolean>,
      adminScope = false,
    ) => {
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

      const url = adminScope ? '/api/products?scope=admin' : '/api/products';

      const response = await fetch(url, {
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
        throw new Error(data.error || 'The product request failed.');
      }

      return data;
    },
    [userId],
  );
}
