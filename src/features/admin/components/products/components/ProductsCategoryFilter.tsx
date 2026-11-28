import { AdminButton } from '../../../../../design-system/components';
import type { CategoryFilter } from '../../../types/admin.types';
import { getVisibleCategories } from '../utils';

type Props = {
  availableCategories: string[];
  categoryFilter: CategoryFilter;
  onCategoryChange: (value: CategoryFilter) => void;
};

export default function ProductsCategoryFilter({
  availableCategories,
  categoryFilter,
  onCategoryChange,
}: Props) {
  const visibleCategories = getVisibleCategories(availableCategories);

  return (
    <div
      className="flex w-full"
      role="group"
      aria-label="Filter products by category"
      style={{
        gap: 'var(--admin-space-xs)',
        flexWrap: 'nowrap',
        overflowX: 'auto',
        paddingBottom: 4,
      }}
    >
      {visibleCategories.map((category) => {
        const isActive = categoryFilter === category;
        return (
          <div
            key={category}
            style={{ flex: '0 0 auto', minWidth: 84 }}
          >
            <AdminButton
              variant={isActive ? 'primary' : 'neutral'}
              shape="pill"
              ariaLabel={`Filter: ${category}`}
              ariaCurrent={isActive ? 'page' : undefined}
              onClick={() => onCategoryChange(category)}
              fullWidth
              style={{
                minWidth: 84,
                fontSize: 'clamp(10px, 2.5vw, 14px)',
                paddingInline: 10,
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
