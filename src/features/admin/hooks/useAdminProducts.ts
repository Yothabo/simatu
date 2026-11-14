import { useCallback, useLayoutEffect, useRef, useState } from 'react';
import { supabase } from '../../../utils/supabase';
import { invalidateProductsCache } from '../../../hooks/useProducts';
import toast from 'react-hot-toast';
import { ADMIN_STORAGE_KEYS } from '../constants/admin.constants';
import {
  readAdminSnapshot,
  writeAdminSnapshot,
} from '../utils/adminSnapshot';
import type { AdminRow } from '../types/admin.types';

function getProductStoragePath(imageUrl: string | null | undefined) {
  if (!imageUrl) return null;

  try {
    const url = new URL(imageUrl);
    const marker = '/storage/v1/object/public/products/';
    const index = url.pathname.indexOf(marker);

    if (index === -1) return null;

    return decodeURIComponent(
      url.pathname.slice(index + marker.length)
    );
  } catch {
    return null;
  }
}

function normalizeAdminRows(value: unknown): unknown {
  if (!Array.isArray(value)) return value;

  return value.map((product) => {
    if (!product || typeof product !== 'object') return product;

    const item = product as Record<string, unknown>;

    const supplierCost =
      item.supplier_cost == null ||
      (typeof item.supplier_cost === 'string' &&
        item.supplier_cost.trim() === '')
        ? null
        : typeof item.supplier_cost === 'string'
          ? Number(item.supplier_cost)
          : item.supplier_cost;

    return {
      ...item,
      storefront: item.storefront === 'poshies' ? 'poshies' : 'yotaabo',
      price:
        typeof item.price === 'string' && item.price.trim() !== ''
          ? Number(item.price)
          : item.price,
      supplier_cost: supplierCost,
      sort_order:
        typeof item.sort_order === 'string' && item.sort_order.trim() !== ''
          ? Number(item.sort_order)
          : item.sort_order,
    };
  });
}

function isAdminRows(value: unknown): value is AdminRow[] {
  return (
    Array.isArray(value) &&
    value.every((product) => {
      if (!product || typeof product !== 'object') return false;

      const item = product as Record<string, unknown>;

      return (
        typeof item.id === 'string' &&
        (item.storefront === 'yotaabo' || item.storefront === 'poshies') &&
        typeof item.name === 'string' &&
        typeof item.price === 'number' &&
        (item.supplier_cost === undefined ||
          item.supplier_cost === null ||
          (typeof item.supplier_cost === 'number' &&
            Number.isFinite(item.supplier_cost) &&
            item.supplier_cost >= 0)) &&
        ['His', 'Hers', 'Spaces', 'Lounge'].includes(String(item.category)) &&
        typeof item.subcategory === 'string' &&
        (item.description === null || typeof item.description === 'string') &&
        (item.image_url === null || typeof item.image_url === 'string') &&
        typeof item.is_active === 'boolean' &&
        typeof item.sort_order === 'number' &&
        typeof item.created_at === 'string'
      );
    })
  );
}

export function useAdminProducts(
  isAdmin: boolean | null,
  userId: string | null
) {
  const adminRef = useRef(isAdmin);
  const userIdRef = useRef(userId);
  const adminGenerationRef = useRef(0);
  const loadRequestVersionRef = useRef(0);
  const productsRef = useRef<AdminRow[]>([]);
  const previousScopeRef = useRef({ isAdmin, userId });

  if (
    previousScopeRef.current.isAdmin !== isAdmin ||
    previousScopeRef.current.userId !== userId
  ) {
    adminGenerationRef.current += 1;
    loadRequestVersionRef.current += 1;
    previousScopeRef.current = { isAdmin, userId };
  }

  adminRef.current = isAdmin;
  userIdRef.current = userId;

  const [products, setProducts] = useState<AdminRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasLoadedProducts, setHasLoadedProducts] = useState(false);
  const [productsLoadError, setProductsLoadError] = useState<string | null>(null);

  const updateProducts = useCallback((nextProducts: AdminRow[]) => {
    productsRef.current = nextProducts;
    setProducts(nextProducts);
  }, []);

  const productsApi = useCallback(
    async (
      method: 'GET' | 'PATCH' | 'DELETE',
      body?: Record<string, string | boolean>,
      adminScope = false
    ) => {
      const {
        data: { session: currentSession },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (
        sessionError ||
        !currentSession?.access_token ||
        currentSession.user.id !== userId
      ) {
        throw new Error(
          'Your admin session has expired. Please sign in again.'
        );
      }

      const url = adminScope
        ? '/api/products?scope=admin'
        : '/api/products';

      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${currentSession.access_token}`,
          Accept: 'application/json',
          ...(body ? { 'Content-Type': 'application/json' } : {}),
        },
        ...(body ? { body: JSON.stringify(body) } : {}),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'The product request failed.');
      }

      return data;
    },
    [userId]
  );

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
        latestProducts
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
  }, [isAdmin, productsApi, updateProducts, userId]);

  const upsertProduct = useCallback(
    (savedProduct: AdminRow) => {
      if (!adminRef.current || !userId || userIdRef.current !== userId) {
        console.error(
          '[AdminProducts] Ignored product upsert because the admin scope changed.'
        );
        return;
      }

      const normalized = normalizeAdminRows([savedProduct]);

      if (!isAdminRows(normalized) || normalized.length !== 1) {
        console.error(
          '[AdminProducts] Ignored product upsert because the saved product response is invalid.'
        );
        return;
      }

      const canonicalProduct = normalized[0];

      // Invalidate any GET request started before this successful save.
      loadRequestVersionRef.current += 1;

      const currentProducts = productsRef.current;
      const existingIndex = currentProducts.findIndex(
        (product) => product.id === canonicalProduct.id
      );

      let nextProducts: AdminRow[];

      if (existingIndex >= 0) {
        nextProducts = [...currentProducts];
        nextProducts[existingIndex] = canonicalProduct;
      } else {
        nextProducts = [canonicalProduct, ...currentProducts];
      }

      updateProducts(nextProducts);
      invalidateProductsCache();

      if (hasLoadedProducts) {
        writeAdminSnapshot(
          ADMIN_STORAGE_KEYS.productsCache,
          userId,
          nextProducts
        );
      } else {
        // The list has not been hydrated yet. Fetch the complete canonical list.
        void loadProducts();
      }

      console.info('[AdminProducts] Product collection reconciled.', {
        productId: canonicalProduct.id,
        operation: existingIndex >= 0 ? 'update' : 'insert',
        collectionSize: nextProducts.length,
      });
    },
    [hasLoadedProducts, loadProducts, updateProducts, userId]
  );

  const hideProduct = useCallback(
    async (product: AdminRow): Promise<boolean> => {
      try {
        await productsApi('PATCH', {
          action: 'set-status',
          id: product.id,
          is_active: false,
        });

        invalidateProductsCache();

        if (adminRef.current && userIdRef.current === userId) {
          toast.success(`${product.name} hidden`);
          await loadProducts();
        }

        return true;
      } catch (error) {
        if (adminRef.current && userIdRef.current === userId) {
          toast.error(
            error instanceof Error
              ? error.message
              : 'Unable to hide product.'
          );
        }

        return false;
      }
    },
    [loadProducts, productsApi, userId]
  );

  const reactivateProduct = useCallback(
    async (product: AdminRow): Promise<boolean> => {
      try {
        await productsApi('PATCH', {
          action: 'set-status',
          id: product.id,
          is_active: true,
        });

        invalidateProductsCache();

        if (adminRef.current && userIdRef.current === userId) {
          toast.success(`${product.name} reactivated`);
          await loadProducts();
        }

        return true;
      } catch (error) {
        if (adminRef.current && userIdRef.current === userId) {
          toast.error(
            error instanceof Error
              ? error.message
              : 'Unable to reactivate product.'
          );
        }

        return false;
      }
    },
    [loadProducts, productsApi, userId]
  );

  const deleteProduct = useCallback(
    async (product: AdminRow): Promise<boolean> => {
      try {
        const data = await productsApi('DELETE', { id: product.id });

        invalidateProductsCache();

        if (adminRef.current && userIdRef.current === userId) {
          toast.success(`${product.name} deleted`);

          const imagePath = getProductStoragePath(
            data.deleted?.image_url ?? product.image_url
          );

          if (imagePath) {
            void supabase.storage
              .from('products')
              .remove([imagePath])
              .then(({ error: storageError }) => {
                if (storageError) {
                  console.error(
                    'Deleted product image could not be removed:',
                    storageError
                  );
                  toast.error(
                    'Product deleted, but its image could not be removed.'
                  );
                }
              })
              .catch((error) => {
                console.error(
                  'Deleted product image cleanup failed:',
                  error
                );
                toast.error(
                  'Product deleted, but its image could not be removed.'
                );
              });
          }

          void loadProducts().catch((error) => {
            console.error('Product list refresh failed:', error);
          });
        }

        return true;
      } catch (error) {
        if (adminRef.current && userIdRef.current === userId) {
          toast.error(
            error instanceof Error
              ? error.message
              : 'Unable to delete product.'
          );
        }

        return false;
      }
    },
    [loadProducts, productsApi, userId]
  );

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
        Array.isArray(value) && isAdminRows(normalizeAdminRows(value))
    );

    if (cachedProducts) {
      const normalizedProducts = normalizeAdminRows(cachedProducts) as AdminRow[];

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
    products,
    isLoading,
    hasLoadedProducts,
    productsLoadError,
    loadProducts,
    upsertProduct,
    hideProduct,
    reactivateProduct,
    deleteProduct,
  };
}
