import { useCallback } from 'react';
import {
  requestAdminApi,
  type AdminApiMethod,
} from '../../auth/adminApiRequest';

export function useAdminOrdersApi(userId: string | null) {
  return useCallback(
    (method: AdminApiMethod, body?: Record<string, string>) =>
      requestAdminApi({
        userId,
        url: '/api/orders',
        method,
        body,
        resource: 'orders',
        responseCollection: 'orders',
        fallbackError: 'The order request failed.',
      }),
    [userId],
  );
}
