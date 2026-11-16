import { useMemo, useState } from 'react';
import {
  FiActivity,
  FiArrowDownCircle,
  FiArrowUpCircle,
  FiPackage,
  FiPlus,
  FiSearch,
} from 'react-icons/fi';
import {
  AdminButton,
  AdminCard,
  AdminEmptyState,
  AdminMetric,
  AdminSectionHeader,
  AdminText,
} from '../../../../../design-system/components';
import type { InventoryItem, StockSummary } from '../types';

type Props = {
  inventory: InventoryItem[];
  stockSummary: StockSummary;
  isLoading: boolean;
  loadError: string;
  onReceive: () => void;
  onAdjust: () => void;
};

const HEADER_CELL = {
  padding: 'var(--admin-space-sm) var(--admin-space-md)',
  fontSize: 'var(--admin-size-micro)',
  fontWeight: 'var(--admin-weight-semibold)' as const,
  textTransform: 'uppercase' as const,
  letterSpacing: '0.08em',
  color: 'var(--admin-text-tertiary)',
} as const;

const CELL = {
  padding: 'var(--admin-space-sm) var(--admin-space-md)',
} as const;

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
      <div className="grid grid-cols-2 gap-3">
        <AdminMetric
          label="Stock received"
          value={
            metricsDisabled
              ? '—'
              : stockSummary.received.toLocaleString('en-ZA')
          }
          description="Opening stock and replenishment"
          icon={<FiArrowDownCircle size={18} aria-hidden="true" />}
        />
        <AdminMetric
          label="Stock adjusted"
          value={
            metricsDisabled
              ? '—'
              : stockSummary.adjusted.toLocaleString('en-ZA')
          }
          description="Units changed by adjustments"
          icon={<FiArrowUpCircle size={18} aria-hidden="true" />}
        />
      </div>

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

      <AdminCard padding="none">
        <div
          style={{
            padding: 'var(--admin-space-sm) var(--admin-space-md)',
            borderBottom: '1px solid var(--admin-border-subtle)',
          }}
        >
          <div className="relative">
            <FiSearch
              size={17}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2"
              style={{ color: 'var(--admin-text-tertiary)' }}
            />
            <input
              type="search"
              value={stockSearch}
              onChange={(event) => setStockSearch(event.target.value)}
              placeholder="Search product name or SKU"
              aria-label="Search stock balances"
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
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--admin-border-subtle)' }}>
                <th style={{ ...HEADER_CELL, textAlign: 'left' }}>Product</th>
                <th style={{ ...HEADER_CELL, textAlign: 'left' }}>SKU</th>
                <th style={{ ...HEADER_CELL, textAlign: 'right' }}>On hand</th>
                <th style={{ ...HEADER_CELL, textAlign: 'right' }}>Reserved</th>
                <th style={{ ...HEADER_CELL, textAlign: 'right' }}>Available</th>
                <th style={{ ...HEADER_CELL, textAlign: 'right' }}>
                  Supplier cost
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td
                    colSpan={6}
                    style={{
                      padding: 'var(--admin-space-2xl) var(--admin-space-md)',
                      textAlign: 'center',
                    }}
                  >
                    <AdminText variant="supporting" as="p">
                      Loading stock balances...
                    </AdminText>
                  </td>
                </tr>
              ) : filteredInventory.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    style={{
                      padding: 'var(--admin-space-2xl) var(--admin-space-md)',
                    }}
                  >
                    <AdminEmptyState
                      inline
                      title={
                        stockSearch
                          ? 'No matching stock balances'
                          : 'No products found'
                      }
                      description="Products for this storefront will appear here."
                      icon={<FiPackage size={24} aria-hidden="true" />}
                    />
                  </td>
                </tr>
              ) : (
                filteredInventory.map((item) => (
                  <tr
                    key={item.product_id}
                    style={{
                      borderBottom: '1px solid var(--admin-border-subtle)',
                    }}
                  >
                    <td style={CELL}>
                      <AdminText
                        variant="body"
                        as="div"
                        style={{ fontWeight: 'var(--admin-weight-medium)' }}
                      >
                        {item.product_name}
                      </AdminText>
                      {!item.is_initialized && (
                        <AdminText variant="micro" as="span">
                          Opening stock required
                        </AdminText>
                      )}
                    </td>
                    <td
                      style={{
                        ...CELL,
                        color: 'var(--admin-text-secondary)',
                        fontSize: 'var(--admin-size-body)',
                      }}
                    >
                      {item.sku || '—'}
                    </td>
                    <td
                      style={{
                        ...CELL,
                        textAlign: 'right',
                        color: 'var(--admin-text-primary)',
                        fontSize: 'var(--admin-size-body)',
                        fontVariantNumeric: 'tabular-nums',
                      }}
                    >
                      {Number(item.on_hand_quantity).toLocaleString('en-ZA')}
                    </td>
                    <td
                      style={{
                        ...CELL,
                        textAlign: 'right',
                        color: 'var(--admin-text-secondary)',
                        fontSize: 'var(--admin-size-body)',
                        fontVariantNumeric: 'tabular-nums',
                      }}
                    >
                      {Number(item.reserved_quantity).toLocaleString('en-ZA')}
                    </td>
                    <td
                      style={{
                        ...CELL,
                        textAlign: 'right',
                        color:
                          Number(item.available_quantity) <= 0
                            ? 'var(--admin-text-tertiary)'
                            : 'var(--admin-text-primary)',
                        fontSize: 'var(--admin-size-body)',
                        fontVariantNumeric: 'tabular-nums',
                      }}
                    >
                      {Number(item.available_quantity).toLocaleString('en-ZA')}
                    </td>
                    <td
                      style={{
                        ...CELL,
                        textAlign: 'right',
                        color: 'var(--admin-text-secondary)',
                        fontSize: 'var(--admin-size-body)',
                        fontVariantNumeric: 'tabular-nums',
                      }}
                    >
                      {item.supplier_cost === null
                        ? '—'
                        : new Intl.NumberFormat('en-ZA', {
                            style: 'currency',
                            currency: 'ZAR',
                          }).format(Number(item.supplier_cost))}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </AdminCard>
    </div>
  );
}
