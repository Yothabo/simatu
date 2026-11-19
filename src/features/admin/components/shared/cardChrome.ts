import type { CSSProperties } from 'react';

/**
 * Shared card chrome — base styling for all admin cards.
 * Used by stats cards, business widgets, store performance card, and category cards.
 * Single source of truth for the gradient + grid + border pattern.
 */
export const CARD_CHROME: CSSProperties = {
  borderRadius: 'var(--ds-radius-lg)',
  borderWidth: '1px',
  borderStyle: 'solid',
  borderColor: 'var(--admin-border-strong)',
  // backgroundColor handled by .admin-card-bg CSS class (theme-aware)
  backgroundImage: [
    'linear-gradient(to bottom, var(--admin-surface) 0%, transparent 30%)',
    'linear-gradient(to top, var(--admin-surface) 0%, transparent 30%)',
    'linear-gradient(to right, var(--admin-card-grid-line) 1px, transparent 1px)',
    'linear-gradient(to bottom, var(--admin-card-grid-line) 1px, transparent 1px)',
  ].join(','),
  backgroundSize: [
    '100% 100%',
    '100% 100%',
    'var(--admin-card-grid-size) var(--admin-card-grid-size)',
    'var(--admin-card-grid-size) var(--admin-card-grid-size)',
  ].join(','),
  backgroundRepeat: 'no-repeat, no-repeat, repeat, repeat',
};
