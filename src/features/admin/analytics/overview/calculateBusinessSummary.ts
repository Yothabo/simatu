import type {
  OverviewBusinessSummary,
  OverviewOrder,
} from '../../types/overview.types';
import { getStatusCounts, isCancelled } from './overviewCalculationHelpers';

export function calculateBusinessSummary(
  periodOrders: OverviewOrder[],
  catalogue: { total: number; active: number; hidden: number },
): OverviewBusinessSummary {
  const statuses = getStatusCounts(periodOrders);

  return {
    ordersReceived: periodOrders.filter((order) => !isCancelled(order)).length,
    outstandingOrders: statuses.pending + statuses.confirmed,
    pendingOrders: statuses.pending,
    confirmedOrders: statuses.confirmed,
    deliveredOrders: statuses.delivered,
    cancelledOrders: statuses.cancelled,
    totalProducts: catalogue.total,
    activeProducts: catalogue.active,
    hiddenProducts: catalogue.hidden,
  };
}
