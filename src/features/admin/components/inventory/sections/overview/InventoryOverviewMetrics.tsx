import {
  FiPackage,
  FiShoppingCart,
  FiTrendingDown,
  FiTrendingUp,
} from 'react-icons/fi';
import {
  AdminEmptyState,
  AdminMetric,
} from '../../../../../../design-system/components';
import type {
  InventoryItem,
  StockSummary,
} from '../../types';

type Props = {
  inventory: InventoryItem[];
  stockSummary: StockSummary;
  metricsDisabled: boolean;
};

export default function InventoryOverviewMetrics({
  inventory,
  stockSummary,
  metricsDisabled,
}: Props) {
  return (
    <>
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <AdminMetric
          label="Stock units"
          value={
            metricsDisabled
              ? '—'
              : stockSummary.units.toLocaleString('en-ZA')
          }
          description="Physical units on hand"
          icon={<FiPackage size={18} aria-hidden="true" />}
        />
        <AdminMetric
          label="Stock valuation"
          value={
            metricsDisabled
              ? '—'
              : new Intl.NumberFormat('en-ZA', {
                  style: 'currency',
                  currency: 'ZAR',
                  maximumFractionDigits: 2,
                }).format(stockSummary.valuation)
          }
          description={
            stockSummary.unvaluedProducts > 0
              ? `Partial valuation: ${stockSummary.unvaluedProducts} stocked products missing supplier cost`
              : 'Based on recorded supplier costs'
          }
          icon={<FiTrendingUp size={18} aria-hidden="true" />}
        />
        <AdminMetric
          label="Out of stock"
          value={
            metricsDisabled
              ? '—'
              : stockSummary.outOfStock.toLocaleString('en-ZA')
          }
          description="Products with no available units"
          icon={<FiTrendingDown size={18} aria-hidden="true" />}
        />
        <AdminMetric
          label="Reserved units"
          value={
            metricsDisabled
              ? '—'
              : stockSummary.reserved.toLocaleString('en-ZA')
          }
          description="Allocated to orders"
          icon={<FiShoppingCart size={18} aria-hidden="true" />}
        />
        <AdminMetric
          label="Available units"
          value={
            metricsDisabled
              ? '—'
              : stockSummary.available.toLocaleString('en-ZA')
          }
          description="Physical stock less reservations"
          icon={<FiPackage size={18} aria-hidden="true" />}
        />
        <AdminMetric
          label="Uninitialised"
          value={
            metricsDisabled
              ? '—'
              : stockSummary.uninitialized.toLocaleString('en-ZA')
          }
          description="Products awaiting opening stock"
          icon={<FiPackage size={18} aria-hidden="true" />}
        />
      </div>

      {!metricsDisabled && inventory.length === 0 && (
        <AdminEmptyState
          title="No products are available in this storefront yet"
          description="Inventory metrics will appear here once products have been added."
          icon={<FiPackage size={22} aria-hidden="true" />}
        />
      )}
    </>
  );
}
