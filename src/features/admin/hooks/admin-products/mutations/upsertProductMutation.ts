import { invalidateProductsCache } from '../../../../../systems/storefront/core/hooks/useProducts';
import { ADMIN_STORAGE_KEYS } from '../../../constants/admin.constants';
import { writeAdminSnapshot } from '../../../utils/adminSnapshot';
import type { AdminRow } from '../../../types/admin.types';
import { isAdminRows, normalizeAdminRows } from '../productRowGuards';

type Deps = {
  adminRef: React.MutableRefObject<boolean | null>;
  userIdRef: React.MutableRefObject<string | null>;
  loadRequestVersionRef: React.MutableRefObject<number>;
  productsRef: React.MutableRefObject<AdminRow[]>;
  updateProducts: (nextProducts: AdminRow[]) => void;
  userId: string | null;
  hasLoadedProducts: boolean;
  loadProducts: () => Promise<void>;
};

export function createUpsertProductMutation(deps: Deps) {
  const {
    adminRef,
    userIdRef,
    loadRequestVersionRef,
    productsRef,
    updateProducts,
    userId,
    hasLoadedProducts,
    loadProducts,
  } = deps;

  return (savedProduct: AdminRow): void => {
    if (!adminRef.current || !userId || userIdRef.current !== userId) {
      console.error(
        '[AdminProducts] Ignored product upsert because the admin scope changed.',
      );
      return;
    }

    const normalized = normalizeAdminRows([savedProduct]);

    if (!isAdminRows(normalized) || normalized.length !== 1) {
      console.error(
        '[AdminProducts] Ignored product upsert because the saved product response is invalid.',
      );
      return;
    }

    const canonicalProduct = normalized[0];

    // Invalidate any GET request started before this successful save.
    loadRequestVersionRef.current += 1;

    const currentProducts = productsRef.current;
    const existingIndex = currentProducts.findIndex(
      (product) => product.id === canonicalProduct.id,
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
        nextProducts,
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
  };
}
