export const INPUT_STYLE = {
  width: '100%',
  paddingInline: 'var(--admin-space-sm)',
  paddingBlock: 'var(--admin-space-xs)',
  borderRadius: 'var(--ds-radius-lg)',
  borderWidth: '1px',
  borderStyle: 'solid',
  borderColor: 'var(--admin-border-strong)',
  backgroundColor: 'var(--admin-surface-subtle)',
  color: 'var(--admin-text-primary)',
  fontSize: 'var(--admin-size-body)',
  outline: 'none',
  transition: 'border-color 150ms ease, box-shadow 150ms ease',
} as const;

export const LABEL_STYLE = {
  fontSize: 'var(--admin-size-micro)',
  fontWeight: 'var(--admin-weight-medium)',
  color: 'var(--admin-text-secondary)',
  display: 'block',
  marginBottom: 'var(--admin-space-xxs)',
} as const;
