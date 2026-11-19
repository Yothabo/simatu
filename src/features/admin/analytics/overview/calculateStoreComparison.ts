import type { Storefront } from '../../types/admin.types';
import type {
  OverviewOrder,
  OverviewStorePerformance,
} from '../../types/overview.types';
import {
  getOrderValue,
  isCancelled,
  isEligibleForSales,
  STOREFRONTS,
} from './overviewCalculationHelpers';

export function calculateStoreComparison(
  periodOrders: OverviewOrder[],
  selectedStore: Storefront | 'all',
): OverviewStorePerformance[] {
  const stores: readonly Storefront[] =
    selectedStore === 'all' ? STOREFRONTS : [selectedStore];

  return stores.map((storefront) => {
    const storeOrders = periodOrders.filter(
      (order) => order.storefront === storefront,
    );
    const deliveredOrders = storeOrders.filter(isEligibleForSales);
    const unitsSold = deliveredOrders.reduce(
      (total, order) =>
        total + order.items.reduce((sum, item) => sum + item.qty, 0),
      0,
    );

    return {
      storefront,
      orders: storeOrders.filter((order) => !isCancelled(order)).length,
      deliveredOrders: deliveredOrders.length,
      recordedSalesValue: deliveredOrders.reduce(
        (total, order) => total + getOrderValue(order),
        0,
      ),
      unitsSold,
    };
  });
}
