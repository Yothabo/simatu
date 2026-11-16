import { supabase } from '../../../../../utils/supabase';
import { invalidateProductsCache } from '../../../../../hooks/useProducts';
import toast from 'react-hot-toast';
import { getProductStoragePath } from '../../../components/product-form/utils';
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
};

export function createDeleteProductMutation(deps: Deps) {
  const { adminRef, userIdRef, userId, productsApi, loadProducts } = deps;

  return async (product: AdminRow): Promise<boolean> => {
    try {
      const data = await productsApi('DELETE', { id: product.id });

      invalidateProductsCache();

      if (adminRef.current && userIdRef.current === userId) {
        toast.success(`${product.name} deleted`);

        const deletedImageUrl =
          (data.deleted as { image_url?: string | null } | undefined)
            ?.image_url ?? product.image_url;

        const imagePath = getProductStoragePath(deletedImageUrl);

        if (imagePath) {
          void supabase.storage
            .from('products')
            .remove([imagePath])
            .then(({ error: storageError }) => {
              if (storageError) {
                console.error(
                  'Deleted product image could not be removed:',
                  storageError,
                );
                toast.error(
                  'Product deleted, but its image could not be removed.',
                );
              }
            })
            .catch((error) => {
              console.error(
                'Deleted product image cleanup failed:',
                error,
              );
              toast.error(
                'Product deleted, but its image could not be removed.',
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
          error instanceof Error ? error.message : 'Unable to delete product.',
        );
      }

      return false;
    }
  };
}
