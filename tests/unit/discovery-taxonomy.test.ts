import { describe, expect, it } from 'vitest';
import {
  DISCOVERY_MARKETS,
  DISCOVERY_SUBCATEGORIES,
  getMarketById,
  getSubcategories,
} from '../../src/systems/homepage/discover/discovery-taxonomy';

describe('marketplace discovery taxonomy governance', () => {
  it('uses unique top-level market IDs and names', () => {
    const ids = DISCOVERY_MARKETS.map((market) => market.id);
    const names = DISCOVERY_MARKETS.map((market) => market.category.toLowerCase());

    expect(new Set(ids).size).toBe(ids.length);
    expect(new Set(names).size).toBe(names.length);
    expect(DISCOVERY_MARKETS).toHaveLength(18);
  });

  it('uses unique subcategory IDs and display titles across markets', () => {
    const subcategories = Object.values(DISCOVERY_SUBCATEGORIES).flat();
    const ids = subcategories.map((subcategory) => subcategory.id);
    const titles = subcategories.map((subcategory) => subcategory.title.toLowerCase());

    expect(new Set(ids).size).toBe(ids.length);
    expect(new Set(titles).size).toBe(titles.length);
  });

  it('consolidates Home & Living without breaking the legacy living route alias', () => {
    const homeMarket = getMarketById('spaces');
    const legacyMarket = getMarketById('living');
    const homeSubcategories = getSubcategories('spaces');
    const legacySubcategories = getSubcategories('living');

    expect(homeMarket?.category).toBe('Home & Living');
    expect(legacyMarket?.id).toBe('spaces');
    expect(legacySubcategories).toEqual(homeSubcategories);
    expect(homeSubcategories.map((item) => item.id)).toContain('kitchen');
    expect(homeSubcategories.map((item) => item.id)).toContain('cleaning');
    expect(DISCOVERY_MARKETS.some((market) => market.id === 'living')).toBe(false);
  });

  it('exposes a single Age-Restricted destination, not adult products in general categories', () => {
    const restricted = DISCOVERY_MARKETS.filter((market) => market.id === 'age-restricted');
    expect(restricted).toHaveLength(1);
    expect(restricted[0].category).toBe('Age-Restricted');
    expect(DISCOVERY_MARKETS.some((market) => /sexual wellness|adult toys|intimate devices/i.test(market.category))).toBe(false);
    expect(Object.values(DISCOVERY_SUBCATEGORIES).flat().some((subcategory => /adult toys|sexual wellness|intimate devices/i.test(subcategory.title)))).toBe(false);
  });
});
