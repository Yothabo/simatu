import { AdminButton } from '../../../../../design-system/components';
import type { OrderFilter } from '../../../types/admin.types';
import { FILTERS } from '../constants';

type Props = {
  orderFilter: OrderFilter;
  onFilterChange: (value: OrderFilter) => void;
};

export default function OrdersFilterBar({
  orderFilter,
  onFilterChange,
}: Props) {
  return (
    <div
      className="flex w-full"
      role="group"
      aria-label="Filter orders"
      style={{
        gap: 'var(--admin-space-xs)',
        flexWrap: 'nowrap',
      }}
    >
      {FILTERS.map((filter) => {
        const isActive = orderFilter === filter;
        return (
          <div
            key={filter}
            style={{
              flex: '1 1 0',
              minWidth: 0,
            }}
          >
            <AdminButton
              variant={isActive ? 'primary' : 'neutral'}
              shape="pill"
              ariaLabel={`Filter: ${filter}`}
              ariaCurrent={isActive ? 'page' : undefined}
              onClick={() => onFilterChange(filter)}
              fullWidth
              style={{
                minWidth: 0,
                fontSize: 'clamp(10px, 2.5vw, 14px)',
                paddingInline: 0,
              }}
            >
              {filter}
            </AdminButton>
          </div>
        );
      })}
    </div>
  );
}
