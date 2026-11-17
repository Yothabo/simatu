import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { supabase } from '../../../utils/supabase';

import {
  isValidCatalogueCategories,
  readCategoriesCache,
  writeCategoriesCache,
} from './adminCategoriesCache.storage';
import type { CatalogueCategory } from './adminCategoriesCache.storage';

export type { CatalogueCategory, CatalogueSubcategory } from './adminCategoriesCache.storage';

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

      if (!isValidCatalogueCategories(data.categories)) {
        throw new Error('The categories response is invalid.');
      }

      if (!isCurrent()) return;

      setCategories(data.categories);
      writeCategoriesCache(requestUserId!, requestStorefront, data.categories);
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

    const cached = readCategoriesCache(userId, storefront);
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
