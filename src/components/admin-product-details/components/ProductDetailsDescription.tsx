import type { AdminRow } from '../../../features/admin/types/admin.types';
import { LABEL_STYLE } from '../styles/productDetails.styles';

type ProductDetailsDescriptionProps = {
  product: AdminRow;
};

export default function ProductDetailsDescription({
  product,
}: ProductDetailsDescriptionProps) {
  return (
    <div>
      <span style={LABEL_STYLE}>Description</span>
      <div
        style={{
          fontSize: 'var(--admin-size-body)',
          fontWeight: 'var(--admin-weight-normal)',
          color: product.description
            ? 'var(--admin-text-primary)'
            : 'var(--admin-text-faint)',
          lineHeight: 1.6,
        }}
      >
        {product.description || 'No description for this product.'}
      </div>
    </div>
  );
}
