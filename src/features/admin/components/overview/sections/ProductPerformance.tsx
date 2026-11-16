import type { OverviewProductPerformanceItem } from '../../../types/overview.types';
import { formatOverviewCurrency } from '../../../utils/overview/currency';
import {
  AdminCard,
  AdminRow,
  AdminSectionHeader,
} from '../../../../../design-system/components';

type Props = {
  data: OverviewProductPerformanceItem[];
};

const COLUMNS = 'minmax(0, 1fr) auto auto';

const HEADER_CELL = {
  fontSize: 'var(--admin-size-micro)',
  fontWeight: 'var(--admin-weight-semibold)',
  letterSpacing: '0.08em',
  textTransform: 'uppercase' as const,
  color: 'var(--admin-text-tertiary)',
} as const;

export default function ProductPerformance({ data }: Props) {
  return (
    <section
      className="flex w-full flex-col"
      style={{ gap: 'var(--admin-space-md)' }}
    >
      <AdminSectionHeader
        title="Product performance"
        description="Products from delivered online orders, grouped by product ID."
      />

      <AdminCard borderless padding="none">
        {data.length === 0 ? (
          <p
            style={{
              padding: 'var(--admin-space-lg) var(--admin-space-md)',
              textAlign: 'center',
              fontSize: 'var(--admin-size-supporting)',
              color: 'var(--admin-text-tertiary)',
              margin: 0,
            }}
          >
            No delivered-order product activity in this period.
          </p>
        ) : (
          <>
            <AdminRow
              columns={COLUMNS}
              border={false}
              style={{
                borderBottom: '1px solid var(--admin-border-subtle)',
              }}
            >
              <span style={HEADER_CELL}>Product</span>
              <span style={{ ...HEADER_CELL, textAlign: 'right' }}>Units</span>
              <span style={{ ...HEADER_CELL, textAlign: 'right' }}>Value</span>
            </AdminRow>

            {data.slice(0, 10).map((product, index) => (
              <AdminRow
                key={product.productId}
                columns={COLUMNS}
                border={index > 0}
              >
                <span
                  style={{
                    fontSize: 'var(--admin-size-body)',
                    fontWeight: 'var(--admin-weight-medium)',
                    color: 'var(--admin-text-primary)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {product.productName}
                </span>
                <span
                  style={{
                    textAlign: 'right',
                    fontSize: 'var(--admin-size-body)',
                    color: 'var(--admin-text-primary)',
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  {product.unitsSold}
                </span>
                <span
                  style={{
                    textAlign: 'right',
                    fontSize: 'var(--admin-size-body)',
                    color: 'var(--admin-text-primary)',
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  {formatOverviewCurrency(product.recordedValue)}
                </span>
              </AdminRow>
            ))}
          </>
        )}
      </AdminCard>
    </section>
  );
}
