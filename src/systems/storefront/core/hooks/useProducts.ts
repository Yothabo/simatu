import { useEffect, useState } from 'react';
import useStorefront from './useStorefront.ts';

export type ProductCategory = string;

export type Product = {
  id: string;
  name: string;
  price: number;
  category: ProductCategory;
  subcategory: string;
  description: string | null;
  image_url: string | null;
  is_active: boolean;
  sort_order: number;
  order_count: number;
  sizes?: string[];
  created_at: string;
};

const PRODUCT_CACHE_TTL = 15_000;

const cachedProducts = new Map<string, Product[]>();
const cacheUpdatedAt = new Map<string, number>();
const inFlightRequests = new Map<string, Promise<Product[]>>();
let cacheVersion = 0;

export function invalidateProductsCache(): void {
  cacheVersion += 1;
  cachedProducts.clear();
  cacheUpdatedAt.clear();
  inFlightRequests.clear();
}

function timestamp(value: string | null | undefined): number {
  if (!value) return 0;

  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

async function fetchProducts(storefront: string): Promise<Product[]> {
  const existingRequest = inFlightRequests.get(storefront);
  if (existingRequest) {
    return existingRequest;
  }

  const requestVersion = cacheVersion;
  const request = (async () => {
    const response = await fetch(
      `/api/products?storefront=${encodeURIComponent(storefront)}`, {
      headers: { Accept: 'application/json' },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Unable to load products.');
    }

    const products = Array.isArray(data.products)
      ? data.products
      : [];

    if (requestVersion === cacheVersion) {
      cachedProducts.set(storefront, products);
      cacheUpdatedAt.set(storefront, Date.now());
    }

    return products;
  })();

  inFlightRequests.set(storefront, request);

  try {
    return await request;
  } finally {
    if (inFlightRequests.get(storefront) === request) {
      inFlightRequests.delete(storefront);
    }
  }
}

/**
 * Hero selection:
 * 1. Active products only.
 * 2. Higher order_count first.
 * 3. Lower admin sort_order first.
 * 4. Newest products first.
 */
export function getFeaturedProducts(
  products: Product[],
  limit = 5
): Product[] {
  return products
    .filter((product) => product.is_active === true)
    .slice()
    .sort((a, b) => {
      const orderDifference =
        (Number(b.order_count) || 0) - (Number(a.order_count) || 0);

      if (orderDifference !== 0) return orderDifference;

      const sortDifference =
        (Number(a.sort_order) || 0) - (Number(b.sort_order) || 0);

      if (sortDifference !== 0) return sortDifference;

      return timestamp(b.created_at) - timestamp(a.created_at);
    })
    .slice(0, limit);
}

/**
 * Category selection:
 * 1. Active products only.
 * 2. Exact category match.
 * 3. Admin sort_order ascending.
 * 4. Newest first when sort_order is equal.
 */
export function getCategoryProducts(
  products: Product[],
  category: ProductCategory,
  limit = 5
): Product[] {
  return products
    .filter(
      (product) =>
        product.is_active === true &&
        product.category === category
    )
    .slice()
    .sort((a, b) => {
      const sortDifference =
        (Number(a.sort_order) || 0) - (Number(b.sort_order) || 0);

      if (sortDifference !== 0) return sortDifference;

      return timestamp(b.created_at) - timestamp(a.created_at);
    })
    .slice(0, limit);
}

export function useProducts() {
  const { name } = useStorefront();
  const storefront = name.toLowerCase();

  const [productState, setProductState] = useState<{
    storefront: string;
    products: Product[];
  }>(() => ({
    storefront,
    products: cachedProducts.get(storefront) ?? [],
  }));

  const [loadingStorefront, setLoadingStorefront] = useState<string | null>(
    () => cachedProducts.has(storefront) ? null : storefront
  );

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setError(null);

    const hasCache = cachedProducts.has(storefront);
    const cacheIsFresh =
      hasCache &&
      Date.now() - (cacheUpdatedAt.get(storefront) ?? 0) < PRODUCT_CACHE_TTL;

    if (hasCache) {
      setProductState({
        storefront,
        products: cachedProducts.get(storefront) ?? [],
      });
      setLoadingStorefront(null);
    }

    if (cacheIsFresh) {
      return () => {
        cancelled = true;
      };
    }

    if (!hasCache) {
      setLoadingStorefront(storefront);
    }

    fetchProducts(storefront)
      .then((data) => {
        if (!cancelled) {
          setProductState({ storefront, products: data });
          setLoadingStorefront(null);
          setError(null);
        }
      })
      .catch((fetchError) => {
        if (!cancelled) {
          setError(
            fetchError instanceof Error
              ? fetchError.message
              : 'Unable to load products.'
          );
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoadingStorefront(null);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [storefront]);

  const products = productState.storefront === storefront
    ? productState.products
    : [];
  const isLoading = loadingStorefront === storefront ||
    productState.storefront !== storefront;

  return { products, isLoading, error };
}
