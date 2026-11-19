import type { Order, OrderStatus } from '../../types/admin.types';

const VALID_STATUSES: OrderStatus[] = [
  'pending',
  'confirmed',
  'delivered',
  'cancelled',
];

// Preserve API data exactly. Invalid storefronts must be rejected here,
// never silently assigned to another storefront.
export function isOrders(value: unknown): value is Order[] {
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
            (line.product_id === null ||
              (typeof line.product_id === 'string' &&
                line.product_id.trim().length > 0)) &&
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
        VALID_STATUSES.includes(item.status as OrderStatus) &&
        typeof item.created_at === 'string' &&
        Number.isFinite(Date.parse(item.created_at)) &&
        typeof item.updated_at === 'string' &&
        Number.isFinite(Date.parse(item.updated_at))
      );
    })
  );
}
