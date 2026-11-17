import { FiActivity, FiArrowUpRight, FiList, FiPackage, FiShoppingBag } from 'react-icons/fi';
import type { AdminActivity } from '../hooks/adminActivity.types';

type RecentActivityProps = {
  activities: AdminActivity[];
  isLoading: boolean;
  onViewAll: () => void;
};

export default function RecentActivityList({ activities, isLoading, onViewAll }: RecentActivityProps) {
  
  const getActivityDescription = (activity: AdminActivity) => {
    const metadata = activity.metadata ?? {};
    const productName = typeof metadata.product_name === 'string' ? metadata.product_name.trim() : '';
    const rawOrderNumber = typeof metadata.order_number === 'string' ? metadata.order_number.trim() : '';
    const orderNumber = rawOrderNumber.replace(/^#+/, '');

    if (activity.event_type === 'product.created' && productName) return `${productName} added`;
    if (activity.event_type === 'order.received' && orderNumber) return `Order #${orderNumber} received`;
    return activity.description.replace(/^(Order)\s*#+/i, '$1 #');
  };

  return (
    <section className="flex h-full min-w-0 flex-col rounded-ds-xl border border-design-border-secondary bg-design-surface p-ds-4 shadow-ds-xs sm:p-ds-5">
      <div className="mb-ds-3 flex items-center justify-between gap-ds-3">
        <div className="flex items-center gap-ds-2">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-ds-md bg-design-surface-secondary text-design-icon-primary">
            <FiActivity size={18} aria-hidden="true" />
          </span>
          <div className="flex flex-col gap-0">
            <h2 className="admin-font-heading text-ds-heading-3 text-design-text-primary">
              Recent activity
            </h2>
            <p className="admin-font-body text-ds-caption text-design-text-secondary">
              Latest store updates
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onViewAll}
          className="inline-flex min-h-9 shrink-0 items-center gap-ds-1 rounded-ds-md px-ds-2 text-ds-caption font-medium text-design-text-accent transition-colors hover:bg-design-surface-secondary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-design-focus-ring motion-reduce:transition-none"
        >
          View all
          <FiArrowUpRight size={15} aria-hidden="true" />
        </button>
      </div>

      <div className="flex flex-1 flex-col" aria-busy={isLoading && activities.length === 0}>
        {isLoading && activities.length === 0 ? (
          <div role="status" className="flex flex-1 items-center justify-center py-ds-8 text-ds-body-sm text-design-text-secondary">
            Loading recent activity...
          </div>
        ) : activities.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-ds-2 rounded-ds-md bg-design-surface-secondary px-ds-4 py-ds-6 text-center">
            <FiList size={22} className="text-design-icon-secondary" aria-hidden="true" />
            <p className="admin-font-body text-ds-body-sm text-design-text-primary">No activity to show yet</p>
            <p className="admin-font-body text-ds-caption text-design-text-secondary">Product and order updates will appear here.</p>
          </div>
        ) : (
          <ul className="flex flex-col">
            {activities.slice(0, 4).map((activity, index) => (
              <li
                key={activity.id}
                className={`flex items-center gap-ds-3 py-ds-3 ${index > 0 ? 'border-t border-design-border-secondary' : ''}`}
              >
                <span className="flex size-9 shrink-0 items-center justify-center rounded-ds-md bg-design-surface-secondary text-design-icon-secondary">
                  {activity.entity_type === 'product' ? <FiPackage size={16} /> : <FiShoppingBag size={16} />}
                </span>

                <div className="flex min-w-0 flex-1 flex-col gap-0">
                  <p className="admin-font-body text-ds-body-sm text-design-text-primary truncate">
                    {getActivityDescription(activity)}
                  </p>
                  <p className="admin-font-body text-ds-caption text-design-text-secondary">
                    {activity.entity_type === 'product' ? 'Product activity' : 'Order activity'}
                  </p>
                </div>

                <time
                  dateTime={activity.created_at}
                  className="shrink-0 text-right text-ds-caption tabular-nums text-design-text-tertiary"
                >
                  {new Date(activity.created_at).toLocaleString('en-ZA', {
                    day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
                  })}
                </time>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
