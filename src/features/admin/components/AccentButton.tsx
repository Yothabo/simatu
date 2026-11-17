import type { CSSProperties, ReactNode } from 'react';

type AccentButtonProps = {
  variant?: 'accent' | 'active' | 'neutral' | 'dark' | 'transparent';
  shape?: 'pill' | 'circle' | 'tab' | 'segment';
  onClick?: () => void;
  ariaLabel?: string;
  ariaCurrent?: 'page' | 'true' | undefined;
  className?: string;
  style?: CSSProperties;
  storeColor?: string;
  activeColor?: string;
  children: ReactNode;
};

export default function AccentButton({
  variant = 'neutral',
  shape = 'pill',
  onClick,
  ariaLabel,
  ariaCurrent,
  className = '',
  style,
  storeColor,
  activeColor,
  children,
}: AccentButtonProps) {
  const variantClass =
    variant === 'accent'
      ? 'admin-btn-accent'
      : variant === 'active'
        ? 'admin-btn-active'
        : variant === 'dark'
          ? 'admin-btn-dark'
          : variant === 'transparent'
            ? 'admin-btn-transparent'
            : 'admin-btn-neutral';

  const shapeClass =
    shape === 'circle'
      ? 'admin-btn-circle'
      : shape === 'tab'
        ? 'admin-btn-tab'
        : shape === 'segment'
          ? 'admin-btn-segment'
          : 'admin-btn-pill';

  const inlineStyle: CSSProperties & { [key: string]: string | number } = {
    ...(style || {}),
    ...(storeColor ? { '--store-chip-color': storeColor } : {}),
    ...(variant === 'active'
      ? {
          '--btn-active-bg': activeColor || 'var(--admin-text-primary)',
          backgroundColor: activeColor || 'var(--admin-text-primary)',
          color: 'var(--admin-on-accent)',
        }
      : {}),
  };

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      aria-current={ariaCurrent}
      data-store-color={storeColor}
      className={`admin-btn ${variantClass} ${shapeClass} ${className}`}
      style={inlineStyle}
    >
      {children}
    </button>
  );
}
