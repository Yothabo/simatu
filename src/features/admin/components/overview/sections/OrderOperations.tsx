import type { OverviewOrderOperations } from '../../../types/overview.types';
import OverviewMetric from '../shared/OverviewMetric';
import OverviewSection from '../shared/OverviewSection';

type Props = {
  data: OverviewOrderOperations;
};

export default function OrderOperations({ data }: Props) {
  return (
    <OverviewSection
      title="Order operations"
      description="Current persisted order statuses for orders created in the selected period."
    >
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <OverviewMetric label="Pending" value={data.pending} />
        <OverviewMetric label="Confirmed" value={data.confirmed} />
        <OverviewMetric label="Delivered" value={data.delivered} />
        <OverviewMetric label="Cancelled" value={data.cancelled} />
      </div>

      <div
        className="flex flex-col rounded-xl border p-4"
        style={{
          borderColor: 'var(--admin-border-subtle)',
          borderRadius: 'var(--admin-radius-lg, 12px)',
          background: 'var(--admin-surface)',
          gap: 'var(--admin-space-md)',
        }}
      >
        {data.recentOrders.length === 0 ? (
          <p className="py-6 text-center text-sm overview-text-muted">
            No orders in this period.
          </p>
        ) : (
          <div className="divide-y divide-neutral-200">
            {data.recentOrders.map((order) => (
              <div
                key={order.id}
                className="flex items-center justify-between gap-3 py-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">
                    {order.order_number}
                  </p>
                  <p className="text-xs overview-text-muted">
                    {order.storefront === 'yotaabo' ? 'Yotaabo' : 'Poshies'}
                    {' · '}
                    {new Date(order.created_at).toLocaleDateString('en-ZA', {
                      timeZone: 'Africa/Johannesburg',
                    })}
                  </p>
                </div>

                <span className="shrink-0 text-xs capitalize overview-text-secondary">
                  {order.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </OverviewSection>
  );
}
