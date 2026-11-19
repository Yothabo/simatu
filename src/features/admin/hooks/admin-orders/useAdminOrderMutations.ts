import { useCallback } from 'react';
import toast from 'react-hot-toast';
import type { Order, OrderStatus } from '../../types/admin.types';

type Scope = {
  adminRef: React.MutableRefObject<boolean | null>;
  userIdRef: React.MutableRefObject<string | null>;
};

type OrdersApi = (
  method: 'GET' | 'PATCH' | 'DELETE',
  body?: Record<string, string>,
) => Promise<Record<string, unknown>>;

type Args = {
  userId: string | null;
  scope: Scope;
  loadOrders: () => Promise<void>;
  ordersApi: OrdersApi;
};

export function useAdminOrderMutations({
  userId,
  scope,
  loadOrders,
  ordersApi,
}: Args) {
  const { adminRef, userIdRef } = scope;

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
              : 'Unable to update order.',
          );
        }

        return false;
      }
    },
    [adminRef, loadOrders, ordersApi, userId, userIdRef],
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
              : 'Unable to delete order.',
          );
        }

        return false;
      }
    },
    [adminRef, loadOrders, ordersApi, userId, userIdRef],
  );

  return {
    changeOrderStatus,
    deleteOrder,
  };
}
