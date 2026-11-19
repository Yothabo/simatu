import { ROW_STYLE, SUBCATEGORY_GRID } from './categoryRow.styles';
import type { Category } from '../types';

type CategorySubcategoryListProps = {
  subcategories: Category['subcategories'];
};

export default function CategorySubcategoryList({
  subcategories,
}: CategorySubcategoryListProps) {
  if (subcategories.length === 0) return null;

  return (
    <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
      {subcategories.map((subcategory, index) => (
        <li
          key={subcategory.id}
          style={{
            borderTop:
              index > 0
                ? '1px solid var(--admin-border-subtle)'
                : 'none',
          }}
        >
          <div
            style={{
              ...ROW_STYLE,
              gridTemplateColumns: SUBCATEGORY_GRID,
            }}
          >
            <span
              style={{
                fontSize: 'var(--admin-size-body)',
                color: 'var(--admin-text-primary)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                paddingLeft: 'var(--admin-space-md)',
              }}
            >
              {subcategory.name}
            </span>

            <div
              className="flex items-center"
              style={{ gap: 'var(--admin-space-xs)' }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}
