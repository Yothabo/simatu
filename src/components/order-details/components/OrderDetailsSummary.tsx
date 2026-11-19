import type { Order } from '../../../features/admin/types/admin.types';
import {
  LABEL_STYLE,
  SMALL_VALUE,
} from '../styles/orderDetails.styles';

type OrderDetailsSummaryProps = {
  order: Order;
  formattedDate: string;
};

export default function OrderDetailsSummary({
  order,
  formattedDate,
}: OrderDetailsSummaryProps) {
  return (
    <>
      {/* Order number + placed date */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr auto',
          gap: 'var(--admin-space-md)',
          alignItems: 'flex-end',
        }}
      >
        <div>
          <span style={LABEL_STYLE}>Order number</span>
          <div style={SMALL_VALUE}>{order.order_number}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <span style={LABEL_STYLE}>Placed</span>
          <div style={SMALL_VALUE}>{formattedDate}</div>
        </div>
      </div>

      {/* Customer name + phone */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 'var(--admin-space-md)',
        }}
      >
        <div>
          <span style={LABEL_STYLE}>Customer</span>
          <div style={SMALL_VALUE}>{order.customer_name}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <span style={LABEL_STYLE}>Phone</span>
          <div style={SMALL_VALUE}>{order.customer_phone}</div>
        </div>
      </div>
    </>
  );
}
