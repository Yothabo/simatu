import type { OverviewStorePerformance } from '../../../types/overview.types';
import { formatOverviewCurrency } from '../../../utils/overview/currency';
import { getCategoryTheme } from '../../../../../systems/storefront/core/configuration/categoryTheme';
import {
  AdminCard,
  AdminMetric,
  AdminSectionHeader,
} from '../../../../../design-system/components';

type Props = {
  data: OverviewStorePerformance[];
};

export default function StoreComparison({ data }: Props) {
  if (data.length < 2) return null;

  return (
    <section
      className="flex w-full flex-col"
      style={{ gap: 'var(--admin-space-md)' }}
    >
      <AdminSectionHeader
        title="Store comparison"
        description="Same date range and delivered-order definitions for both storefronts."
      />

      <div
        className="grid grid-cols-1 md:grid-cols-2"
        style={{ gap: 'var(--admin-space-md)' }}
      >
        {data.map((store) => {
          const storeLabel =
            store.storefront === 'yotaabo' ? 'Yotaabo' : 'Poshies';
          const storeColor =
            store.storefront === 'yotaabo'
              ? getCategoryTheme('His').hexColor
              : getCategoryTheme('Hers').hexColor;

          return (
            <AdminCard
              key={store.storefront}
              padding="none"
              borderless
              transparent
            >
              <div
                style={{
                  width: '100%',
                  backgroundColor: storeColor,
                  paddingInline: 'var(--admin-space-md)',
                  paddingBlock: 'var(--admin-space-sm)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-start',
                  borderRadius: 'var(--ds-radius-lg)',
                }}
              >
                <h3
                  style={{
                    fontSize: 'var(--admin-size-body)',
                    fontWeight: 'var(--admin-weight-semibold)',
                    color: 'var(--admin-on-accent)',
                    margin: 0,
                    lineHeight: 1.2,
                  }}
                >
                  {storeLabel} storefront
                </h3>
              </div>

              <div
                className="grid grid-cols-2"
                style={{
                  padding: 'var(--admin-space-md)',
                  gap: 'var(--admin-space-lg)',
                }}
              >
                <AdminMetric
                  transparent
                  label="Orders received"
                  value={store.orders}
                  size="sm"
                />
                <AdminMetric
                  transparent
                  label="Delivered orders"
                  value={store.deliveredOrders}
                  size="sm"
                />
                <AdminMetric
                  transparent
                  label="Recorded sales"
                  value={formatOverviewCurrency(store.recordedSalesValue)}
                  size="sm"
                />
                <AdminMetric
                  transparent
                  label="Units sold"
                  value={store.unitsSold}
                  size="sm"
                />
              </div>
            </AdminCard>
          );
        })}
      </div>
    </section>
  );
}
