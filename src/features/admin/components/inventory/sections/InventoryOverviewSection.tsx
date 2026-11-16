import { useMemo, useState } from 'react';
import {
  FiActivity,
  FiPackage,
  FiSearch,
  FiShoppingCart,
  FiTrendingDown,
  FiTrendingUp,
} from 'react-icons/fi';
import {
  AdminCard,
  AdminEmptyState,
  AdminMetric,
  AdminRow,
  AdminText,
} from '../../../../../design-system/components';
import type {
  InventoryItem,
  InventoryMovement,
  StockSummary,
} from '../types';

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

  const metricsDisabled = isLoading || !!loadError;

  return (
    <div className="flex flex-col gap-5">
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

      {!isLoading && !loadError && inventory.length === 0 && (
        <AdminEmptyState
          title="No products are available in this storefront yet"
          description="Inventory metrics will appear here once products have been added."
          icon={<FiPackage size={22} aria-hidden="true" />}
        />
      )}

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

              {filteredMovements.length === 0 ? (
                <p
                  style={{
                    padding: 'var(--admin-space-2xl) 0',
                    textAlign: 'center',
                    fontSize: 'var(--admin-size-supporting)',
                    color: 'var(--admin-text-tertiary)',
                    margin: 0,
                  }}
                >
                  No stock movements match these filters.
                </p>
              ) : (
                <div className="w-full self-stretch text-left">
                  {filteredMovements.slice(0, 8).map((movement, index) => (
                    <AdminRow
                      key={movement.id}
                      columns="minmax(0, 1fr) auto"
                      border={index > 0}
                    >
                      <div className="min-w-0">
                        <AdminText
                          variant="body"
                          as="p"
                          truncate
                          style={{
                            fontWeight: 'var(--admin-weight-medium)',
                          }}
                        >
                          {movement.product_name}
                        </AdminText>
                        <AdminText variant="micro" as="p">
                          {movement.product_sku
                            ? `SKU: ${movement.product_sku} · `
                            : ''}
                          {movement.movement_type.replace(/_/g, ' ')}
                          {movement.reason ? ` · ${movement.reason}` : ''}
                        </AdminText>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <AdminText
                          variant="body"
                          as="p"
                          numeric
                          style={{
                            fontWeight: 'var(--admin-weight-semibold)',
                          }}
                        >
                          {movement.quantity_delta > 0 ? '+' : ''}
                          {movement.quantity_delta}
                        </AdminText>
                        <AdminText variant="micro" as="p">
                          {new Date(movement.created_at).toLocaleString(
                            'en-ZA',
                          )}
                        </AdminText>
                      </div>
                    </AdminRow>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </AdminCard>
    </div>
  );
}
