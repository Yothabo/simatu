import {
  FiActivity,
  FiCheckCircle,
  FiTruck,
  FiXCircle,
} from 'react-icons/fi';
import type { OverviewOrderOperations } from '../../../types/overview.types';
import {
  AdminCard,
  AdminMetric,
  AdminRow,
  AdminSectionHeader,
} from '../../../../../design-system/components';

type Props = {
  data: OverviewOrderOperations;
};

export default function OrderOperations({ data }: Props) {
  return (
    <section
      className="flex w-full flex-col"
      style={{ gap: 'var(--admin-space-md)' }}
    >
      <AdminSectionHeader
        title="Order operations"
        description="Current persisted order statuses for orders created in the selected period."
      />

      <div
        className="grid grid-cols-2 lg:grid-cols-4"
        style={{ gap: 'var(--admin-space-md)' }}
      >
        <AdminMetric
          label="Pending"
          value={data.pending}
          description="Awaiting confirmation"
          icon={<FiActivity size={18} aria-hidden="true" />}
        />
        <AdminMetric
          label="Confirmed"
          value={data.confirmed}
          description="Ready for delivery"
          icon={<FiCheckCircle size={18} aria-hidden="true" />}
        />
        <AdminMetric
          label="Delivered"
          value={data.delivered}
          description="Completed orders"
          icon={<FiTruck size={18} aria-hidden="true" />}
        />
        <AdminMetric
          label="Cancelled"
          value={data.cancelled}
          description="Unable to complete"
          icon={<FiXCircle size={18} aria-hidden="true" />}
        />
      </div>

      <AdminCard borderless padding="none">
        {data.recentOrders.length === 0 ? (
          <p
            style={{
              padding: 'var(--admin-space-lg) var(--admin-space-md)',
              textAlign: 'center',
              fontSize: 'var(--admin-size-supporting)',
              color: 'var(--admin-text-tertiary)',
              margin: 0,
            }}
          >
            No orders in this period.
          </p>
        ) : (
          <div>
            {data.recentOrders.map((order, index) => {
              const dateLabel = new Date(order.created_at).toLocaleDateString(
                'en-ZA',
                { timeZone: 'Africa/Johannesburg' },
              );
              const storeLabel =
                order.storefront === 'yotaabo' ? 'Yotaabo' : 'Poshies';

              return (
                <AdminRow
                  key={order.id}
                  columns="minmax(0, 1fr) auto"
                  border={index > 0}
                >
                  <div
                    className="min-w-0"
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '2px',
                    }}
                  >
                    <p
                      style={{
                        fontSize: 'var(--admin-size-body)',
                        fontWeight: 'var(--admin-weight-medium)',
                        color: 'var(--admin-text-primary)',
                        margin: 0,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {order.order_number}
                    </p>
                    <p
                      style={{
                        fontSize: 'var(--admin-size-micro)',
                        color: 'var(--admin-text-tertiary)',
                        margin: 0,
                      }}
                    >
                      {storeLabel} · {dateLabel}
                    </p>
                  </div>

                  <span
                    style={{
                      flexShrink: 0,
                      fontSize: 'var(--admin-size-micro)',
                      fontWeight: 'var(--admin-weight-medium)',
                      textTransform: 'capitalize',
                      color: 'var(--admin-text-secondary)',
                    }}
                  >
                    {order.status}
                  </span>
                </AdminRow>
              );
            })}
          </div>
        )}
      </AdminCard>
    </section>
  );
}
