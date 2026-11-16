import type { InventoryResponse } from '../types';
import { isNullableString, isNumericValue } from './validation';

export function isInventoryResponse(
  value: unknown,
): value is InventoryResponse {
  if (!value || typeof value !== 'object') return false;

  const data = value as Record<string, unknown>;

  if (
    !Array.isArray(data.inventory) ||
    !Array.isArray(data.movements) ||
    !data.aggregates ||
    typeof data.aggregates !== 'object'
  ) {
    return false;
  }

  const inventoryValid = data.inventory.every((entry: unknown) => {
    if (!entry || typeof entry !== 'object') return false;

    const item = entry as Record<string, unknown>;

    return (
      typeof item.product_id === 'string' &&
      typeof item.product_name === 'string' &&
      isNullableString(item.sku) &&
      (item.price === null || isNumericValue(item.price)) &&
      (item.supplier_cost === null || isNumericValue(item.supplier_cost)) &&
      isNullableString(item.image_url) &&
      typeof item.is_active === 'boolean' &&
      isNumericValue(item.on_hand_quantity) &&
      isNumericValue(item.reserved_quantity) &&
      isNumericValue(item.available_quantity) &&
      typeof item.is_initialized === 'boolean' &&
      isNullableString(item.updated_at)
    );
  });

  const movementsValid = data.movements.every((entry: unknown) => {
    if (!entry || typeof entry !== 'object') return false;

    const item = entry as Record<string, unknown>;

    return (
      typeof item.id === 'string' &&
      typeof item.product_id === 'string' &&
      typeof item.product_name === 'string' &&
      isNullableString(item.product_sku) &&
      typeof item.movement_type === 'string' &&
      isNumericValue(item.quantity_delta) &&
      isNumericValue(item.reserved_delta) &&
      typeof item.source_type === 'string' &&
      isNullableString(item.reason) &&
      isNullableString(item.actor_email) &&
      typeof item.created_at === 'string'
    );
  });

  const aggregates = data.aggregates as Record<string, unknown>;

  return (
    inventoryValid &&
    movementsValid &&
    isNumericValue(aggregates.received) &&
    isNumericValue(aggregates.adjusted)
  );
}
