import OrderDetailsModal from '../../../components/OrderDetailsModal';
import ConfirmModal from '../../../shared/components/ConfirmModal';
import type {
  AdminRow,
  Order,
  OrderStatus,
} from '../../../features/admin/types/admin.types';

type Props = {
  viewingOrder: Order | null;
  onCloseViewingOrder: () => void;
  products: (AdminRow & { id: string })[];
  onStatusChange: (order: Order, newStatus: OrderStatus) => void;
  onRequestDelete: (order: Order) => void;

  confirmDeleteOrder: Order | null;
  onConfirmDelete: (order: Order) => void;
  onCancelDelete: () => void;
};

export default function AdminOrderModals({
  viewingOrder,
  onCloseViewingOrder,
  products,
  onStatusChange,
  onRequestDelete,
  confirmDeleteOrder,
  onConfirmDelete,
  onCancelDelete,
}: Props) {
  return (
    <>
      <OrderDetailsModal
        order={viewingOrder}
        products={products}
        onClose={onCloseViewingOrder}
        onStatusChange={onStatusChange}
        onDelete={onRequestDelete}
      />

      <ConfirmModal
        isOpen={!!confirmDeleteOrder}
        title="Delete order permanently?"
        message={
          confirmDeleteOrder
            ? `Order ${confirmDeleteOrder.order_number} will be permanently removed. This cannot be undone.`
            : ''
        }
        confirmText="Delete"
        cancelText="Cancel"
        variant="grey"
        onConfirm={() => {
          if (confirmDeleteOrder) onConfirmDelete(confirmDeleteOrder);
        }}
        onCancel={onCancelDelete}
      />
    </>
  );
}
