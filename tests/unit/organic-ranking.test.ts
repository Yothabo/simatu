import { describe, expect, it } from 'vitest';
import { rankOrganicProducts, scoreOrganicProduct } from '../../netlify/functions/_shared/organic-ranking.mjs';

describe('organic discovery ranking', () => {
  it('scores incomplete products safely', () => {
    expect(scoreOrganicProduct({})).toBeGreaterThanOrEqual(0);
    expect(scoreOrganicProduct({})).toBeLessThanOrEqual(1);
  });

  it('keeps ranking deterministic when scores tie', () => {
    const ranked = rankOrganicProducts([{ id: 'first' }, { id: 'second' }]);
    expect(ranked.map((item) => item.id)).toEqual(['first', 'second']);
  });

  it('prefers product completeness and engagement over an empty listing', () => {
    const ranked = rankOrganicProducts([
      { id: 'empty', age_days: 0 },
      { id: 'complete', name: 'Example', description: 'Useful details', image_url: '/image.jpg', category: 'Fashion', subcategory: 'Shirts', price: 100, views: 50, clicks: 10, add_to_cart: 2, purchases: 1, conversion_rate: 0.1, recency_score: 0.8 },
    ]);
    expect(ranked[0].id).toBe('complete');
  });
});
