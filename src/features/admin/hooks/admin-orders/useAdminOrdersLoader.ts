import { useCallback, useLayoutEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { ADMIN_STORAGE_KEYS } from '../../constants/admin.constants';
import { markAdminDatasetReady } from '../../auth/adminRequestTelemetry';
import {
  readAdminSnapshot,
  writeAdminSnapshot,
} from '../../utils/adminSnapshot';
import type { Order } from '../../types/admin.types';
import { isOrders } from './orderGuards';

type Scope = {
  adminRef: React.MutableRefObject<boolean | null>;
  userIdRef: React.MutableRefObject<string | null>;
  adminGenerationRef: React.MutableRefObject<number>;
  setOrders: (orders: Order[]) => void;
};

type OrdersApi = (
  method: 'GET' | 'PATCH' | 'DELETE',
  body?: Record<string, string>,
) => Promise<Record<string, unknown>>;

type Args = {
  isAdmin: boolean | null;
  userId: string | null;
  scope: Scope;
  ordersApi: OrdersApi;
};

export function useAdminOrdersLoader({
  isAdmin,
  userId,
  scope,
  ordersApi,
}: Args) {
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);
  const [hasLoadedOrders, setHasLoadedOrders] = useState(false);
  const [ordersLoadError, setOrdersLoadError] = useState<string | null>(null);

  const { adminRef, userIdRef, adminGenerationRef, setOrders } = scope;

  const loadOrders = useCallback(async () => {
    if (isAdmin !== true || !userId) return;

    const requestGeneration = adminGenerationRef.current;
    const requestUserId = userId;

    const isCurrentRequest = () =>
      requestGeneration === adminGenerationRef.current &&
      adminRef.current === true &&
      userIdRef.current === requestUserId;

    setOrdersLoadError(null);

    try {
      const data = await ordersApi('GET');
      const latestOrders = data.orders ?? [];

      if (!isOrders(latestOrders)) {
        throw new Error('The orders response has an invalid format.');
      }

      if (!isCurrentRequest()) return;

      setOrders(latestOrders);
      markAdminDatasetReady('orders', latestOrders.length, 'network');

      writeAdminSnapshot(
        ADMIN_STORAGE_KEYS.ordersCache,
        requestUserId,
        latestOrders,
      );
    } catch (error) {
      if (isCurrentRequest()) {
        const message =
          error instanceof Error ? error.message : 'Unable to load orders.';

        setOrdersLoadError(message);
        toast.error(message);
      }
    } finally {
      if (isCurrentRequest()) {
        setIsLoadingOrders(false);
        setHasLoadedOrders(true);
      }
    }
  }, [adminGenerationRef, adminRef, isAdmin, ordersApi, setOrders, userId, userIdRef]);

  useLayoutEffect(() => {
    if (isAdmin !== true || !userId) {
      setOrders([]);
      setIsLoadingOrders(false);
      setHasLoadedOrders(false);
      setOrdersLoadError(null);
      return;
    }

    const cachedOrders = readAdminSnapshot(
      ADMIN_STORAGE_KEYS.ordersCache,
      userId,
      (value): value is unknown[] => Array.isArray(value) && isOrders(value),
    );

    if (cachedOrders) {
      setOrders(cachedOrders as Order[]);
      markAdminDatasetReady('orders', cachedOrders.length, 'cache');
      setIsLoadingOrders(false);
      setHasLoadedOrders(true);
      return;
    }

    setOrders([]);
    setIsLoadingOrders(true);
    setHasLoadedOrders(false);
    void loadOrders();
  }, [isAdmin, userId, loadOrders, setOrders]);

  return {
    isLoadingOrders,
    hasLoadedOrders,
    ordersLoadError,
    loadOrders,
  };
}
