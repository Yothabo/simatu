import type { CSSProperties, ReactNode } from 'react';

type AdminButtonVariant =
  | 'primary'
  | 'accent'
  | 'neutral'
  | 'ghost'
  | 'danger'
  | 'active';

type AdminButtonShape =
  | 'pill'
  | 'circle'
  | 'tab'
  | 'segment'
  | 'compact';

type AdminButtonProps = {
  children: ReactNode;
  variant?: AdminButtonVariant;
  shape?: AdminButtonShape;
  type?: 'button' | 'submit' | 'reset';
  onClick?: () => void;
  ariaLabel: string;
  ariaCurrent?: 'page' | 'true' | undefined;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  className?: string;
  style?: CSSProperties;
  /** Store accent color - used by segmented store selectors. */
  storeColor?: string;
  /** Active-state background override (used for variant="active"). */
  activeColor?: string;
};

type ShapeDims = {
  height: number | null;
  minWidth: number | string;
  paddingInline: string | number;
  radius: string;
};

const SHAPE_DIMENSIONS: Record<AdminButtonShape, ShapeDims> = {
  pill: {
    height: 44,
    minWidth: 'var(--admin-chip-width, 140px)',
    paddingInline: 'var(--admin-space-lg)',
    radius: 'var(--ds-radius-xl)',
  },
  circle: {
    height: 44,
    minWidth: 44,
    paddingInline: 0,
    radius: 'var(--ds-radius-full)',
  },
  tab: {
    height: null,
    minWidth: 0,
    paddingInline: 'var(--admin-space-xs)',
    radius: 'var(--ds-radius-lg)',
  },
  segment: {
    height: 44,
    minWidth: 44,
    paddingInline: 0,
    radius: '0px',
  },
  compact: {
    height: 32,
    minWidth: 32,
    paddingInline: 'var(--admin-space-sm)',
    radius: 'var(--ds-radius-lg)',
  },
};

type VariantTokens = {
  background: string;
  backgroundHover: string;
  border: string;
  borderHover: string;
  color: string;
  colorHover: string;
};

function getVariantTokens(
  variant: AdminButtonVariant,
  activeColor?: string,
): VariantTokens {
  switch (variant) {
    case 'primary':
      return {
        background: 'var(--admin-text-primary)',
        backgroundHover: 'var(--admin-text-primary)',
        border: 'var(--admin-text-primary)',
        borderHover: 'var(--admin-text-primary)',
        color: 'var(--admin-bg)',
        colorHover: 'var(--admin-bg)',
      };
    case 'accent':
      return {
        background: 'var(--admin-accent)',
        backgroundHover: 'var(--admin-accent-hover)',
        border: 'var(--admin-accent)',
        borderHover: 'var(--admin-accent-hover)',
        color: 'var(--admin-on-accent)',
        colorHover: 'var(--admin-on-accent)',
      };
    case 'neutral':
      return {
        background: 'var(--admin-surface)',
        backgroundHover: 'var(--admin-surface-subtle)',
        border: 'var(--admin-border-strong)',
        borderHover: 'var(--admin-border-strong)',
        color: 'var(--admin-text-secondary)',
        colorHover: 'var(--admin-text-primary)',
      };
    case 'ghost':
      return {
        background: 'transparent',
        backgroundHover: 'var(--admin-surface-subtle)',
        border: 'transparent',
        borderHover: 'transparent',
        color: 'var(--admin-text-secondary)',
        colorHover: 'var(--admin-text-primary)',
      };
    case 'danger':
      return {
        background: 'var(--admin-status-red)',
        backgroundHover: 'var(--admin-status-red)',
        border: 'var(--admin-status-red)',
        borderHover: 'var(--admin-status-red)',
        color: 'var(--admin-on-accent)',
        colorHover: 'var(--admin-on-accent)',
      };
    case 'active':
      return {
        background: activeColor ?? 'var(--admin-text-primary)',
        backgroundHover: activeColor ?? 'var(--admin-text-primary)',
        border: activeColor ?? 'var(--admin-text-primary)',
        borderHover: activeColor ?? 'var(--admin-text-primary)',
        color: 'var(--admin-on-accent)',
        colorHover: 'var(--admin-on-accent)',
      };
  }
}

const DISABLED_TOKENS = {
  background: 'var(--admin-surface-subtle)',
  border: 'var(--admin-border-subtle)',
  color: 'var(--admin-text-muted)',
};

export default function AdminButton({
  children,
  variant = 'neutral',
  shape = 'pill',
  type = 'button',
  onClick,
  ariaLabel,
  ariaCurrent,
  disabled = false,
  loading = false,
  fullWidth = false,
  className = '',
  style,
  storeColor,
  activeColor,
}: AdminButtonProps) {
  const isInert = disabled || loading;
  const dims = SHAPE_DIMENSIONS[shape];
  const tokens = getVariantTokens(variant, activeColor);

  const baseStyle: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 'var(--admin-space-xs)',
    minWidth: dims.minWidth,
    paddingInline: dims.paddingInline,
    borderRadius: dims.radius,
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: isInert ? DISABLED_TOKENS.border : tokens.border,
    backgroundColor: isInert ? DISABLED_TOKENS.background : tokens.background,
    color: isInert ? DISABLED_TOKENS.color : tokens.color,
    fontFamily: 'var(--admin-font-body)',
    fontSize:
      shape === 'tab' || shape === 'compact'
        ? 'var(--admin-size-micro)'
        : 'var(--admin-size-supporting)',
    fontWeight: 'var(--admin-weight-medium)',
    lineHeight: 1,
    cursor: isInert ? 'not-allowed' : 'pointer',
    opacity: isInert ? 0.6 : 1,
    transition:
      'background-color 150ms ease, border-color 150ms ease, color 150ms ease, opacity 150ms ease',
    whiteSpace: 'nowrap',
    ...(dims.height !== null ? { height: dims.height } : {}),
    ...(fullWidth ? { width: '100%' } : {}),
    ...(shape === 'tab'
      ? { flexDirection: 'column', gap: 'var(--admin-space-xxs)' }
      : {}),
    ...(style ?? {}),
  };

  return (
    <button
      type={type}
      onClick={isInert ? undefined : onClick}
      aria-label={ariaLabel}
      aria-current={ariaCurrent}
      aria-busy={loading || undefined}
      disabled={disabled}
      data-store-color={storeColor}
      data-variant={variant}
      data-shape={shape}
      className={`admin-ds-btn admin-ds-btn-${variant} admin-ds-btn-${shape} ${className}`}
      style={baseStyle}
      onMouseEnter={
        isInert
          ? undefined
          : (e) => {
              const el = e.currentTarget;
              el.style.backgroundColor = tokens.backgroundHover;
              el.style.borderColor = tokens.borderHover;
              el.style.color = tokens.colorHover;
            }
      }
      onMouseLeave={
        isInert
          ? undefined
          : (e) => {
              const el = e.currentTarget;
              el.style.backgroundColor = tokens.background;
              el.style.borderColor = tokens.border;
              el.style.color = tokens.color;
            }
      }
    >
      {loading ? (
        <span
          aria-hidden="true"
          style={{
            display: 'inline-flex',
            gap: '3px',
            alignItems: 'center',
          }}
        >
          <span className="admin-ds-btn-dot" />
          <span className="admin-ds-btn-dot" />
          <span className="admin-ds-btn-dot" />
        </span>
      ) : (
        children
      )}
    </button>
  );
}
