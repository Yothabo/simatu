import type { CSSProperties, KeyboardEvent, ReactNode } from 'react';

type AdminRowProps = {
  children: ReactNode;
  /** CSS grid template columns. Defaults to a single flexible column. */
  columns?: string;
  /** Draws a top border. Set to false on the first row of a list. */
  border?: boolean;
  /** Makes the row interactive (role=button, tabIndex, hover, Enter/Space). */
  onClick?: () => void;
  /** Required when onClick is set — describes the row action for screen readers. */
  ariaLabel?: string;
  className?: string;
  style?: CSSProperties;
};

const BASE_STYLE: CSSProperties = {
  display: 'grid',
  alignItems: 'center',
  padding: 'var(--admin-space-sm) var(--admin-space-md)',
  gap: 'var(--admin-space-sm)',
  transition: 'background-color 150ms ease',
};

export default function AdminRow({
  children,
  columns = 'minmax(0, 1fr)',
  border = false,
  onClick,
  ariaLabel,
  className = '',
  style,
}: AdminRowProps) {
  const isInteractive = typeof onClick === 'function';

  const resolvedStyle: CSSProperties = {
    ...BASE_STYLE,
    gridTemplateColumns: columns,
    ...(border
      ? { borderTop: '1px solid var(--admin-border-subtle)' }
      : {}),
    ...(isInteractive ? { cursor: 'pointer' } : {}),
    ...(style ?? {}),
  };

  if (!isInteractive) {
    return (
      <div
        className={`admin-ds-row ${className}`}
        style={resolvedStyle}
      >
        {children}
      </div>
    );
  }

  function handleKey(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onClick?.();
    }
  }

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={ariaLabel}
      className={`admin-ds-row admin-ds-row-interactive ${className}`}
      style={resolvedStyle}
      onClick={onClick}
      onKeyDown={handleKey}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = 'var(--admin-surface-subtle)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'transparent';
      }}
    >
      {children}
    </div>
  );
}
