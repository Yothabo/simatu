import type { CSSProperties } from 'react';
import type { AdminActionButtonProps } from './types';

const baseStyles: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 'var(--admin-space-xxs)',
  paddingBlock: 'var(--admin-space-xxs)',
  paddingInline: 'var(--admin-space-sm)',
  borderRadius: 'var(--ds-radius-lg)',
  borderWidth: '1px',
  borderStyle: 'solid',
  fontSize: 'var(--admin-size-micro)',
  fontWeight: 'var(--admin-weight-medium)',
  cursor: 'pointer',
  opacity: 1,
  transition: 'background-color 150ms ease, color 150ms ease',
  whiteSpace: 'nowrap',
};

export function DangerActionButton({
  onClick,
  disabled,
  ariaLabel,
  icon,
  children,
}: AdminActionButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      style={{
        ...baseStyles,
        borderColor: 'var(--admin-status-red)',
        backgroundColor: 'transparent',
        color: 'var(--admin-status-red)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
      }}
      onMouseEnter={(e) => {
        if (disabled) return;
        e.currentTarget.style.backgroundColor = 'var(--admin-status-red)';
        e.currentTarget.style.color = 'var(--admin-on-accent)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'transparent';
        e.currentTarget.style.color = 'var(--admin-status-red)';
      }}
    >
      {icon}
      {children}
    </button>
  );
}

export function NeutralActionButton({
  onClick,
  disabled,
  ariaLabel,
  icon,
  children,
}: AdminActionButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      style={{
        ...baseStyles,
        borderColor: 'var(--admin-border-strong)',
        backgroundColor: 'transparent',
        color: 'var(--admin-text-secondary)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
      }}
      onMouseEnter={(e) => {
        if (disabled) return;
        e.currentTarget.style.backgroundColor = 'var(--admin-surface-subtle)';
        e.currentTarget.style.color = 'var(--admin-text-primary)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'transparent';
        e.currentTarget.style.color = 'var(--admin-text-secondary)';
      }}
    >
      {icon}
      {children}
    </button>
  );
}
