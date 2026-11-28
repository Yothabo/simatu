import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../../../../../utils/supabase';
import type { CategoryOption } from '../types';

type MarketplaceSubcategory = {
  id: string;
  slug: string;
  name: string;
  category_id: string;
  category_slug: string;
  category_name: string;
};

type MarketplaceCategory = { id: string; slug: string; name: string };

export function useMarketplaceTaxonomy(
  storefront: string,
  selectedCategorySlug: string | null,
  selectedSubcategoryId: string | null,
) {
  const [categories, setCategories] = useState<MarketplaceCategory[]>([]);
  const [items, setItems] = useState<MarketplaceSubcategory[]>([]);
  const [isLoadingMarketplaceTaxonomy, setIsLoadingMarketplaceTaxonomy] = useState(true);
  const [marketplaceTaxonomyError, setMarketplaceTaxonomyError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoadingMarketplaceTaxonomy(true);
      setMarketplaceTaxonomyError(null);
      setCategories([]);
      setItems([]);

      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.access_token) throw new Error('Sign in again to load store marketplace classifications.');

        const query = new URLSearchParams({ storefront });
        const response = await fetch('/api/admin-store-marketplace-taxonomy?' + query.toString(), {
          headers: { Accept: 'application/json', Authorization: 'Bearer ' + session.access_token },
          cache: 'no-store',
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Store marketplace taxonomy unavailable.');

        if (!cancelled) {
          setCategories(Array.isArray(data.categories) ? data.categories as MarketplaceCategory[] : []);
          setItems(Array.isArray(data.subcategories) ? data.subcategories as MarketplaceSubcategory[] : []);
        }
      } catch (error) {
        if (!cancelled) setMarketplaceTaxonomyError(error instanceof Error ? error.message : 'Store marketplace taxonomy unavailable.');
      } finally {
        if (!cancelled) setIsLoadingMarketplaceTaxonomy(false);
      }
    }

    if (storefront) void load();
    else {
      setIsLoadingMarketplaceTaxonomy(false);
      setMarketplaceTaxonomyError('Choose a storefront before classifying marketplace products.');
    }

    return () => { cancelled = true; };
  }, [storefront]);

  const marketplaceCategoryOptions: CategoryOption[] = useMemo(
    () => categories.map((item) => ({ value: item.slug, label: item.name })),
    [categories],
  );
  const marketplaceSubcategoryOptions: CategoryOption[] = useMemo(
    () => items
      .filter((item) => !selectedCategorySlug || item.category_slug === selectedCategorySlug)
      .map((item) => ({ value: item.id, label: item.name })),
    [items, selectedCategorySlug],
  );
  const selectedSubcategoryCategorySlug = items.find((item) => item.id === selectedSubcategoryId)?.category_slug ?? null;

  return {
    marketplaceCategoryOptions,
    marketplaceSubcategoryOptions,
    isLoadingMarketplaceTaxonomy,
    marketplaceTaxonomyError,
    selectedSubcategoryCategorySlug,
  };
}
