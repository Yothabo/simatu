import { describe, expect, it } from 'vitest';
import { isStorefrontKey, STOREFRONTS } from '../../src/systems/storefront/core';

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
    expect(STOREFRONTS.poshies.designSystem.overrides['--storefront-accent']).toBe('#ff1493');
  });

  it('recognizes only configured storefront keys', () => {
    expect(isStorefrontKey('yotaabo')).toBe(true);
    expect(isStorefrontKey('poshies')).toBe(true);
    expect(isStorefrontKey('unknown')).toBe(false);
  });
});
