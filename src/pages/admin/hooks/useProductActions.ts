import { useCallback, useRef, useState } from 'react';
import type { AdminRow } from '../../../features/admin/types/admin.types';

type Args = {
  hideProduct: (product: AdminRow) => Promise<boolean>;
  reactivateProduct: (product: AdminRow) => Promise<boolean>;
  deleteProduct: (product: AdminRow) => Promise<boolean>;
  loadActivities: () => void;
  onProductClosed: () => void;
};

export function useProductActions({
  hideProduct,
  reactivateProduct,
  deleteProduct,
  loadActivities,
  onProductClosed,
}: Args) {
  const [confirmDelete, setConfirmDelete] = useState<AdminRow | null>(null);
  const [confirmPermanentDelete, setConfirmPermanentDelete] =
    useState<AdminRow | null>(null);
  const [isHidingProduct, setIsHidingProduct] = useState(false);
  const isHidingProductRef = useRef(false);
  const [isDeletingProduct, setIsDeletingProduct] = useState(false);
  const isDeletingProductRef = useRef(false);

  const handleHideProduct = useCallback(
    async (product: AdminRow) => {
      if (isHidingProductRef.current) return;

      isHidingProductRef.current = true;
      setIsHidingProduct(true);

      try {
        const success = await hideProduct(product);

        if (success) {
          setConfirmDelete(null);
          onProductClosed();
          void loadActivities();
        }
      } finally {
        isHidingProductRef.current = false;
        setIsHidingProduct(false);
      }
    },
    [hideProduct, loadActivities, onProductClosed],
  );

  const handlePermanentDeleteProduct = useCallback(
    async (product: AdminRow) => {
      if (isDeletingProductRef.current) return;

      isDeletingProductRef.current = true;
      setIsDeletingProduct(true);

      try {
        const success = await deleteProduct(product);

        if (success) {
          setConfirmPermanentDelete(null);
          onProductClosed();
          void loadActivities();
        }
      } finally {
        isDeletingProductRef.current = false;
        setIsDeletingProduct(false);
      }
    },
    [deleteProduct, loadActivities, onProductClosed],
  );

  const handleReactivateProduct = useCallback(
    async (product: AdminRow) => {
      const success = await reactivateProduct(product);

      if (success) {
        onProductClosed();
        void loadActivities();
      }
    },
    [reactivateProduct, loadActivities, onProductClosed],
  );

  return {
    confirmDelete,
    setConfirmDelete,
    confirmPermanentDelete,
    setConfirmPermanentDelete,
    isHidingProduct,
    isDeletingProduct,
    handleHideProduct,
    handlePermanentDeleteProduct,
    handleReactivateProduct,
  };
}
