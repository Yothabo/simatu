import type {
  OverviewOrder,
  OverviewProductPerformanceItem,
} from '../../types/overview.types';
import { isEligibleForSales } from './overviewCalculationHelpers';

export function calculateProductPerformance(
  periodOrders: OverviewOrder[],
): OverviewProductPerformanceItem[] {
  const products = new Map<string, OverviewProductPerformanceItem>();

  for (const order of periodOrders) {
    if (!isEligibleForSales(order)) continue;

    for (const item of order.items) {
      // Deleted products retain their order lines but cannot be ranked.
      if (
        typeof item.product_id !== 'string' ||
        item.product_id.trim().length === 0
      ) continue;

      const current = products.get(item.product_id) ?? {
        productId: item.product_id,
        productName: item.name,
        unitsSold: 0,
        recordedValue: 0,
      };

      current.unitsSold += item.qty;
      current.recordedValue += item.price * item.qty;
      products.set(item.product_id, current);
    }
  }

  return [...products.values()].sort(
    (a, b) =>
      b.unitsSold - a.unitsSold ||
      b.recordedValue - a.recordedValue,
  );
}
