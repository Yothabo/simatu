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

export const BIG_VALUE = {
  fontSize: '32px',
  fontWeight: 'var(--admin-weight-semibold)' as const,
  color: 'var(--admin-text-primary)',
  lineHeight: 1.05,
  fontVariantNumeric: 'tabular-nums' as const,
};

export const MID_VALUE = {
  fontSize: 'var(--admin-size-section-title)',
  fontWeight: 'var(--admin-weight-semibold)' as const,
  color: 'var(--admin-text-primary)',
  lineHeight: 1.15,
  fontVariantNumeric: 'tabular-nums' as const,
};

export const SMALL_VALUE = {
  fontSize: 'var(--admin-size-body)',
  fontWeight: 'var(--admin-weight-medium)' as const,
  color: 'var(--admin-text-primary)',
  lineHeight: 1.4,
};
