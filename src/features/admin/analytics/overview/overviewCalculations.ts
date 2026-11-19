import type {
  OverviewAnalytics,
  OverviewDateRangeValue,
  OverviewOrder,
} from '../../types/overview.types';
import type { Storefront } from '../../types/admin.types';
import { isWithinOverviewRange } from '../../utils/overview/dateRanges';
import { calculateBusinessSummary } from './calculateBusinessSummary';
import { calculateOrderOperations } from './calculateOrderOperations';
import { calculateProductPerformance } from './calculateProductPerformance';
import { calculateSalesPerformance } from './calculateSalesPerformance';
import { calculateStoreComparison } from './calculateStoreComparison';

export {
  calculateBusinessSummary,
  calculateOrderOperations,
  calculateProductPerformance,
  calculateSalesPerformance,
  calculateStoreComparison,
};

export function calculateOverviewAnalytics(args: {
  orders: OverviewOrder[];
  dateRange: OverviewDateRangeValue;
  catalogue: { total: number; active: number; hidden: number };
  selectedStore: Storefront | 'all';
}): OverviewAnalytics {
  const filteredOrders = args.orders.filter((order) =>
    isWithinOverviewRange(order.created_at, args.dateRange),
  );
  const periodOrders =
    args.selectedStore === 'all'
      ? filteredOrders
      : filteredOrders.filter(
          (order) => order.storefront === args.selectedStore,
        );

  return {
    businessSummary: calculateBusinessSummary(periodOrders, args.catalogue),
    salesPerformance: calculateSalesPerformance(periodOrders),
    orderOperations: calculateOrderOperations(periodOrders),
    productPerformance: calculateProductPerformance(periodOrders),
    storeComparison: calculateStoreComparison(
      filteredOrders,
      args.selectedStore,
    ),
  };
}
