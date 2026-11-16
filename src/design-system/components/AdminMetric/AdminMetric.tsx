import type { ReactNode } from 'react';
import AdminText from '../AdminText/AdminText';

type AdminMetricProps = {
  label: string;
  value: ReactNode;
  description?: string;
  icon?: ReactNode;
  iconColor?: string;
  loading?: boolean;
  size?: 'sm' | 'md';
  bordered?: boolean;
  transparent?: boolean;
};

export default function AdminMetric({
  label,
  value,
  description,
  icon,
  iconColor,
  loading = false,
  size = 'md',
  bordered = false,
  transparent = false,
}: AdminMetricProps) {
  return (
    <article
      className="min-w-0 flex flex-col"
      style={{
        borderRadius: 'var(--ds-radius-lg)',
        padding: 'var(--admin-space-md)',
        backgroundColor: transparent ? 'transparent' : 'var(--admin-surface)',
        ...(bordered && !transparent
          ? {
              borderWidth: '1px',
              borderStyle: 'solid',
              borderColor: 'var(--admin-border-subtle)',
            }
          : {}),
        gap: 'var(--admin-space-xs)',
      }}
    >
      <div
        className="flex items-center justify-between"
        style={{ gap: 'var(--admin-space-sm)' }}
      >
        <span
          style={{
            fontSize: 'var(--admin-size-supporting)',
            fontWeight: 'var(--admin-weight-medium)',
            color: 'var(--admin-text-secondary)',
            lineHeight: 1.3,
          }}
        >
          {label}
        </span>

        {icon && (
          <span
            aria-hidden="true"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: iconColor ?? 'var(--admin-text-secondary)',
              flexShrink: 0,
            }}
          >
            {icon}
          </span>
        )}
      </div>

      {loading ? (
        <span
          aria-hidden="true"
          style={{
            display: 'inline-block',
            height: size === 'sm' ? '20px' : '24px',
            width: '60%',
            borderRadius: 'var(--ds-radius-sm)',
            backgroundColor: 'var(--admin-surface-subtle)',
          }}
        />
      ) : (
        <span
          style={{
            fontSize:
              size === 'sm'
                ? 'var(--admin-size-card-title)'
                : 'var(--admin-size-section-title)',
            fontWeight: 'var(--admin-weight-semibold)',
            color: 'var(--admin-text-primary)',
            lineHeight: 1.2,
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {value}
        </span>
      )}

      {description && (
        <span
          style={{
            fontSize: 'var(--admin-size-fine)',
            fontWeight: 'var(--admin-weight-thin)',
            color: 'var(--admin-text-faint)',
            lineHeight: 1.5,
            marginTop: 'auto',
            textAlign: 'left',
          }}
        >
          {description}
        </span>
      )}
    </article>
  );
}
