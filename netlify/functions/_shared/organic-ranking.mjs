/**
 * Organic discovery scoring: deterministic and independent of paid campaign state.
 * Inputs are normalized so empty/low-volume catalogs can be ranked safely.
 */
const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, Number(value) || 0));
const logScale = (value) => Math.log1p(Math.max(0, Number(value) || 0));

export function scoreOrganicProduct(product = {}) {
  const completeness = [
    Boolean(String(product.name || '').trim()),
    Boolean(String(product.description || '').trim()),
    Boolean(String(product.image_url || '').trim()),
    Boolean(String(product.category || '').trim()),
    Boolean(String(product.subcategory || '').trim()),
    Number(product.price) > 0,
  ].filter(Boolean).length / 6;

  const views = logScale(product.views) / 12;
  const clicks = logScale(product.clicks) / 10;
  const carts = logScale(product.add_to_cart) / 8;
  const purchases = logScale(product.purchases) / 8;
  const conversion = clamp(Number(product.conversion_rate || 0));
  const recency = clamp(Number(product.recency_score ?? 0.5));

  // Cold-start floor avoids burying new products due to absent engagement.
  const engagement = clamp((views * 0.15) + (clicks * 0.2) + (carts * 0.25) + (purchases * 0.3) + (conversion * 0.1);
  const score = (completeness * 0.35) + (engagement * 0.4) + (recency * 0.15) + (0.1 * (1 - clamp(Number(product.age_days || 0) / 90)));
  return Number(clamp(score).toFixed(6));
}

export function rankOrganicProducts(products = []) {
  return products.map((product, index) => ({
    ...product,
    organic_score: scoreOrganicProduct(product),
    _stableIndex: index,
  })).sort((a, b) => b.organic_score - a.organic_score || a._stableIndex - b._stableIndex)
    .map(({ _stableIndex, ...product }) => product);
}
