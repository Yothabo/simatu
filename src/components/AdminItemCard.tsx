import type * as React from 'react';

type AdminItemCardProps = {
  title: string;
  status: string;
  price: string;
  meta: string;
  onClick: () => void;
  ariaLabel: string;
  layout?: 'default' | 'product';
  leftContent?: React.ReactNode;
  leftClassName?: string;
  statusClassName?: string;
  className?: string;
};

export default function AdminItemCard({
  title,
  status,
  price,
  meta,
  onClick,
  layout = 'default',
  ariaLabel,
  leftContent,
  leftClassName = '',
  statusClassName,
  className = '',
}: AdminItemCardProps) {
  const statusColor = statusClassName ?? 'var(--admin-text-tertiary)';

  return (
    <div
      onClick={onClick}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onClick();
        }
      }}
      role="button"
      tabIndex={0}
      aria-label={ariaLabel}
      className={`flex cursor-pointer items-stretch overflow-hidden ${className}`}
      style={{
        WebkitTapHighlightColor: 'transparent',
        borderRadius: 'var(--ds-radius-lg)',
        border: '1px solid var(--admin-border-subtle)',
        backgroundColor: 'var(--admin-surface)',
        transition: 'background-color 150ms ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = 'var(--admin-surface-subtle)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'var(--admin-surface)';
      }}
    >
      <div
        className={`relative shrink-0 overflow-hidden ${leftClassName}`}
        style={{
          width: '96px',
          height: '96px',
          borderRight: '1px solid var(--admin-border-subtle)',
        }}
      >
        {leftContent}
      </div>

      <div
        className="flex min-w-0 flex-1 flex-col justify-center"
        style={{
          padding: 'var(--admin-space-sm) var(--admin-space-md)',
          gap: 'var(--admin-space-xs)',
        }}
      >
        {layout === 'product' ? (
          <>
            <div
              className="flex items-center justify-between"
              style={{ gap: 'var(--admin-space-xs)' }}
            >
              <span
                style={{
                  fontSize: 'var(--admin-size-body)',
                  fontWeight: 'var(--admin-weight-semibold)',
                  color: 'var(--admin-text-primary)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  minWidth: 0,
                }}
              >
                {title}
              </span>
              <span
                style={{
                  fontSize: 'var(--admin-size-body)',
                  fontWeight: 'var(--admin-weight-semibold)',
                  color: 'var(--admin-text-primary)',
                  fontVariantNumeric: 'tabular-nums',
                  flexShrink: 0,
                }}
              >
                {price}
              </span>
            </div>
            <div
              className="flex items-center justify-between"
              style={{ gap: 'var(--admin-space-xs)' }}
            >
              <span
                style={{
                  fontSize: 'var(--admin-size-micro)',
                  fontWeight: 'var(--admin-weight-medium)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  color: statusColor,
                }}
              >
                {status}
              </span>
              <span
                style={{
                  fontSize: 'var(--admin-size-micro)',
                  color: 'var(--admin-text-tertiary)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  textAlign: 'right',
                }}
              >
                {meta}
              </span>
            </div>
          </>
        ) : (
          <>
            <div
              className="flex items-center justify-between"
              style={{ gap: 'var(--admin-space-xs)' }}
            >
              <span
                style={{
                  fontSize: 'var(--admin-size-body)',
                  fontWeight: 'var(--admin-weight-semibold)',
                  color: 'var(--admin-text-primary)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  minWidth: 0,
                }}
              >
                {title}
              </span>
              <span
                style={{
                  fontSize: 'var(--admin-size-micro)',
                  fontWeight: 'var(--admin-weight-medium)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  color: statusColor,
                  flexShrink: 0,
                }}
              >
                {status}
              </span>
            </div>
            <div
              className="flex items-center justify-between"
              style={{ gap: 'var(--admin-space-xs)' }}
            >
              <span
                style={{
                  fontSize: 'var(--admin-size-supporting)',
                  color: 'var(--admin-text-secondary)',
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {price}
              </span>
              <span
                style={{
                  fontSize: 'var(--admin-size-micro)',
                  color: 'var(--admin-text-tertiary)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  textAlign: 'right',
                }}
              >
                {meta}
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
