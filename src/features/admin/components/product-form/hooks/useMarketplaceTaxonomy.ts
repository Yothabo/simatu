import { useEffect, useMemo, useState } from 'react';
import type { CategoryOption } from '../types';

type MarketplaceSubcategory = {
  id: string;
  slug: string;
  name: string;
  category_slug: string;
  category_name: string;
};

export function useMarketplaceTaxonomy(selectedCategorySlug: string | null, selectedSubcategoryId: string | null) {
  const [items, setItems] = useState<MarketplaceSubcategory[]>([]);
  const [isLoadingMarketplaceTaxonomy, setIsLoadingMarketplaceTaxonomy] = useState(true);
  const [marketplaceTaxonomyError, setMarketplaceTaxonomyError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/marketplace-subcategories', { headers: { Accept: 'application/json' } })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Marketplace taxonomy unavailable.');
        return Array.isArray(data.subcategories) ? data.subcategories as MarketplaceSubcategory[] : [];
      })
      .then((data) => { if (!cancelled) { setItems(data); setMarketplaceTaxonomyError(null); } })
      .catch((error) => { if (!cancelled) setMarketplaceTaxonomyError(error instanceof Error ? error.message : 'Marketplace taxonomy unavailable.'); })
      .finally(() => { if (!cancelled) setIsLoadingMarketplaceTaxonomy(false); });
    return () => { cancelled = true; };
  }, []);

  const marketplaceCategoryOptions: CategoryOption[] = useMemo(() => Array.from(new Map(items.map((item) => [item.category_slug, { value: item.category_slug, label: item.category_name }])).values()), [items]);
  const marketplaceSubcategoryOptions: CategoryOption[] = useMemo(() => items.filter((item) => !selectedCategorySlug || item.category_slug === selectedCategorySlug).map((item) => ({ value: item.id, label: item.name })), [items, selectedCategorySlug]);

  const selectedSubcategoryCategorySlug = items.find((item) => item.id === selectedSubcategoryId)?.category_slug ?? null;
  return { marketplaceCategoryOptions, marketplaceSubcategoryOptions, isLoadingMarketplaceTaxonomy, marketplaceTaxonomyError, selectedSubcategoryCategorySlug };
}
