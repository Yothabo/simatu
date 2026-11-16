import { FiArrowUpRight } from 'react-icons/fi';
import type { AdminActivity } from '../../../hooks/useAdminActivity';
import {
  AdminButton,
  AdminSectionHeader,
} from '../../../../../design-system/components';

type Props = {
  activities: AdminActivity[];
  isLoading: boolean;
  onViewAll: () => void;
};

function getDescription(activity: AdminActivity): string {
  const metadata = activity.metadata ?? {};

  const productName =
    typeof metadata.product_name === 'string'
      ? metadata.product_name.trim()
      : '';

  const rawOrderNumber =
    typeof metadata.order_number === 'string'
      ? metadata.order_number.trim()
      : '';

  const orderNumber = rawOrderNumber.replace(/^#+/, '');

  if (activity.event_type === 'product.created' && productName) {
    return `${productName} added`;
  }

  if (activity.event_type === 'order.received' && orderNumber) {
    return `Order #${orderNumber} received`;
  }

  return activity.description.replace(/^(Order)\s*#+/i, '$1 #');
}

function formatActivityDate(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'Unknown date';
  }

  return date.toLocaleString('en-ZA', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function RecentActivity({
  activities,
  isLoading,
  onViewAll,
}: Props) {
  const recentActivities = [...activities]
    .filter((activity) => Number.isFinite(Date.parse(activity.created_at)))
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() -
        new Date(a.created_at).getTime(),
    )
    .slice(0, 10);

  return (
    <section
      className="flex w-full flex-col"
      style={{ gap: 'var(--admin-space-md)' }}
    >
      <AdminSectionHeader
        title="Recent activities"
        description="Latest store updates"
        action={
          <AdminButton
            variant="neutral"
            shape="pill"
            ariaLabel="View all activities"
            onClick={onViewAll}
          >
            <span>View all</span>
            <FiArrowUpRight size={14} aria-hidden="true" />
          </AdminButton>
        }
      />

      {isLoading && recentActivities.length === 0 ? (
        <p
          style={{
            padding: 'var(--admin-space-lg) var(--admin-space-md)',
            textAlign: 'center',
            fontSize: 'var(--admin-size-supporting)',
            color: 'var(--admin-text-tertiary)',
            margin: 0,
          }}
        >
          Loading activities...
        </p>
      ) : recentActivities.length === 0 ? (
        <p
          style={{
            padding: 'var(--admin-space-lg) var(--admin-space-md)',
            textAlign: 'center',
            fontSize: 'var(--admin-size-supporting)',
            color: 'var(--admin-text-tertiary)',
            margin: 0,
          }}
        >
          No activities found.
        </p>
      ) : (
        <div
          className="flex flex-col"
          style={{ gap: 'var(--admin-space-xs)' }}
        >
          {recentActivities.map((activity) => (
            <article
              key={activity.id}
              className="flex items-center justify-between"
              style={{
                padding: 'var(--admin-space-sm) var(--admin-space-md)',
                gap: 'var(--admin-space-md)',
                borderRadius: 'var(--ds-radius-lg)',
                backgroundColor: 'var(--admin-surface)',
              }}
            >
              <p
                style={{
                  minWidth: 0,
                  margin: 0,
                  fontSize: 'var(--admin-size-body)',
                  color: 'var(--admin-text-primary)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {getDescription(activity)}
              </p>

              <time
                dateTime={activity.created_at}
                style={{
                  flexShrink: 0,
                  whiteSpace: 'nowrap',
                  textAlign: 'right',
                  fontSize: 'var(--admin-size-micro)',
                  color: 'var(--admin-text-tertiary)',
                }}
              >
                {formatActivityDate(activity.created_at)}
              </time>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
