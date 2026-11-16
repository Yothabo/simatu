import { AdminButton } from '../../../../../design-system/components';
import type { CategoryFilter, Storefront } from '../../../types/admin.types';
import { getVisibleCategories } from '../utils';

type Props = {
  storefrontFilter: 'all' | Storefront;
  categoryFilter: CategoryFilter;
  onCategoryChange: (value: CategoryFilter) => void;
};

export default function ProductsCategoryFilter({
  storefrontFilter,
  categoryFilter,
  onCategoryChange,
}: Props) {
  const visibleCategories = getVisibleCategories(storefrontFilter);

  return (
    <div
      className="flex w-full"
      role="group"
      aria-label="Filter products by category"
      style={{
        gap: 'var(--admin-space-xs)',
        flexWrap: 'nowrap',
      }}
    >
      {visibleCategories.map((category) => {
        const isActive = categoryFilter === category;
        return (
          <div
            key={category}
            style={{ flex: '1 1 0', minWidth: 0 }}
          >
            <AdminButton
              variant={isActive ? 'primary' : 'neutral'}
              shape="pill"
              ariaLabel={`Filter: ${category}`}
              ariaCurrent={isActive ? 'page' : undefined}
              onClick={() => onCategoryChange(category)}
              fullWidth
              style={{
                minWidth: 0,
                fontSize: 'clamp(10px, 2.5vw, 14px)',
                paddingInline: 0,
              }}
            >
              {category}
            </AdminButton>
          </div>
        );
      })}
    </div>
  );
}
