import type {
  StorefrontConfiguration,
  StorefrontKey,
} from '../types/storefront';

/**
 * Store-level configuration is deliberately separate from visual components.
 * Shared components consume semantic tokens; each store theme owns their values.
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
      overrides: {},
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
      overrides: {},
    },
  },
} as const satisfies Record<StorefrontKey, StorefrontConfiguration>;

export function isStorefrontKey(value: string): value is StorefrontKey {
  return Object.prototype.hasOwnProperty.call(STOREFRONTS, value);
}
