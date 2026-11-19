import { FiDollarSign, FiTruck } from 'react-icons/fi';
import type { OverviewSalesPerformance } from '../../../types/overview.types';
import { formatOverviewCurrency } from '../../../utils/overview/currency';
import {
  AdminCard,
  AdminMetric,
  AdminSectionHeader,
} from '../../../../../design-system/components';

type Props = {
  data: OverviewSalesPerformance;
};

export default function SalesPerformance({ data }: Props) {
  const maximum = Math.max(
    ...data.dailySales.map((point) => point.value),
    0,
  );

  return (
    <section
      className="flex w-full flex-col"
      style={{ gap: 'var(--admin-space-md)' }}
    >
      <AdminSectionHeader
        title="Sales performance"
        description="Recorded sales activity from delivered online orders. Delivery does not confirm payment."
      />

      <div
        className="grid grid-cols-1 sm:grid-cols-2"
        style={{ gap: 'var(--admin-space-md)' }}
      >
        <AdminMetric
          label="Recorded sales value"
          value={formatOverviewCurrency(data.recordedSalesValue)}
          description="Delivered online orders only"
          icon={<FiDollarSign size={18} aria-hidden="true" />}
        />
        <AdminMetric
          label="Delivered orders"
          value={data.deliveredOrders}
          description="Within selected period"
          icon={<FiTruck size={18} aria-hidden="true" />}
        />
      </div>

      <AdminCard borderless>
        <div
          className="flex flex-col"
          style={{ gap: 'var(--admin-space-md)' }}
        >
          <h3
            style={{
              fontSize: 'var(--admin-size-body)',
              fontWeight: 'var(--admin-weight-semibold)',
              color: 'var(--admin-text-primary)',
              margin: 0,
            }}
          >
            Daily recorded sales
          </h3>

          {data.dailySales.length === 0 ? (
            <p
              style={{
                paddingBlock: 'var(--admin-space-lg)',
                textAlign: 'center',
                fontSize: 'var(--admin-size-supporting)',
                color: 'var(--admin-text-tertiary)',
                margin: 0,
              }}
            >
              No delivered-order sales recorded in this period.
            </p>
          ) : (
            <div
              className="flex items-end"
              style={{
                gap: 'var(--admin-space-xs)',
                overflowX: 'auto',
                paddingBottom: 'var(--admin-space-xs)',
              }}
            >
              {data.dailySales.map((point) => {
                const pct =
                  maximum > 0
                    ? Math.max(4, (point.value / maximum) * 100)
                    : 0;

                return (
                  <div
                    key={point.date}
                    className="flex flex-col items-center"
                    style={{
                      minWidth: '48px',
                      flex: '1 1 0',
                      gap: 'var(--admin-space-xs)',
                    }}
                    title={`${point.date}: ${formatOverviewCurrency(point.value)}`}
                  >
                    <span
                      style={{
                        fontSize: 'var(--admin-size-micro)',
                        color: 'var(--admin-text-tertiary)',
                        fontVariantNumeric: 'tabular-nums',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {formatOverviewCurrency(point.value)}
                    </span>

                    <div
                      style={{
                        width: '100%',
                        height: '112px',
                        display: 'flex',
                        alignItems: 'flex-end',
                        overflow: 'hidden',
                        borderRadius: 'var(--ds-radius-sm)',
                        backgroundColor: 'var(--admin-surface-subtle)',
                      }}
                    >
                      <div
                        style={{
                          width: '100%',
                          height: `${pct}%`,
                          borderRadius: 'var(--ds-radius-sm)',
                          backgroundColor: 'var(--admin-accent)',
                        }}
                      />
                    </div>

                    <span
                      style={{
                        fontSize: 'var(--admin-size-micro)',
                        color: 'var(--admin-text-tertiary)',
                        fontVariantNumeric: 'tabular-nums',
                      }}
                    >
                      {point.label.slice(5)}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </AdminCard>
    </section>
  );
}
