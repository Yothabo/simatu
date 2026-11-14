import { useCallback, useLayoutEffect, useRef, useState } from 'react';
import { supabase } from '../../../utils/supabase';
import toast from 'react-hot-toast';
import type {
  Order,
  OrderStatus,
} from '../types/admin.types';
import { ADMIN_STORAGE_KEYS } from '../constants/admin.constants';
import {
  readAdminSnapshot,
  writeAdminSnapshot,
} from '../utils/adminSnapshot';

function normalizeOrders(value: unknown): unknown {
  // Preserve API data exactly. Invalid storefronts must be rejected,
  // never silently assigned to another storefront.
  return value;
}

function isOrders(value: unknown): value is Order[] {
  const validStatuses: OrderStatus[] = [
    'pending',
    'confirmed',
    'delivered',
    'cancelled',
  ];

  return (
    Array.isArray(value) &&
    value.every((order) => {
      if (!order || typeof order !== 'object') return false;

      const item = order as Record<string, unknown>;

      return (
        typeof item.id === 'string' &&
        item.id.trim().length > 0 &&
        (item.storefront === 'yotaabo' || item.storefront === 'poshies') &&
        typeof item.order_number === 'string' &&
        item.order_number.trim().length > 0 &&
        typeof item.customer_name === 'string' &&
        typeof item.customer_phone === 'string' &&
        Array.isArray(item.items) &&
        item.items.every((orderItem: unknown) => {
          if (!orderItem || typeof orderItem !== 'object') return false;

          const line = orderItem as Record<string, unknown>;

          return (
            (
              line.product_id === null ||
              (
                typeof line.product_id === 'string' &&
                line.product_id.trim().length > 0
              )
            ) &&
            typeof line.name === 'string' &&
            line.name.trim().length > 0 &&
            typeof line.price === 'number' &&
            Number.isFinite(line.price) &&
            line.price >= 0 &&
            typeof line.qty === 'number' &&
            Number.isInteger(line.qty) &&
            line.qty > 0
          );
        }) &&
        typeof item.subtotal === 'number' &&
        Number.isFinite(item.subtotal) &&
        item.subtotal >= 0 &&
        validStatuses.includes(item.status as OrderStatus) &&
        typeof item.created_at === 'string' &&
        Number.isFinite(Date.parse(item.created_at)) &&
        typeof item.updated_at === 'string' &&
        Number.isFinite(Date.parse(item.updated_at))
      );
    })
  );
}

export function useAdminOrders(
  isAdmin: boolean | null,
  userId: string | null
) {
  const adminRef = useRef(isAdmin);
  const userIdRef = useRef(userId);
  const adminGenerationRef = useRef(0);
  const previousScopeRef = useRef({ isAdmin, userId });

  if (
    previousScopeRef.current.isAdmin !== isAdmin ||
    previousScopeRef.current.userId !== userId
  ) {
    adminGenerationRef.current += 1;
    previousScopeRef.current = { isAdmin, userId };
  }

  adminRef.current = isAdmin;
  userIdRef.current = userId;

  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);
  const [hasLoadedOrders, setHasLoadedOrders] = useState(false);
  const [ordersLoadError, setOrdersLoadError] = useState<string | null>(null);

  const ordersApi = useCallback(
    async (
      method: 'GET' | 'PATCH' | 'DELETE',
      body?: Record<string, string>
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
          'Your admin session has expired. Please sign in again.'
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
    [userId]
  );

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
      const latestOrders = normalizeOrders(data.orders ?? []);

      if (!isOrders(latestOrders)) {
        throw new Error('The orders response has an invalid format.');
      }

      if (!isCurrentRequest()) return;

      setOrders(latestOrders);

      writeAdminSnapshot(
        ADMIN_STORAGE_KEYS.ordersCache,
        requestUserId,
        latestOrders
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
  }, [isAdmin, ordersApi, userId]);

  const changeOrderStatus = useCallback(
    async (order: Order, newStatus: OrderStatus): Promise<boolean> => {
      try {
        await ordersApi('PATCH', {
          id: order.id,
          status: newStatus,
        });

        if (adminRef.current && userIdRef.current === userId) {
          toast.success(`Order ${order.order_number} → ${newStatus}`);
          await loadOrders();
        }

        return true;
      } catch (error) {
        if (adminRef.current && userIdRef.current === userId) {
          toast.error(
            error instanceof Error
              ? error.message
              : 'Unable to update order.'
          );
        }

        return false;
      }
    },
    [loadOrders, ordersApi, userId]
  );

  const deleteOrder = useCallback(
    async (order: Order): Promise<boolean> => {
      try {
        await ordersApi('DELETE', { id: order.id });

        if (adminRef.current && userIdRef.current === userId) {
          toast.success(`Order ${order.order_number} deleted`);
          await loadOrders();
        }

        return true;
      } catch (error) {
        if (adminRef.current && userIdRef.current === userId) {
          toast.error(
            error instanceof Error
              ? error.message
              : 'Unable to delete order.'
          );
        }

        return false;
      }
    },
    [loadOrders, ordersApi, userId]
  );

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
      (value): value is unknown[] =>
        Array.isArray(value) && isOrders(normalizeOrders(value))
    );

    if (cachedOrders) {
      setOrders(normalizeOrders(cachedOrders) as Order[]);
      setIsLoadingOrders(false);
      setHasLoadedOrders(true);
      return;
    }

    setOrders([]);
    setIsLoadingOrders(true);
    setHasLoadedOrders(false);
    void loadOrders();
  }, [isAdmin, userId, loadOrders]);

  return {
    orders,
    isLoadingOrders,
    hasLoadedOrders,
    ordersLoadError,
    loadOrders,
    changeOrderStatus,
    deleteOrder,
  };
}
