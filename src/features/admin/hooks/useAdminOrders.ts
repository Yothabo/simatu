import {
  useAdminOrderMutations,
  useAdminOrdersApi,
  useAdminOrdersLoader,
  useAdminOrdersScope,
} from './admin-orders';

export function useAdminOrders(
  isAdmin: boolean | null,
  userId: string | null,
) {
  const scope = useAdminOrdersScope(isAdmin, userId);
  const ordersApi = useAdminOrdersApi(userId);

  const { isLoadingOrders, hasLoadedOrders, ordersLoadError, loadOrders } =
    useAdminOrdersLoader({
      isAdmin,
      userId,
      scope,
      ordersApi,
    });

  const { changeOrderStatus, deleteOrder } = useAdminOrderMutations({
    userId,
    scope,
    loadOrders,
    ordersApi,
  });

  return {
    orders: scope.orders,
    isLoadingOrders,
    hasLoadedOrders,
    ordersLoadError,
    loadOrders,
    changeOrderStatus,
    deleteOrder,
  };
}
