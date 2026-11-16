import {
  useAdminProductMutations,
  useAdminProductsLoader,
  useAdminProductsScope,
  useProductsApi,
} from './admin-products';

export function useAdminProducts(
  isAdmin: boolean | null,
  userId: string | null,
) {
  const scope = useAdminProductsScope(isAdmin, userId);
  const productsApi = useProductsApi(userId);

  const { isLoading, hasLoadedProducts, productsLoadError, loadProducts } =
    useAdminProductsLoader({
      isAdmin,
      userId,
      scope,
      productsApi,
    });

  const { upsertProduct, hideProduct, reactivateProduct, deleteProduct } =
    useAdminProductMutations({
      userId,
      hasLoadedProducts,
      scope,
      loadProducts,
      productsApi,
    });

  return {
    products: scope.products,
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
