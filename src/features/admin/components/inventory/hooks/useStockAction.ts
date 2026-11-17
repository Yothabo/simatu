import { useCallback, useState, type FormEvent } from 'react';
import type {
  InventoryItem,
  StockAction,
  StorefrontFilter,
  InventoryResponse,
} from '../types';
import { fetchInventorySnapshot, submitStockMovement } from './stockAction.api';

type Args = {
  inventory: InventoryItem[];
  storefrontFilter: StorefrontFilter;
  accessToken: string;
  applyInventoryResponse: (
    data: InventoryResponse,
    persistSnapshot?: boolean,
  ) => void;
  setLoadError: (message: string) => void;
};

export function useStockAction({
  inventory,
  storefrontFilter,
  accessToken,
  applyInventoryResponse,
  setLoadError,
}: Args) {
  const [stockAction, setStockAction] = useState<StockAction>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [selectedProductId, setSelectedProductId] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [reason, setReason] = useState('');
  const [adjustmentDirection, setAdjustmentDirection] = useState<
    'increase' | 'decrease'
  >('increase');

  const selectedProduct = inventory.find(
    (item) => item.product_id === selectedProductId,
  );

  const openReceive = useCallback(() => {
    setSubmitError('');
    setSelectedProductId('');
    setQuantity('1');
    setReason('');
    setStockAction('receive');
  }, []);

  const openAdjust = useCallback(() => {
    setSubmitError('');
    setSelectedProductId('');
    setQuantity('1');
    setReason('');
    setAdjustmentDirection('increase');
    setStockAction('adjust');
  }, []);

  const close = useCallback(() => {
    setStockAction(null);
  }, []);

  const handleSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      if (
        !stockAction ||
        storefrontFilter === 'all' ||
        !accessToken ||
        !selectedProduct
      ) {
        setSubmitError('Select a storefront and a valid product.');
        return;
      }

      const parsedQuantity = Number(quantity);

      if (
        !Number.isInteger(parsedQuantity) ||
        parsedQuantity < 1 ||
        parsedQuantity > 1000000
      ) {
        setSubmitError(
          'Quantity must be a whole number between 1 and 1,000,000.',
        );
        return;
      }

      const action =
        stockAction === 'receive'
          ? selectedProduct.is_initialized
            ? 'replenishment'
            : 'opening-stock'
          : adjustmentDirection === 'increase'
            ? 'adjustment-increase'
            : 'adjustment-decrease';

      const requiresReason = action !== 'opening-stock';

      if (requiresReason && !reason.trim()) {
        setSubmitError('A reason is required for this stock movement.');
        return;
      }

      setIsSubmitting(true);
      setSubmitError('');

      try {
        await submitStockMovement({
          accessToken,
          storefront: storefrontFilter,
          productId: selectedProduct.product_id,
          action,
          quantity: parsedQuantity,
          reason: reason.trim(),
        });

        // The stock movement is committed. Close the form before refreshing
        // so a refresh failure cannot lead to the same movement being submitted again.
        setStockAction(null);
        setSelectedProductId('');
        setQuantity('1');
        setReason('');
        setAdjustmentDirection('increase');

        try {
          const refreshData = await fetchInventorySnapshot({
            accessToken,
            storefront: storefrontFilter,
          });

          applyInventoryResponse(refreshData);
          setLoadError('');
        } catch (refreshError) {
          setLoadError(
            `Stock was saved, but inventory could not be refreshed. Reload the page. ${
              refreshError instanceof Error ? refreshError.message : ''
            }`.trim(),
          );
        }
      } catch (error) {
        setSubmitError(
          error instanceof Error
            ? error.message
            : 'Unable to save the stock movement.',
        );
      } finally {
        setIsSubmitting(false);
      }
    },
    [
      accessToken,
      adjustmentDirection,
      applyInventoryResponse,
      quantity,
      reason,
      selectedProduct,
      setLoadError,
      stockAction,
      storefrontFilter,
    ],
  );

  return {
    stockAction,
    isSubmitting,
    submitError,
    selectedProductId,
    setSelectedProductId,
    quantity,
    setQuantity,
    reason,
    setReason,
    adjustmentDirection,
    setAdjustmentDirection,
    selectedProduct,
    openReceive,
    openAdjust,
    close,
    handleSubmit,
  };
}
