import { useMemo, useState } from 'react';
import { FiActivity, FiSearch } from 'react-icons/fi';
import {
  AdminCard,
  AdminEmptyState,
  AdminText,
} from '../../../../../../design-system/components';
import type { InventoryMovement } from '../../types';
import InventoryMovementList from './InventoryMovementList';

type Props = {
  movements: InventoryMovement[];
  isLoading: boolean;
};

export default function RecentStockMovements({
  movements,
  isLoading,
}: Props) {
  const [movementSearch, setMovementSearch] = useState('');
  const [movementTypeFilter, setMovementTypeFilter] = useState('all');

  const filteredMovements = useMemo(() => {
    const search = movementSearch.trim().toLowerCase();

    return movements.filter((movement) => {
      const matchesSearch =
        !search ||
        [movement.product_name, movement.product_sku || ''].some((value) =>
          value.toLowerCase().includes(search),
        );

      const matchesType =
        movementTypeFilter === 'all' ||
        movement.movement_type === movementTypeFilter;

      return matchesSearch && matchesType;
    });
  }, [movements, movementSearch, movementTypeFilter]);

  return (
    <AdminCard>
      <AdminText
        variant="card-title"
        as="h3"
        style={{ marginBottom: 'var(--admin-space-md)' }}
      >
        Recent stock movements
      </AdminText>

      <div
        className="flex flex-col"
        style={{ gap: 'var(--admin-space-md)' }}
      >
        {isLoading ? (
          <p
            style={{
              padding: 'var(--admin-space-2xl) 0',
              textAlign: 'center',
              fontSize: 'var(--admin-size-supporting)',
              color: 'var(--admin-text-tertiary)',
              margin: 0,
            }}
          >
            Loading stock movements...
          </p>
        ) : movements.length === 0 ? (
          <AdminEmptyState
            inline
            title="No stock movements recorded yet"
            icon={<FiActivity size={22} aria-hidden="true" />}
          />
        ) : (
          <>
            <div
              className="grid grid-cols-1 sm:grid-cols-2"
              style={{ gap: 'var(--admin-space-sm)' }}
            >
              <div className="relative">
                <FiSearch
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2"
                  size={16}
                  style={{ color: 'var(--admin-text-tertiary)' }}
                />
                <input
                  type="search"
                  value={movementSearch}
                  onChange={(event) =>
                    setMovementSearch(event.target.value)
                  }
                  placeholder="Search product name or SKU"
                  aria-label="Search movements by product name or SKU"
                  style={{
                    width: '100%',
                    paddingBlock: 'var(--admin-space-xs)',
                    paddingLeft: 'var(--admin-space-2xl)',
                    paddingRight: 'var(--admin-space-sm)',
                    borderRadius: 'var(--ds-radius-lg)',
                    borderWidth: '1px',
                    borderStyle: 'solid',
                    borderColor: 'var(--admin-border-subtle)',
                    backgroundColor: 'var(--admin-surface)',
                    color: 'var(--admin-text-primary)',
                    fontSize: 'var(--admin-size-supporting)',
                    outline: 'none',
                  }}
                />
              </div>

              <select
                value={movementTypeFilter}
                onChange={(event) =>
                  setMovementTypeFilter(event.target.value)
                }
                aria-label="Filter movements by type"
                style={{
                  width: '100%',
                  paddingInline: 'var(--admin-space-sm)',
                  paddingBlock: 'var(--admin-space-xs)',
                  borderRadius: 'var(--ds-radius-lg)',
                  borderWidth: '1px',
                  borderStyle: 'solid',
                  borderColor: 'var(--admin-border-subtle)',
                  backgroundColor: 'var(--admin-surface)',
                  color: 'var(--admin-text-primary)',
                  fontSize: 'var(--admin-size-supporting)',
                  outline: 'none',
                }}
              >
                <option value="all">All movement types</option>
                <option value="opening_stock">Opening stock</option>
                <option value="replenishment">Replenishment</option>
                <option value="adjustment_increase">
                  Adjustment increase
                </option>
                <option value="adjustment_decrease">
                  Adjustment decrease
                </option>
              </select>
            </div>

            <AdminText
              variant="micro"
              as="p"
              style={{ color: 'var(--admin-text-tertiary)' }}
            >
              Showing {Math.min(filteredMovements.length, 8)} of{' '}
              {filteredMovements.length} matching movements from the latest{' '}
              {movements.length} loaded records.
            </AdminText>

            <InventoryMovementList movements={filteredMovements} />
          </>
        )}
      </div>
    </AdminCard>
  );
}
