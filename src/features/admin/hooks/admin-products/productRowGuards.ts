import type { AdminRow } from '../../types/admin.types';

export function normalizeAdminRows(value: unknown): unknown {
  if (!Array.isArray(value)) return value;

  return value.map((product) => {
    if (!product || typeof product !== 'object') return product;

    const item = product as Record<string, unknown>;

    const supplierCost =
      item.supplier_cost == null ||
      (typeof item.supplier_cost === 'string' &&
        item.supplier_cost.trim() === '')
        ? null
        : typeof item.supplier_cost === 'string'
          ? Number(item.supplier_cost)
          : item.supplier_cost;

    return {
      ...item,
      storefront: item.storefront === 'poshies' ? 'poshies' : 'yotaabo',
      price:
        typeof item.price === 'string' && item.price.trim() !== ''
          ? Number(item.price)
          : item.price,
      supplier_cost: supplierCost,
      sort_order:
        typeof item.sort_order === 'string' && item.sort_order.trim() !== ''
          ? Number(item.sort_order)
          : item.sort_order,
    };
  });
}

export function isAdminRows(value: unknown): value is AdminRow[] {
  return (
    Array.isArray(value) &&
    value.every((product) => {
      if (!product || typeof product !== 'object') return false;

      const item = product as Record<string, unknown>;

      return (
        typeof item.id === 'string' &&
        (item.storefront === 'yotaabo' || item.storefront === 'poshies') &&
        typeof item.name === 'string' &&
        typeof item.price === 'number' &&
        (item.supplier_cost === undefined ||
          item.supplier_cost === null ||
          (typeof item.supplier_cost === 'number' &&
            Number.isFinite(item.supplier_cost) &&
            item.supplier_cost >= 0)) &&
        ['His', 'Hers', 'Spaces', 'Lounge'].includes(String(item.category)) &&
        typeof item.subcategory === 'string' &&
        (item.description === null || typeof item.description === 'string') &&
        (item.image_url === null || typeof item.image_url === 'string') &&
        typeof item.is_active === 'boolean' &&
        typeof item.sort_order === 'number' &&
        typeof item.created_at === 'string'
      );
    })
  );
}
