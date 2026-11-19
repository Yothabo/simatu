import type { Order, AdminRow } from '../types/admin.types';
import RevenueChart from './RevenueChart';
import { useRevenueSeries } from '../hooks/useRevenueSeries';
import { getCategoryTheme } from '../../../systems/storefront/core/configuration/categoryTheme';

type StorePerformanceCardProps = {
  orders?: Order[];
  products?: AdminRow[];
  activeFilter?: string;
};

export default function StorePerformanceCard({
  orders = [],
  products = [],
  activeFilter = 'all',
}: StorePerformanceCardProps) {
  const series = useRevenueSeries({ orders, products, activeFilter });

  const accentColor =
    activeFilter === 'yotaabo'
      ? getCategoryTheme('His').hexColor
      : activeFilter === 'poshies'
        ? getCategoryTheme('Hers').hexColor
        : 'var(--admin-accent)';

  return (
    <section
      className="admin-card-bg relative flex w-full flex-col"
      style={{
        minHeight: 'var(--admin-card-min-height)',
        borderRadius: 'var(--ds-radius-xl)',
        borderWidth: '1px',
        borderStyle: 'solid',
        borderColor: 'var(--admin-border-strong)',
        backgroundColor: 'var(--admin-surface)',
        backgroundImage: [
          'linear-gradient(to bottom, var(--admin-surface) 0%, transparent 25%)',
          'linear-gradient(to top, var(--admin-surface) 0%, transparent 25%)',
          'linear-gradient(to right, color-mix(in srgb, var(--admin-border-strong) 8%, transparent) 1px, transparent 1px)',
          'linear-gradient(to bottom, color-mix(in srgb, var(--admin-border-strong) 8%, transparent) 1px, transparent 1px)',
        ].join(','),
        backgroundSize: [
          '100% 100%',
          '100% 100%',
          'var(--admin-card-grid-size) var(--admin-card-grid-size)',
          'var(--admin-card-grid-size) var(--admin-card-grid-size)',
        ].join(','),
        backgroundRepeat: 'no-repeat, no-repeat, repeat, repeat',
        overflow: 'hidden',
      }}
    >
      <div
        className="flex w-full items-center justify-between"
        style={{ padding: 'var(--admin-space-md)' }}
      >
        <div className="flex flex-col">
          <span
            style={{
              fontSize: 'var(--admin-size-supporting)',
              fontWeight: 'var(--admin-weight-normal)',
              color: 'var(--admin-text-secondary)',
              lineHeight: 1,
            }}
          >
            Revenue
          </span>
          <span
            className="flex items-baseline"
            style={{ gap: 'var(--admin-space-xs)', marginTop: 'var(--admin-space-md)' }}
          >
            <span
              style={{
                fontSize: 'var(--admin-size-body)',
                fontWeight: 'var(--admin-weight-medium)',
                color: 'var(--admin-text-secondary)',
                lineHeight: 1,
              }}
            >
              R
            </span>
            <span
              style={{
                fontSize: 'var(--admin-size-section-title)',
                fontWeight: 'var(--admin-weight-semibold)',
                color: 'var(--admin-text-primary)',
                lineHeight: 1,
              }}
            >
              0.00
            </span>
          </span>
        </div>
      </div>

      <RevenueChart series={series} activeFilter={activeFilter} />
    </section>
  );
}
