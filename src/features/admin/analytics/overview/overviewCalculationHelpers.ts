import type { OverviewOrder } from '../../types/overview.types';

export const STOREFRONTS = ['yotaabo', 'poshies'] as const;

export function isDelivered(order: OverviewOrder): boolean {
  return order.status === 'delivered';
}

export function isCancelled(order: OverviewOrder): boolean {
  return order.status === 'cancelled';
}

export function isEligibleForSales(order: OverviewOrder): boolean {
  return isDelivered(order) && !isCancelled(order);
}

export function getOrderValue(order: OverviewOrder): number {
  return Number.isFinite(order.subtotal) ? order.subtotal : 0;
}

export function getStatusCounts(orders: OverviewOrder[]) {
  return {
    pending: orders.filter((order) => order.status === 'pending').length,
    confirmed: orders.filter((order) => order.status === 'confirmed').length,
    delivered: orders.filter(isDelivered).length,
    cancelled: orders.filter(isCancelled).length,
  };
}
