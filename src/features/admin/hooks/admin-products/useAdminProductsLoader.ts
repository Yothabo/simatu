import { useCallback, useLayoutEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { ADMIN_STORAGE_KEYS } from '../../constants/admin.constants';
import {
  readAdminSnapshot,
  writeAdminSnapshot,
} from '../../utils/adminSnapshot';
import type { AdminRow } from '../../types/admin.types';
import { isAdminRows, normalizeAdminRows } from './productRowGuards';

type Scope = {
  adminRef: React.MutableRefObject<boolean | null>;
  userIdRef: React.MutableRefObject<string | null>;
  adminGenerationRef: React.MutableRefObject<number>;
  loadRequestVersionRef: React.MutableRefObject<number>;
  updateProducts: (nextProducts: AdminRow[]) => void;
};

type Args = {
  isAdmin: boolean | null;
  userId: string | null;
  scope: Scope;
  productsApi: (
    method: 'GET' | 'PATCH' | 'DELETE',
    body?: Record<string, string | boolean>,
    adminScope?: boolean,
  ) => Promise<Record<string, unknown>>;
};

export function useAdminProductsLoader({
  isAdmin,
  userId,
  scope,
  productsApi,
}: Args) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasLoadedProducts, setHasLoadedProducts] = useState(false);
  const [productsLoadError, setProductsLoadError] = useState<string | null>(
    null,
  );

  const {
    adminRef,
    userIdRef,
    adminGenerationRef,
    loadRequestVersionRef,
    updateProducts,
  } = scope;

  const loadProducts = useCallback(async () => {
    if (!isAdmin || !userId) return;

    const requestGeneration = adminGenerationRef.current;
    const requestVersion = ++loadRequestVersionRef.current;
    const requestUserId = userId;

    const isCurrentRequest = () =>
      requestGeneration === adminGenerationRef.current &&
      requestVersion === loadRequestVersionRef.current &&
      adminRef.current === true &&
      userIdRef.current === requestUserId;

    setProductsLoadError(null);

    try {
      const data = await productsApi('GET', undefined, true);
      const latestProducts = normalizeAdminRows(data.products ?? []);

      if (!isAdminRows(latestProducts)) {
        throw new Error('The products response has an invalid format.');
      }

      if (!isCurrentRequest()) return;

      updateProducts(latestProducts);

      writeAdminSnapshot(
        ADMIN_STORAGE_KEYS.productsCache,
        requestUserId,
        latestProducts,
      );
    } catch (error) {
      if (isCurrentRequest()) {
        const message =
          error instanceof Error ? error.message : 'Unable to load products.';

        setProductsLoadError(message);
        toast.error(message);
      }
    } finally {
      if (isCurrentRequest()) {
        setIsLoading(false);
        setHasLoadedProducts(true);
      }
    }
  }, [
    adminGenerationRef,
    adminRef,
    isAdmin,
    loadRequestVersionRef,
    productsApi,
    updateProducts,
    userId,
    userIdRef,
  ]);

  useLayoutEffect(() => {
    if (isAdmin !== true || !userId) {
      updateProducts([]);
      setIsLoading(false);
      setHasLoadedProducts(false);
      setProductsLoadError(null);
      return;
    }

    const cachedProducts = readAdminSnapshot(
      ADMIN_STORAGE_KEYS.productsCache,
      userId,
      (value): value is unknown[] =>
        Array.isArray(value) && isAdminRows(normalizeAdminRows(value)),
    );

    if (cachedProducts) {
      const normalizedProducts = normalizeAdminRows(
        cachedProducts,
      ) as AdminRow[];

      updateProducts(normalizedProducts);
      setIsLoading(false);
      setHasLoadedProducts(true);
      return;
    }

    updateProducts([]);
    setIsLoading(true);
    setHasLoadedProducts(false);
    void loadProducts();
  }, [isAdmin, userId, loadProducts, updateProducts]);

  return {
    isLoading,
    hasLoadedProducts,
    productsLoadError,
    loadProducts,
  };
}
