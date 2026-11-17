import type { AdminRow } from '../../../features/admin/types/admin.types';
import {
  LABEL_STYLE,
  SMALL_VALUE,
} from '../styles/productDetails.styles';

type ProductDetailsAttributesProps = {
  product: AdminRow;
  addedDate: string;
};

export default function ProductDetailsAttributes({
  product,
  addedDate,
}: ProductDetailsAttributesProps) {
  return (
    <>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          gap: 'var(--admin-space-md)',
        }}
      >
        <div style={{ textAlign: 'left' }}>
          <span style={LABEL_STYLE}>Category</span>
          <div style={SMALL_VALUE}>{product.category}</div>
        </div>

        <div style={{ textAlign: 'center' }}>
          <span style={LABEL_STYLE}>Subcategory</span>
          <div style={SMALL_VALUE}>{product.subcategory}</div>
        </div>

        <div style={{ textAlign: 'right' }}>
          <span style={LABEL_STYLE}>SKU</span>
          <div
            style={{
              ...SMALL_VALUE,
              color: product.sku
                ? 'var(--admin-text-primary)'
                : 'var(--admin-text-faint)',
            }}
          >
            {product.sku || 'Not assigned'}
          </div>
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 'var(--admin-space-md)',
          alignItems: 'flex-end',
        }}
      >
        <div>
          <span style={LABEL_STYLE}>Added</span>
          <div style={SMALL_VALUE}>{addedDate}</div>
        </div>

        <div style={{ textAlign: 'right' }}>
          <span style={LABEL_STYLE}>Sizes</span>
          {product.sizes && product.sizes.length > 0 ? (
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 'var(--admin-space-xs)',
                justifyContent: 'flex-end',
              }}
            >
              {product.sizes.map((size) => (
                <span
                  key={size}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minWidth: '40px',
                    paddingBlock: 'var(--admin-space-xs)',
                    paddingInline: 'var(--admin-space-sm)',
                    borderRadius: 'var(--ds-radius-lg)',
                    borderWidth: '1px',
                    borderStyle: 'solid',
                    borderColor: 'var(--admin-border-strong)',
                    backgroundColor: 'var(--admin-surface)',
                    color: 'var(--admin-text-primary)',
                    fontSize: 'var(--admin-size-body)',
                    fontWeight: 'var(--admin-weight-semibold)',
                  }}
                >
                  {size}
                </span>
              ))}
            </div>
          ) : (
            <div
              style={{
                fontSize: 'var(--admin-size-body)',
                color: 'var(--admin-text-faint)',
              }}
            >
              No sizes defined
            </div>
          )}
        </div>
      </div>
    </>
  );
}
