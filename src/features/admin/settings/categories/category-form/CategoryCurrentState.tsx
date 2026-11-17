import type { CategoryCurrentStateProps } from './types';

export default function CategoryCurrentState({
  category,
}: CategoryCurrentStateProps) {
  return (
    <div
      style={{
        padding: 'var(--admin-space-sm)',
        marginBottom: 'var(--admin-space-md)',
        borderRadius: 'var(--ds-radius-lg)',
        borderWidth: '1px',
        borderStyle: 'dashed',
        borderColor: 'var(--admin-border-strong)',
        backgroundColor: 'var(--admin-surface-subtle)',
      }}
    >
      <div
        style={{
          fontSize: 'var(--admin-size-micro)',
          fontWeight: 'var(--admin-weight-semibold)',
          color: 'var(--admin-text-secondary)',
          marginBottom: 'var(--admin-space-xxs)',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
        }}
      >
        Currently on storefront
      </div>

      <div
        style={{
          fontSize: 'var(--admin-size-body)',
          color: 'var(--admin-text-primary)',
          fontWeight: 'var(--admin-weight-medium)',
        }}
      >
        {category.name}
      </div>

      <div
        style={{
          fontSize: 'var(--admin-size-caption)',
          color: 'var(--admin-text-tertiary)',
          marginTop: '2px',
        }}
      >
        {category.subcategories.length} subcategor
        {category.subcategories.length === 1 ? 'y' : 'ies'} · Order{' '}
        {category.sort_order}
      </div>
    </div>
  );
}
