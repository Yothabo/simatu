import { describe, expect, it } from 'vitest';
import { isStorefrontKey, STOREFRONTS, type StorefrontConfiguration } from '../../src/systems/storefront/core';

describe('storefront design-system configuration', () => {
  it('keeps both current stores on the explicitly shared foundation', () => {
    expect(STOREFRONTS.yotaabo.designSystem).toMatchObject({
      source: 'shared',
      name: 'storefront-foundation',
    });
    expect(STOREFRONTS.poshies.designSystem).toMatchObject({
      source: 'shared',
      name: 'storefront-foundation',
    });
  });

  it('preserves independent brand accents and store routes', () => {
    expect(STOREFRONTS.yotaabo.basePath).toBe('/yotaabo');
    expect(STOREFRONTS.poshies.basePath).toBe('/poshies');
    expect(STOREFRONTS.yotaabo.designSystem.overrides['--sf-accent']).toBe('#8aa89b');
    expect(STOREFRONTS.poshies.designSystem.overrides['--sf-accent']).toBe('#ff1493');
  });

  it('supports a third storefront with its own taxonomy and semantic theme', () => {
    const thirdStore: StorefrontConfiguration = {
      ...STOREFRONTS.yotaabo,
      name: 'Third Store',
      basePath: '/third-store',
      categoryOrder: ['Gear'],
      catalog: {
        ...STOREFRONTS.yotaabo.catalog,
        categories: [{
          category: 'Gear',
          label: 'Gear',
          description: 'A custom category.',
          accentRole: 'primary',
        }],
      },
      collections: [{
        id: 'gear',
        title: 'Gear',
        eyebrow: 'MADE FOR EVERY DAY',
        description: 'A custom collection.',
        productCategory: 'Gear',
        textTone: 'default',
        accentRole: 'primary',
        hasWatermark: false,
      }],
      designSystem: {
        source: 'shared',
        name: 'storefront-foundation',
        overrides: {
          '--sf-background': '#ffffff',
          '--sf-text': '#202020',
          '--sf-accent': '#2457a6',
          '--sf-accent-contrast': '#ffffff',
        },
      },
    };

    STOREFRONTS['third-store'] = thirdStore;
    try {
      expect(isStorefrontKey('third-store')).toBe(true);
      expect(STOREFRONTS['third-store'].catalog.categories[0].category).toBe('Gear');
      expect(STOREFRONTS['third-store'].designSystem.overrides['--sf-accent']).toBe('#2457a6');
    } finally {
      delete STOREFRONTS['third-store'];
    }
  });

  it('recognizes only configured storefront keys', () => {
    expect(isStorefrontKey('yotaabo')).toBe(true);
    expect(isStorefrontKey('poshies')).toBe(true);
    expect(isStorefrontKey('unknown')).toBe(false);
  });
});
