import { FiArrowUpRight } from 'react-icons/fi';
import type { AdminActivity } from '../../../hooks/useAdminActivity';

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
        new Date(a.created_at).getTime()
    )
    .slice(0, 4);

  return (
    <section className="w-full" aria-labelledby="overview-recent-activity-title">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2
            id="overview-recent-activity-title"
            className="admin-section-header-title admin-type-page-title text-[#4d4d4d]"
          >
            Recent Activities
          </h2>
          <p className="mt-1 text-xs text-[#4d4d4d]/65">
            Latest store updates
          </p>
        </div>

        <button
          type="button"
          onClick={onViewAll}
          className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-[#4d4d4d] transition-opacity hover:opacity-65"
        >
          View all
          <FiArrowUpRight size={15} aria-hidden="true" />
        </button>
      </div>

      {isLoading && recentActivities.length === 0 ? (
        <p className="px-4 py-8 text-sm text-[#4d4d4d]/50">
          Loading activities...
        </p>
      ) : recentActivities.length === 0 ? (
        <p className="px-4 py-8 text-sm text-[#4d4d4d]/50">
          No activities found.
        </p>
      ) : (
        <div className="space-y-2">
          {recentActivities.map((activity) => (
            <article
              key={activity.id}
              className="flex items-center justify-between gap-3 rounded-[5px] border border-[#4d4d4d]/[0.10] bg-[#f5f5f5] px-4 py-2.5 shadow-[0_1px_3px_rgba(0,0,0,0.035)]"
            >
              <p className="min-w-0 text-sm leading-relaxed text-[#4d4d4d]/45">
                {getDescription(activity)}
              </p>

              <time
                dateTime={activity.created_at}
                className="shrink-0 whitespace-nowrap text-right text-xs text-[#4d4d4d]/45"
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
