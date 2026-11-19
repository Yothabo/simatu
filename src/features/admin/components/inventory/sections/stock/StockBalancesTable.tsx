import { FiPackage } from 'react-icons/fi';
import {
  AdminEmptyState,
  AdminText,
} from '../../../../../../design-system/components';
import type { InventoryItem } from '../../types';
import { CELL, HEADER_CELL } from './stock.styles';

type StockBalancesTableProps = {
  inventory: InventoryItem[];
  isLoading: boolean;
  stockSearch: string;
};

const formatQuantity = (value: number | string) =>
  Number(value).toLocaleString('en-ZA');

const formatCurrency = (value: number | string) =>
  new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency: 'ZAR',
  }).format(Number(value));

export default function StockBalancesTable({
  inventory,
  isLoading,
  stockSearch,
}: StockBalancesTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[760px] text-left text-sm">
        <thead>
          <tr
            style={{
              borderBottom: '1px solid var(--admin-border-subtle)',
            }}
          >
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
          ) : inventory.length === 0 ? (
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
            inventory.map((item) => (
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
                    style={{
                      fontWeight: 'var(--admin-weight-medium)',
                    }}
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
                  {formatQuantity(item.on_hand_quantity)}
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
                  {formatQuantity(item.reserved_quantity)}
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
                  {formatQuantity(item.available_quantity)}
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
                    : formatCurrency(item.supplier_cost)}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
