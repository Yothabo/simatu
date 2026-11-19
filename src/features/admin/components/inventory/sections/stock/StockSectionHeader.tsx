import { FiActivity, FiPlus } from 'react-icons/fi';
import {
  AdminButton,
  AdminSectionHeader,
} from '../../../../../../design-system/components';

type StockSectionHeaderProps = {
  hasActiveProducts: boolean;
  onReceive: () => void;
  onAdjust: () => void;
};

export default function StockSectionHeader({
  hasActiveProducts,
  onReceive,
  onAdjust,
}: StockSectionHeaderProps) {
  return (
    <div
      className="flex flex-col sm:flex-row sm:items-center sm:justify-between"
      style={{ gap: 'var(--admin-space-sm)' }}
    >
      <AdminSectionHeader
        title="Stock balances"
        description="Track physical stock, reservations and available quantities."
        compact
        as="h3"
      />

      <div
        className="flex flex-wrap"
        style={{ gap: 'var(--admin-space-xs)' }}
      >
        <AdminButton
          variant="primary"
          shape="pill"
          ariaLabel="Receive stock"
          onClick={onReceive}
          disabled={!hasActiveProducts}
        >
          <FiPlus size={16} aria-hidden="true" />
          <span>Receive stock</span>
        </AdminButton>

        <AdminButton
          variant="neutral"
          shape="pill"
          ariaLabel="Adjust stock"
          onClick={onAdjust}
          disabled={!hasActiveProducts}
        >
          <FiActivity size={16} aria-hidden="true" />
          <span>Adjust stock</span>
        </AdminButton>
      </div>
    </div>
  );
}
