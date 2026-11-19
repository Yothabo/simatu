export const HEADER_CELL = {
  padding: 'var(--admin-space-sm) var(--admin-space-md)',
  fontSize: 'var(--admin-size-micro)',
  fontWeight: 'var(--admin-weight-semibold)' as const,
  textTransform: 'uppercase' as const,
  letterSpacing: '0.08em',
  color: 'var(--admin-text-tertiary)',
} as const;

export const CELL = {
  padding: 'var(--admin-space-sm) var(--admin-space-md)',
} as const;
