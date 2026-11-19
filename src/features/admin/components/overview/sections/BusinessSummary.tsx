import {
  FiShoppingBag,
  FiClock,
  FiPackage,
  FiCheckCircle,
  FiEyeOff,
} from 'react-icons/fi';
import type { OverviewBusinessSummary } from '../../../types/overview.types';
import {
  AdminMetric,
  AdminSectionHeader,
} from '../../../../../design-system/components';

type Props = {
  data: OverviewBusinessSummary;
};

export default function BusinessSummary({ data }: Props) {
  return (
    <section
      className="flex w-full flex-col"
      style={{ gap: 'var(--admin-space-md)' }}
    >
      <AdminSectionHeader
        title="Business summary"
        description="Current catalogue and order workload."
      />

      <div
        className="grid grid-cols-2 lg:grid-cols-5"
        style={{ gap: 'var(--admin-space-md)' }}
      >
        <AdminMetric
          label="Orders received"
          value={data.ordersReceived}
          description="Non-cancelled orders in period"
          icon={<FiShoppingBag size={18} aria-hidden="true" />}
        />
        <AdminMetric
          label="Outstanding"
          value={data.outstandingOrders}
          description="Pending and confirmed orders"
          icon={<FiClock size={18} aria-hidden="true" />}
        />
        <AdminMetric
          label="Total products"
          value={data.totalProducts}
          description="Current catalogue"
          icon={<FiPackage size={18} aria-hidden="true" />}
        />
        <AdminMetric
          label="Active products"
          value={data.activeProducts}
          description="Visible on storefront"
          icon={<FiCheckCircle size={18} aria-hidden="true" />}
        />
        <AdminMetric
          label="Hidden products"
          value={data.hiddenProducts}
          description="Not visible to customers"
          icon={<FiEyeOff size={18} aria-hidden="true" />}
        />
      </div>
    </section>
  );
}
