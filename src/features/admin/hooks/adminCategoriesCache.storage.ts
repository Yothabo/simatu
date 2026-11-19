export type CatalogueSubcategory = {
  id: string;
  name: string;
  slug: string;
  sort_order: number;
  is_active: boolean;
};

export type CatalogueCategory = {
  id: string;
  name: string;
  slug: string;
  sort_order: number;
  is_active: boolean;
  subcategories: CatalogueSubcategory[];
};

const CACHE_PREFIX = 'yotaabo-admin-categories-cache';
const CACHE_TTL_MS = 30 * 60 * 1000;

type CacheEntry = {
  userId: string;
  savedAt: number;
  data: CatalogueCategory[];
};

function cacheKey(userId: string, storefront: string): string {
  return `${CACHE_PREFIX}:${userId}:${storefront}`;
}

export function readCategoriesCache(
  userId: string,
  storefront: string,
): CatalogueCategory[] | null {
  try {
    const raw = sessionStorage.getItem(cacheKey(userId, storefront));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<CacheEntry>;
    if (
      typeof parsed.userId !== 'string' ||
      typeof parsed.savedAt !== 'number' ||
      !Array.isArray(parsed.data)
    ) {
      sessionStorage.removeItem(cacheKey(userId, storefront));
      return null;
    }
    if (parsed.userId !== userId) return null;
    const age = Date.now() - parsed.savedAt;
    if (age < 0 || age > CACHE_TTL_MS) {
      sessionStorage.removeItem(cacheKey(userId, storefront));
      return null;
    }
    return parsed.data;
  } catch {
    return null;
  }
}

export function writeCategoriesCache(
  userId: string,
  storefront: string,
  data: CatalogueCategory[],
): void {
  try {
    sessionStorage.setItem(
      cacheKey(userId, storefront),
      JSON.stringify({
        userId,
        savedAt: Date.now(),
        data,
      } satisfies CacheEntry),
    );
  } catch {
    // Storage unavailable; ignore.
  }
}

export function isValidCatalogueCategories(
  value: unknown,
): value is CatalogueCategory[] {
  if (!Array.isArray(value)) return false;
  return value.every((category) => {
    if (!category || typeof category !== 'object') return false;
    const item = category as Record<string, unknown>;
    return (
      typeof item.id === 'string' &&
      typeof item.name === 'string' &&
      typeof item.slug === 'string' &&
      typeof item.sort_order === 'number' &&
      typeof item.is_active === 'boolean' &&
      Array.isArray(item.subcategories)
    );
  });
}
