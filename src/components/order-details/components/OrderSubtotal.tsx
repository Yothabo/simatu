import { formatPrice } from '../../../shared/utilities/formatPrice';
import type { Order } from '../../../features/admin/types/admin.types';
import { LABEL_STYLE } from '../styles/orderDetails.styles';

type OrderSubtotalProps = {
  subtotal: Order['subtotal'];
};

export default function OrderSubtotal({ subtotal }: OrderSubtotalProps) {
  return (
    <div
      className="flex items-baseline justify-between"
      style={{ gap: 'var(--admin-space-md)' }}
    >
      <span style={LABEL_STYLE}>Subtotal</span>
      <div
        style={{
          fontSize: 'var(--admin-size-section-title)',
          fontWeight: 'var(--admin-weight-semibold)',
          color: 'var(--admin-text-primary)',
          lineHeight: 1.1,
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {formatPrice(subtotal)}
      </div>
    </div>
  );
}
