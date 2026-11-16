import type { ReactNode } from 'react';

type OverviewToolbarProps = {
  children: ReactNode;
  align?: 'start' | 'end';
};

/**
 * Horizontal action row used in the overview header.
 * Uses tokens only — no Tailwind sizing. Wraps on narrow viewports.
 */
export default function OverviewToolbar({
  children,
  align = 'end',
}: OverviewToolbarProps) {
  return (
    <div
      role="toolbar"
      aria-label="Overview actions"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: align === 'end' ? 'flex-end' : 'flex-start',
        flexWrap: 'wrap',
        gap: 'var(--admin-space-xs)',
        width: '100%',
      }}
    >
      {children}
    </div>
  );
}
