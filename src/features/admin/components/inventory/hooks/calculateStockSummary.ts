import type {
  InventoryAggregates,
  InventoryItem,
  StockSummary,
} from '../types';

export function calculateStockSummary(
  inventory: InventoryItem[],
  aggregates: InventoryAggregates,
): StockSummary {
  return {
    units: inventory.reduce(
      (total, item) => total + Number(item.on_hand_quantity || 0),
      0,
    ),
    reserved: inventory.reduce(
      (total, item) => total + Number(item.reserved_quantity || 0),
      0,
    ),
    available: inventory.reduce(
      (total, item) => total + Number(item.available_quantity || 0),
      0,
    ),
    outOfStock: inventory.filter(
      (item) => item.is_initialized && Number(item.available_quantity) <= 0,
    ).length,
    uninitialized: inventory.filter((item) => !item.is_initialized).length,
    valuation: inventory.reduce((total, item) => {
      if (item.supplier_cost === null || item.supplier_cost === undefined) {
        return total;
      }
      return (
        total +
        Number(item.supplier_cost) * Number(item.on_hand_quantity || 0)
      );
    }, 0),
    unvaluedProducts: inventory.filter(
      (item) =>
        Number(item.on_hand_quantity) > 0 &&
        (item.supplier_cost === null || item.supplier_cost === undefined),
    ).length,
    received: Number(aggregates.received) || 0,
    adjusted: Number(aggregates.adjusted) || 0,
  };
}
