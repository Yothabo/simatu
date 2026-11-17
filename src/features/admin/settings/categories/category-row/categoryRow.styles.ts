export const ICON_BTN_STYLE = {
  width: '32px',
  height: '32px',
  minWidth: '32px',
  padding: 0,
} as const;

export const CATEGORY_GRID = 'minmax(0, 1fr) auto';
export const SUBCATEGORY_GRID = 'minmax(0, 1fr) auto';

export const ROW_STYLE = {
  display: 'grid',
  alignItems: 'center',
  padding: 'var(--admin-space-sm) var(--admin-space-md)',
  gap: 'var(--admin-space-sm)',
} as const;
