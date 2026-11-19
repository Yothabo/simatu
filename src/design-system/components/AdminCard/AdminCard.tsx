import type { CSSProperties, ReactNode } from 'react';

const CARD_CHROME: CSSProperties = {
  borderRadius: 'var(--ds-radius-lg)',
  backgroundColor: 'var(--admin-surface)',
  backgroundImage: [
    'linear-gradient(to bottom, var(--admin-surface) 0%, transparent 30%)',
    'linear-gradient(to top, var(--admin-surface) 0%, transparent 30%)',
    'linear-gradient(to right, var(--admin-surface) 0%, transparent 30%)',
    'linear-gradient(to left, var(--admin-surface) 0%, transparent 30%)',
  ].join(','),
  backgroundSize: '100% 100%, 100% 100%, 100% 100%, 100% 100%',
  backgroundRepeat: 'no-repeat, no-repeat, no-repeat, no-repeat',
};

type AdminCardPadding = 'none' | 'sm' | 'md' | 'lg';

type AdminCardProps = {
  children: ReactNode;
  padding?: AdminCardPadding;
  borderless?: boolean;
  transparent?: boolean;
  style?: CSSProperties;
  className?: string;
};

const PADDING: Record<AdminCardPadding, string | number> = {
  none: 0,
  sm: 'var(--admin-space-sm)',
  md: 'var(--admin-space-md)',
  lg: 'var(--admin-space-lg)',
};

export default function AdminCard({
  children,
  padding = 'md',
  borderless = false,
  transparent = false,
  style,
  className = '',
}: AdminCardProps) {
  return (
    <div
      className={`overflow-hidden ${className}`}
      style={{
        ...(transparent ? {} : CARD_CHROME),
        ...(borderless
          ? {}
          : {
              borderWidth: '1px',
              borderStyle: 'solid',
              borderColor: 'var(--admin-border-strong)',
            }),
        padding: PADDING[padding],
        ...style,
      }}
    >
      {children}
    </div>
  );
}
