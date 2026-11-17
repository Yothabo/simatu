import type { AdminRow } from '../../../features/admin/types/admin.types';
import {
  LABEL_STYLE,
  MID_VALUE,
} from '../styles/productDetails.styles';

type ProductDetailsMetricsProps = {
  product: AdminRow;
};

export default function ProductDetailsMetrics({
  product,
}: ProductDetailsMetricsProps) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 'var(--admin-space-md)',
        alignItems: 'flex-end',
      }}
    >
      <div>
        <span style={LABEL_STYLE}>Times ordered</span>
        <div style={MID_VALUE}>{String(product.order_count ?? 0)}</div>
      </div>

      <div style={{ textAlign: 'right' }}>
        <span style={LABEL_STYLE}>Sort order</span>
        <div style={MID_VALUE}>{String(product.sort_order ?? 0)}</div>
      </div>
    </div>
  );
}
