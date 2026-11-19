import {
  InventoryItem,
  InventoryMovement,
  StockSummary,
} from '../types';
import InventoryOverviewMetrics from './overview/InventoryOverviewMetrics';
import RecentStockMovements from './overview/RecentStockMovements';

type Props = {
  inventory: InventoryItem[];
  movements: InventoryMovement[];
  stockSummary: StockSummary;
  isLoading: boolean;
  loadError: string;
};

export default function InventoryOverviewSection({
  inventory,
  movements,
  stockSummary,
  isLoading,
  loadError,
}: Props) {
  const metricsDisabled = isLoading || !!loadError;

  return (
    <div className="flex flex-col gap-5">
      <InventoryOverviewMetrics
        inventory={inventory}
        stockSummary={stockSummary}
        metricsDisabled={metricsDisabled}
      />

      <RecentStockMovements
        movements={movements}
        isLoading={isLoading}
      />
    </div>
  );
}
