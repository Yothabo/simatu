import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { supabase } from '../../../utils/supabase';

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
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes

type CacheEntry = {
  userId: string;
  savedAt: number;
  data: CatalogueCategory[];
};

function cacheKey(userId: string, storefront: string): string {
  return `${CACHE_PREFIX}:${userId}:${storefront}`;
}

function readCache(
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

function writeCache(
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

function isValidCategories(
  value: unknown,
): value is CatalogueCategory[] {
  if (!Array.isArray(value)) return false;
  return value.every((cat) => {
    if (!cat || typeof cat !== 'object') return false;
    const c = cat as Record<string, unknown>;
    return (
      typeof c.id === 'string' &&
      typeof c.name === 'string' &&
      typeof c.slug === 'string' &&
      typeof c.sort_order === 'number' &&
      typeof c.is_active === 'boolean' &&
      Array.isArray(c.subcategories)
    );
  });
}

type Args = {
  userId: string | null;
  storefront: string;
  /** Set to true to bypass cache and refetch. Pass a state hook setter
   *  to trigger invalidation from outside (e.g. after editing a category). */
  invalidateToken?: number;
};

export function useAdminCategoriesCache({
  userId,
  storefront,
  invalidateToken = 0,
}: Args) {
  const [categories, setCategories] = useState<CatalogueCategory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reqVersionRef = useRef(0);
  const storefrontRef = useRef(storefront);
  const userIdRef = useRef(userId);
  storefrontRef.current = storefront;
  userIdRef.current = userId;

  const refresh = useCallback(async () => {
    if (!userId) return;

    const version = ++reqVersionRef.current;
    const requestStorefront = storefrontRef.current;
    const requestUserId = userIdRef.current;

    const isCurrent = () =>
      version === reqVersionRef.current &&
      storefrontRef.current === requestStorefront &&
      userIdRef.current === requestUserId;

    setError(null);
    setIsLoading(true);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        throw new Error('Your session has expired. Please sign in again.');
      }

      const response = await fetch(
        `/api/categories?storefront=${encodeURIComponent(requestStorefront)}&scope=admin`,
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Unable to load categories.');
      }

      if (!isValidCategories(data.categories)) {
        throw new Error('The categories response is invalid.');
      }

      if (!isCurrent()) return;

      setCategories(data.categories);
      writeCache(requestUserId!, requestStorefront, data.categories);
    } catch (err) {
      if (!isCurrent()) return;
      setError(
        err instanceof Error ? err.message : 'Unable to load categories.',
      );
    } finally {
      if (isCurrent()) setIsLoading(false);
    }
  }, [userId]);

  // On mount / storefront change / user change: load from cache if fresh,
  // otherwise fetch.
  useLayoutEffect(() => {
    if (!userId) {
      setCategories([]);
      setIsLoading(false);
      setError(null);
      return;
    }

    const cached = readCache(userId, storefront);
    if (cached) {
      setCategories(cached);
      setIsLoading(false);
      setError(null);
      return;
    }

    setCategories([]);
    void refresh();
  }, [userId, storefront, refresh]);

  // External invalidation trigger (bump token to refetch)
  useEffect(() => {
    if (invalidateToken === 0) return;
    if (!userId) return;
    void refresh();
  }, [invalidateToken, userId, refresh]);

  return { categories, isLoading, error, refresh };
}
