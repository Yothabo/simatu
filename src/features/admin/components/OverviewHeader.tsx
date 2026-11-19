import { FiPlus } from 'react-icons/fi';
import { getCategoryTheme } from '../../../systems/storefront/core/configuration/categoryTheme';
import AccentButton from './AccentButton';
import TimeRangePicker from './TimeRangePicker';
import type { TimeRange } from '../types/admin.types';

type OverviewHeaderProps = {
  email: string;
  onAddProduct: () => void;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onSearchFocus: () => void;
  onFilterSelect?: (filterId: string) => void;
  activeFilter?: string;
  timeRange?: TimeRange;
  onTimeRangeChange?: (value: TimeRange) => void;
};

export default function OverviewHeader({
  email,
  onAddProduct,
  onFilterSelect,
  activeFilter = 'all',
  timeRange = 'this-year',
  onTimeRangeChange,
}: OverviewHeaderProps) {
  const rawName = email.split('@')[0] || email;
  const name = rawName.charAt(0).toUpperCase() + rawName.slice(1);

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  const storeFilters: { id: string; label: string; category: string | null }[] = [
    { id: 'yotaabo', label: 'Yotaabo', category: 'His' },
    { id: 'poshies', label: 'Poshies', category: 'Hers' },
    { id: 'all', label: 'All', category: null },
  ];

  return (
    <header
      className="flex w-full flex-col"
      style={{ gap: 'var(--admin-space-xl)' }}
    >
      <h1
        style={{
          fontSize: 'var(--admin-greeting-size)',
          lineHeight: 'var(--admin-greeting-line)',
          fontWeight: 'var(--admin-greeting-weight)',
          color: 'var(--admin-border-strong)',
          margin: 0,
          whiteSpace: 'nowrap',
        }}
      >
        {greeting},{' '}
        <span
          style={{
            color: 'var(--admin-text-primary)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: 'inline-block',
            maxWidth: '100%',
            verticalAlign: 'bottom',
          }}
        >
          {name}
        </span>
      </h1>

      <div
        className="admin-filter-row flex w-full items-center"
        style={{
          gap: 'var(--admin-space-xs)',
          justifyContent: 'flex-end',
          flexWrap: 'wrap',
        }}
      >
        {onTimeRangeChange && (
          <TimeRangePicker value={timeRange} onChange={onTimeRangeChange} />
        )}
        <div className="admin-segmented admin-filter-segmented">
          {storeFilters.map((filter, index) => {
            const isActive = activeFilter === filter.id;
            const isAll = filter.category === null;
            const theme = filter.category === null
              ? null
              : getCategoryTheme(filter.category);
            const isFirst = index === 0;
            const isLast = index === storeFilters.length - 1;
            const edgeClass = isFirst
              ? 'admin-segmented-left'
              : isLast
                ? 'admin-segmented-right'
                : '';
            return (
              <AccentButton
                key={filter.id}
                variant={isActive ? 'active' : 'neutral'}
                shape="pill"
                onClick={() => onFilterSelect?.(filter.id)}
                ariaLabel={`Filter: ${filter.label}`}
                ariaCurrent={isActive ? 'true' : undefined}
                storeColor={theme?.hexColor}
                activeColor={theme?.hexColor ?? 'var(--admin-accent)'}
                className={edgeClass}
                style={{ borderRadius: 0 }}
              >
                {filter.label}
              </AccentButton>
            );
          })}
        </div>

        <AccentButton
          variant="dark"
          shape="circle"
          ariaLabel="Add product"
          onClick={onAddProduct}
        >
          <FiPlus size={18} aria-hidden="true" />
        </AccentButton>
      </div>
    </header>
  );
}
