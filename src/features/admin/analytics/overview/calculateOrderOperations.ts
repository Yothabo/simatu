import type {
  OverviewOrder,
  OverviewOrderOperations,
} from '../../types/overview.types';
import {
  getStatusCounts,
} from './overviewCalculationHelpers';

export function calculateOrderOperations(
  periodOrders: OverviewOrder[],
): OverviewOrderOperations {
  const statuses = getStatusCounts(periodOrders);
  const recentOrders = [...periodOrders]
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() -
        new Date(a.created_at).getTime(),
    )
    .slice(0, 10);

  return {
    total: periodOrders.length,
    ...statuses,
    recentOrders,
  };
}
