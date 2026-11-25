import type {
  StorefrontConfiguration,
  StorefrontKey,
} from '../types/storefront';

/**
 * Store-level configuration is deliberately separate from visual components.
 * Stores may share a design foundation while retaining brand-specific tokens,
 * or select a fully local design system when their identity diverges.
 */
export const STOREFRONTS = {
  yotaabo: {
    name: 'Yotaabo',
    basePath: '/yotaabo',
    primaryAccent: '#8aa89b',
    categoryOrder: ['His', 'Hers', 'Spaces'],
    designSystem: {
      source: 'shared',
      name: 'storefront-foundation',
      overrides: {
        '--storefront-accent': '#8aa89b',
      },
    },
  },
  poshies: {
    name: 'Poshies',
    basePath: '/poshies',
    primaryAccent: '#ff1493',
    categoryOrder: ['Hers', 'His', 'Lounge'],
    designSystem: {
      source: 'shared',
      name: 'storefront-foundation',
      overrides: {
        '--storefront-accent': '#ff1493',
        '--storefront-accent-contrast': '#ffffff',
        '--storefront-page': '#292426',
        '--storefront-surface': '#292426',
        '--storefront-surface-soft': '#292426',
        '--storefront-text': '#ffffff',
        '--storefront-muted': '#ffffff',
        '--storefront-border': 'rgba(255,255,255,.18)',
      },
    },
  },
} as const satisfies Record<StorefrontKey, StorefrontConfiguration>;

export function isStorefrontKey(value: string): value is StorefrontKey {
  return Object.prototype.hasOwnProperty.call(STOREFRONTS, value);
}
