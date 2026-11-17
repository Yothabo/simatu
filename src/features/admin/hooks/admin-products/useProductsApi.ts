import { useCallback } from 'react';
import {
  requestAdminApi,
  type AdminApiMethod,
} from '../../auth/adminApiRequest';

export function useProductsApi(userId: string | null) {
  return useCallback(
    (
      method: AdminApiMethod,
      body?: Record<string, string | boolean>,
      adminScope = false,
    ) =>
      requestAdminApi({
        userId,
        url: adminScope ? '/api/products?scope=admin' : '/api/products',
        method,
        body,
        resource: 'products',
        responseCollection: 'products',
        fallbackError: 'The product request failed.',
      }),
    [userId],
  );
}
