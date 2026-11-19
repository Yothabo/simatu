import { invalidateProductsCache } from '../../../../../systems/storefront/core/hooks/useProducts';
import toast from 'react-hot-toast';
import type { AdminRow } from '../../../types/admin.types';

type ProductsApi = (
  method: 'GET' | 'PATCH' | 'DELETE',
  body?: Record<string, string | boolean>,
  adminScope?: boolean,
) => Promise<Record<string, unknown>>;

type Deps = {
  adminRef: React.MutableRefObject<boolean | null>;
  userIdRef: React.MutableRefObject<string | null>;
  userId: string | null;
  productsApi: ProductsApi;
  loadProducts: () => Promise<void>;
  isActive: boolean;
  successMessage: (name: string) => string;
  errorMessage: string;
};

export function createSetStatusMutation(deps: Deps) {
  const {
    adminRef,
    userIdRef,
    userId,
    productsApi,
    loadProducts,
    isActive,
    successMessage,
    errorMessage,
  } = deps;

  return async (product: AdminRow): Promise<boolean> => {
    try {
      await productsApi('PATCH', {
        action: 'set-status',
        id: product.id,
        is_active: isActive,
      });

      invalidateProductsCache();

      if (adminRef.current && userIdRef.current === userId) {
        toast.success(successMessage(product.name));
        await loadProducts();
      }

      return true;
    } catch (error) {
      if (adminRef.current && userIdRef.current === userId) {
        toast.error(error instanceof Error ? error.message : errorMessage);
      }

      return false;
    }
  };
}
