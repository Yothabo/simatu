import { useMemo, useState } from 'react';
import { AdminCard } from '../../../../../design-system/components';
import type { InventoryItem, StockSummary } from '../types';
import StockMetrics from './stock/StockMetrics';
import StockSectionHeader from './stock/StockSectionHeader';
import StockSearch from './stock/StockSearch';
import StockBalancesTable from './stock/StockBalancesTable';

type Props = {
  inventory: InventoryItem[];
  stockSummary: StockSummary;
  isLoading: boolean;
  loadError: string;
  onReceive: () => void;
  onAdjust: () => void;
};

export default function InventoryStockSection({
  inventory,
  stockSummary,
  isLoading,
  loadError,
  onReceive,
  onAdjust,
}: Props) {
  const [stockSearch, setStockSearch] = useState('');

  const filteredInventory = useMemo(() => {
    const search = stockSearch.trim().toLowerCase();

    if (!search) return inventory;

    return inventory.filter((item) =>
      [item.product_name, item.sku || ''].some((value) =>
        value.toLowerCase().includes(search),
      ),
    );
  }, [inventory, stockSearch]);

  const metricsDisabled = isLoading || !!loadError;
  const hasActiveProducts = inventory.some((item) => item.is_active);

  return (
    <div className="flex flex-col gap-5">
      <StockMetrics
        stockSummary={stockSummary}
        disabled={metricsDisabled}
      />

      <StockSectionHeader
        hasActiveProducts={hasActiveProducts}
        onReceive={onReceive}
        onAdjust={onAdjust}
      />

      <AdminCard padding="none">
        <StockSearch
          value={stockSearch}
          onChange={setStockSearch}
        />

        <StockBalancesTable
          inventory={filteredInventory}
          isLoading={isLoading}
          stockSearch={stockSearch}
        />
      </AdminCard>
    </div>
  );
}
