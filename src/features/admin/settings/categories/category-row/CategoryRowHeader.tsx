import { FiEdit2, FiEye, FiEyeOff } from 'react-icons/fi';
import AccentButton from '../../../components/AccentButton';
import { ICON_BTN_STYLE, ROW_STYLE, CATEGORY_GRID } from './categoryRow.styles';
import CategorySortMenu from './CategorySortMenu';
import type { CategoryRowHeaderProps } from './types';

export default function CategoryRowHeader({
  category,
  groupPosition,
  groupSize,
  onMoveToPosition,
  onEditCategory,
  onRequestToggle,
}: CategoryRowHeaderProps) {
  return (
    <div
      className="admin-category-header border-b border-[var(--admin-border-subtle)]"
      style={{
        ...ROW_STYLE,
        gridTemplateColumns: CATEGORY_GRID,
      }}
    >
      <div
        className="flex items-center"
        style={{ gap: 'var(--admin-space-sm)', minWidth: 0 }}
      >
        <span
          style={{
            fontSize: 'var(--admin-size-body)',
            fontWeight: 'var(--admin-weight-medium)',
            color: 'var(--admin-text-primary)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            textDecoration: category.is_active ? 'none' : 'line-through',
          }}
        >
          {category.name}
        </span>
      </div>

      <div
        className="flex items-center justify-end"
        style={{ gap: 'var(--admin-space-xs)' }}
      >
        <CategorySortMenu
          category={category}
          groupPosition={groupPosition}
          groupSize={groupSize}
          onMoveToPosition={onMoveToPosition}
        />

        <AccentButton
          variant="neutral"
          shape="circle"
          onClick={() => onEditCategory(category)}
          ariaLabel={`Edit ${category.name}`}
          style={ICON_BTN_STYLE}
        >
          <FiEdit2 size={14} aria-hidden="true" />
        </AccentButton>

        <AccentButton
          variant="neutral"
          shape="circle"
          onClick={onRequestToggle}
          ariaLabel={`${category.is_active ? 'Hide' : 'Show'} ${category.name}`}
          style={ICON_BTN_STYLE}
        >
          {category.is_active ? (
            <FiEyeOff size={14} aria-hidden="true" />
          ) : (
            <FiEye size={14} aria-hidden="true" />
          )}
        </AccentButton>
      </div>
    </div>
  );
}
