import type { AdminRow } from '../../../features/admin/types/admin.types';
import { formatPrice } from '../../../shared/utilities/formatPrice';
import {
  BIG_VALUE,
  LABEL_STYLE,
} from '../styles/productDetails.styles';

type ProductDetailsPricingProps = {
  product: AdminRow;
};

export default function ProductDetailsPricing({
  product,
}: ProductDetailsPricingProps) {
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
        <span style={LABEL_STYLE}>Price</span>
        <div style={BIG_VALUE}>{formatPrice(product.price)}</div>
      </div>

      <div style={{ textAlign: 'right' }}>
        <span style={LABEL_STYLE}>Supplier cost</span>
        <div
          style={{
            ...BIG_VALUE,
            color:
              product.supplier_cost != null
                ? 'var(--admin-text-primary)'
                : 'var(--admin-text-faint)',
          }}
        >
          {product.supplier_cost != null
            ? formatPrice(product.supplier_cost)
            : 'Not set'}
        </div>
      </div>
    </div>
  );
}
