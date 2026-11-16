import { FiX } from 'react-icons/fi';
import {
  AdminButton,
  AdminCard,
  AdminSectionHeader,
} from '../../../../../design-system/components';
import type { InventoryItem, StockAction } from '../types';

type Props = {
  stockAction: StockAction;
  inventory: InventoryItem[];
  selectedProductId: string;
  setSelectedProductId: (value: string) => void;
  quantity: string;
  setQuantity: (value: string) => void;
  reason: string;
  setReason: (value: string) => void;
  adjustmentDirection: 'increase' | 'decrease';
  setAdjustmentDirection: (value: 'increase' | 'decrease') => void;
  isSubmitting: boolean;
  submitError: string;
  selectedProduct: InventoryItem | undefined;
  onClose: () => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
};

const LABEL_STYLE = {
  fontSize: 'var(--admin-size-micro)',
  fontWeight: 'var(--admin-weight-medium)',
  color: 'var(--admin-text-tertiary)',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.08em',
  display: 'block',
} as const;

const INPUT_STYLE = {
  background: 'var(--admin-surface)',
  color: 'var(--admin-text-primary)',
  borderColor: 'var(--admin-border-subtle)',
} as const;

export default function StockActionModal({
  stockAction,
  inventory,
  selectedProductId,
  setSelectedProductId,
  quantity,
  setQuantity,
  reason,
  setReason,
  adjustmentDirection,
  setAdjustmentDirection,
  isSubmitting,
  submitError,
  selectedProduct,
  onClose,
  onSubmit,
}: Props) {
  if (!stockAction) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4"
      role="presentation"
      style={{ background: 'rgba(0, 0, 0, 0.55)' }}
      onClick={(event) => {
        if (!isSubmitting && event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="stock-action-title"
        className="my-auto w-full max-w-lg"
      >
        <AdminCard>
          <div
            className="flex items-start justify-between"
            style={{
              gap: 'var(--admin-space-md)',
              marginBottom: 'var(--admin-space-md)',
            }}
          >
            <AdminSectionHeader
              title={
                stockAction === 'receive' ? 'Receive stock' : 'Adjust stock'
              }
              description={
                stockAction === 'receive'
                  ? 'Record new stock received from a supplier.'
                  : 'Record a verified correction to the physical stock balance.'
              }
              as="h3"
              compact
            />
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              aria-label="Close dialog"
              style={{
                padding: 'var(--admin-space-xxs)',
                borderRadius: 'var(--ds-radius-md)',
                background: 'transparent',
                border: 'none',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                color: 'var(--admin-text-secondary)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <FiX size={19} aria-hidden="true" />
            </button>
          </div>

          <form
            onSubmit={onSubmit}
            className="flex flex-col"
            style={{ gap: 'var(--admin-space-md)' }}
          >
            <div className="flex flex-col gap-1.5">
              <label htmlFor="inventory-product" style={LABEL_STYLE}>
                Product
              </label>
              <select
                id="inventory-product"
                value={selectedProductId}
                onChange={(event) =>
                  setSelectedProductId(event.target.value)
                }
                required
                disabled={isSubmitting}
                className="min-h-11 w-full rounded-lg border px-3 py-2 text-sm outline-none"
                style={INPUT_STYLE}
              >
                <option value="">Select a product</option>
                {inventory
                  .filter((item) => item.is_active)
                  .map((item) => (
                    <option key={item.product_id} value={item.product_id}>
                      {item.product_name}
                      {!item.is_initialized ? ' · Opening stock required' : ''}
                    </option>
                  ))}
              </select>
            </div>

            {stockAction === 'adjust' && (
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="inventory-adjustment-direction"
                  className="text-sm font-medium"
                  style={{ color: 'var(--admin-text-primary)' }}
                >
                  Adjustment type
                </label>
                <select
                  id="inventory-adjustment-direction"
                  value={adjustmentDirection}
                  onChange={(event) =>
                    setAdjustmentDirection(
                      event.target.value as 'increase' | 'decrease',
                    )
                  }
                  disabled={isSubmitting}
                  className="min-h-11 w-full rounded-lg border px-3 py-2 text-sm outline-none"
                  style={INPUT_STYLE}
                >
                  <option value="increase">Increase stock</option>
                  <option value="decrease">Decrease stock</option>
                </select>
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <label htmlFor="inventory-quantity" style={LABEL_STYLE}>
                Quantity
              </label>
              <input
                id="inventory-quantity"
                type="number"
                min="1"
                max="1000000"
                step="1"
                inputMode="numeric"
                value={quantity}
                onChange={(event) => setQuantity(event.target.value)}
                required
                disabled={isSubmitting}
                className="min-h-11 w-full rounded-lg border px-3 py-2 text-sm outline-none"
                style={INPUT_STYLE}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="inventory-reason" style={LABEL_STYLE}>
                Reason
                {stockAction === 'receive' &&
                selectedProduct &&
                !selectedProduct.is_initialized
                  ? ' (optional for opening stock)'
                  : ''}
              </label>
              <textarea
                id="inventory-reason"
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                required={
                  stockAction === 'adjust' ||
                  Boolean(selectedProduct?.is_initialized)
                }
                maxLength={500}
                rows={3}
                disabled={isSubmitting}
                placeholder={
                  stockAction === 'receive'
                    ? 'Supplier, purchase reference or other details'
                    : 'Explain why this stock correction is required'
                }
                className="w-full rounded-lg border px-3 py-2 text-sm outline-none"
                style={INPUT_STYLE}
              />
            </div>

            {submitError && (
              <p
                role="alert"
                style={{
                  padding: 'var(--admin-space-sm)',
                  borderRadius: 'var(--ds-radius-lg)',
                  borderWidth: '1px',
                  borderStyle: 'solid',
                  borderColor: 'var(--admin-border-subtle)',
                  background: 'var(--admin-page)',
                  color: 'var(--admin-text-primary)',
                  fontSize: 'var(--admin-size-supporting)',
                  margin: 0,
                }}
              >
                {submitError}
              </p>
            )}

            <div
              className="flex justify-end"
              style={{ gap: 'var(--admin-space-xs)' }}
            >
              <AdminButton
                variant="neutral"
                shape="pill"
                type="button"
                ariaLabel="Cancel"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </AdminButton>
              <AdminButton
                variant="primary"
                shape="pill"
                type="submit"
                ariaLabel={
                  isSubmitting
                    ? 'Saving'
                    : stockAction === 'receive'
                      ? 'Save received stock'
                      : 'Save adjustment'
                }
                loading={isSubmitting}
                disabled={
                  isSubmitting ||
                  inventory.filter((item) => item.is_active).length === 0
                }
              >
                {stockAction === 'receive'
                  ? 'Save received stock'
                  : 'Save adjustment'}
              </AdminButton>
            </div>
          </form>
        </AdminCard>
      </section>
    </div>
  );
}
