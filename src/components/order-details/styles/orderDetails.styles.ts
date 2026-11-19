export const LABEL_STYLE = {
  fontSize: 'var(--admin-size-micro)',
  fontWeight: 'var(--admin-weight-medium)' as const,
  color: 'var(--admin-text-faint)',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.08em',
  lineHeight: 1.2,
  display: 'block',
  marginBottom: 'var(--admin-space-xxs)',
};

export const SMALL_VALUE = {
  fontSize: 'var(--admin-size-body)',
  fontWeight: 'var(--admin-weight-medium)' as const,
  color: 'var(--admin-text-primary)',
  lineHeight: 1.4,
};

export const STATUS_LABELS = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
} as const;
