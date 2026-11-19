import type {
  OverviewOrder,
  OverviewSalesPerformance,
  OverviewSalesPoint,
} from '../../types/overview.types';
import { getOverviewDateKey } from '../../utils/overview/dateRanges';
import {
  getOrderValue,
  isEligibleForSales,
} from './overviewCalculationHelpers';

export function calculateSalesPerformance(
  periodOrders: OverviewOrder[],
): OverviewSalesPerformance {
  const deliveredOrders = periodOrders.filter(isEligibleForSales);
  const salesByDate = new Map<string, OverviewSalesPoint>();

  for (const order of deliveredOrders) {
    const date = getOverviewDateKey(order.created_at);
    const point = salesByDate.get(date) ?? {
      date,
      label: date,
      value: 0,
      orders: 0,
    };

    point.value += getOrderValue(order);
    point.orders += 1;
    salesByDate.set(date, point);
  }

  const dailySales = [...salesByDate.values()].sort(
    (a, b) => a.date.localeCompare(b.date),
  );

  return {
    recordedSalesValue: deliveredOrders.reduce(
      (total, order) => total + getOrderValue(order),
      0,
    ),
    deliveredOrders: deliveredOrders.length,
    dailySales,
  };
}
