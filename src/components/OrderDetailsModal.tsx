import { useState } from 'react';
import Modal from './Modal';
import type { Order } from '../features/admin/types/admin.types';
import OrderDetailsHeader from './order-details/components/OrderDetailsHeader';
import OrderDetailsSummary from './order-details/components/OrderDetailsSummary';
import OrderItems, {
  type PreviewProduct,
} from './order-details/components/OrderItems';
import OrderSubtotal from './order-details/components/OrderSubtotal';
import OrderWorkflowActions from './order-details/components/OrderWorkflowActions';
import OrderDetailsFooter from './order-details/components/OrderDetailsFooter';
import OrderProductPreview from './order-details/components/OrderProductPreview';

type OrderDetailsModalProps = {
  order: Order | null;
  products: PreviewProduct[];
  onClose: () => void;
  onStatusChange: (order: Order, newStatus: Order['status']) => void;
  onDelete: (order: Order) => void;
};

const STATUS_BADGE: Record<
  Order['status'],
  { bg: string; color: string }
> = {
  pending: {
    bg: 'var(--admin-status-amber)',
    color: 'var(--admin-on-accent)',
  },
  confirmed: {
    bg: 'var(--admin-accent)',
    color: 'var(--admin-on-accent)',
  },
  delivered: {
    bg: 'var(--admin-status-green)',
    color: 'var(--admin-on-accent)',
  },
  cancelled: {
    bg: 'var(--admin-status-red)',
    color: 'var(--admin-on-accent)',
  },
};

export default function OrderDetailsModal({
  order,
  products,
  onClose,
  onStatusChange,
  onDelete,
}: OrderDetailsModalProps) {
  const [selectedProduct, setSelectedProduct] = useState<PreviewProduct | null>(
    null,
  );

  if (!order) return null;

  const formattedDate = new Date(order.created_at).toLocaleDateString('en-ZA', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const badge = STATUS_BADGE[order.status];

  const handleWhatsApp = () => {
    window.open(
      `https://wa.me/${order.customer_phone.replace(/\D/g, '')}`,
      '_blank',
      'noopener,noreferrer',
    );
  };

  return (
    <Modal isOpen={!!order} onClose={onClose} maxWidth="max-w-2xl" scrollable={false}>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: '85vh',
          backgroundColor: 'var(--admin-surface)',
          borderRadius: 'var(--ds-radius-lg)',
          overflow: 'hidden',
        }}
      >
        {/* Sticky header */}
        <OrderDetailsHeader
          order={order}
          badge={badge}
          onClose={onClose}
          onWhatsApp={handleWhatsApp}
        />

        {/* Scrollable body */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--admin-space-lg)',
            padding: 'var(--admin-space-lg)',
            overflowY: 'auto',
            flex: 1,
            minHeight: 0,
          }}
        >
          <OrderDetailsSummary
            order={order}
            formattedDate={formattedDate}
          />

          <OrderItems
            orderId={order.id}
            items={order.items}
            products={products}
            onSelectProduct={setSelectedProduct}
          />

          <OrderSubtotal subtotal={order.subtotal} />

          <OrderWorkflowActions
            order={order}
            onStatusChange={onStatusChange}
          />
        </div>

        {/* Sticky footer */}
        <OrderDetailsFooter
          order={order}
          onDelete={onDelete}
          onClose={onClose}
        />
      </div>

      <OrderProductPreview
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
    </Modal>
  );
}
