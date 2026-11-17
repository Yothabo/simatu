import { FiDownload, FiRefreshCw } from 'react-icons/fi';
import {
  AdminButton,
  AdminSectionHeader,
} from '../../../../design-system/components';
import AddMenu from './shared/AddMenu';
import { exportInventoryCsv } from './utils';
import type { InventoryItem, StorefrontFilter } from './types';

type InventoryPageHeaderProps = {
  inventory: InventoryItem[];
  storefrontFilter: StorefrontFilter;
  isLoading: boolean;
  loadError: string;
  onRefresh: () => Promise<void>;
};

export default function InventoryPageHeader({
  inventory,
  storefrontFilter,
  isLoading,
  loadError,
  onRefresh,
}: InventoryPageHeaderProps) {
  return (
    <AdminSectionHeader
      title="Inventory"
      as="h1"
      action={
        <div
          className="flex items-center flex-wrap"
          style={{ gap: 'var(--admin-space-xs)' }}
        >
          <AdminButton
            variant="neutral"
            shape="circle"
            ariaLabel="Export inventory report"
            onClick={() => {
              if (isLoading || loadError) return;
              exportInventoryCsv(inventory, storefrontFilter);
            }}
            disabled={isLoading || !!loadError || inventory.length === 0}
          >
            <FiDownload size={18} aria-hidden="true" />
          </AdminButton>

          <AdminButton
            variant="neutral"
            shape="circle"
            ariaLabel={isLoading ? 'Refreshing inventory' : 'Refresh inventory'}
            onClick={() => {
              if (isLoading) return;
              void onRefresh();
            }}
          >
            <FiRefreshCw
              size={18}
              aria-hidden="true"
              className={isLoading ? 'animate-spin' : ''}
            />
          </AdminButton>
          <AddMenu />
        </div>
      }
    />
  );
}
