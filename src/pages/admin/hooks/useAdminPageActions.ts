import { useState } from 'react';
import type { ComponentProps } from 'react';
import type {
  AdminRow,
  Order,
  OrderStatus,
} from '../../../features/admin/types/admin.types';
import type { useAdminProducts } from '../../../features/admin/hooks/useAdminProducts';
import type { useAdminOrders } from '../../../features/admin/hooks/useAdminOrders';
import type { useAdminActivity } from '../../../features/admin/hooks/useAdminActivity';
import AdminProductModals from '../components/AdminProductModals';
import AdminOrderModals from '../components/AdminOrderModals';
import { useProductFormSession } from './useProductFormSession';
import { useProductActions } from './useProductActions';

type ProductData = ReturnType<typeof useAdminProducts>;
type OrderData = ReturnType<typeof useAdminOrders>;
type ActivityData = ReturnType<typeof useAdminActivity>;

type ProductModalProps = ComponentProps<typeof AdminProductModals>;
type OrderModalProps = ComponentProps<typeof AdminOrderModals>;

type UseAdminPageActionsArgs = {
  formUserId: string | null;
  adminRole: ProductModalProps['adminRole'];
  storeSlug: ProductModalProps['storeSlug'];
  productData: ProductData;
  orderData: OrderData;
  loadActivities: ActivityData['loadActivities'];
};

export function useAdminPageActions({
  formUserId,
  adminRole,
  storeSlug,
  productData,
  orderData,
  loadActivities,
}: UseAdminPageActionsArgs) {
  const {
    formOpen,
    editing,
    openCreateForm,
    openEditForm,
    closeForm,
  } = useProductFormSession({ formUserId });

  const [viewingProduct, setViewingProduct] = useState<AdminRow | null>(null);
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null);
  const [confirmDeleteOrder, setConfirmDeleteOrder] = useState<Order | null>(null);

  const productActions = useProductActions({
    hideProduct: productData.hideProduct,
    reactivateProduct: productData.reactivateProduct,
    deleteProduct: productData.deleteProduct,
    loadActivities,
    onProductClosed: () => setViewingProduct(null),
  });

  const productsWithId = productData.products.filter(
    (product): product is AdminRow & { id: string } =>
      typeof product.id === 'string',
  );

  async function handleOrderStatusChange(
    order: Order,
    newStatus: OrderStatus,
  ) {
    const success = await orderData.changeOrderStatus(order, newStatus);
    if (success) {
      setViewingOrder(null);
      void loadActivities();
    }
  }

  async function handleDeleteOrder(order: Order) {
    const success = await orderData.deleteOrder(order);
    if (success) {
      setConfirmDeleteOrder(null);
      setViewingOrder(null);
      void loadActivities();
    }
  }

  function clearSelectionForStorefrontChange() {
    setViewingProduct(null);
    setViewingOrder(null);
    productActions.setConfirmDelete(null);
    productActions.setConfirmPermanentDelete(null);
    setConfirmDeleteOrder(null);
  }

  const productModalProps: ProductModalProps = {
    viewingProduct,
    onCloseViewingProduct: () => setViewingProduct(null),
    onEditProduct: openEditForm,
    onRequestHide: productActions.setConfirmDelete,
    onReactivate: productActions.handleReactivateProduct,
    onRequestPermanentDelete: productActions.setConfirmPermanentDelete,
    formOpen,
    editing,
    onCloseForm: closeForm,
    onSavedProduct: productData.upsertProduct,
    adminRole,
    storeSlug,
    confirmDelete: productActions.confirmDelete,
    isHiding: productActions.isHidingProduct,
    onConfirmHide: productActions.handleHideProduct,
    onCancelHide: () => productActions.setConfirmDelete(null),
    confirmPermanentDelete: productActions.confirmPermanentDelete,
    isDeleting: productActions.isDeletingProduct,
    onConfirmPermanentDelete: productActions.handlePermanentDeleteProduct,
    onCancelPermanentDelete: () => productActions.setConfirmPermanentDelete(null),
  };

  const orderModalProps: OrderModalProps = {
    viewingOrder,
    onCloseViewingOrder: () => setViewingOrder(null),
    products: productsWithId,
    onStatusChange: handleOrderStatusChange,
    onRequestDelete: (order) => {
      setViewingOrder(null);
      setConfirmDeleteOrder(order);
    },
    confirmDeleteOrder,
    onConfirmDelete: handleDeleteOrder,
    onCancelDelete: () => setConfirmDeleteOrder(null),
  };

  return {
    openCreateForm,
    setViewingProduct,
    setViewingOrder,
    productModalProps,
    orderModalProps,
    clearSelectionForStorefrontChange,
  };
}
