import { formatPrice } from '../../../shared/utilities/formatPrice';
import type { AdminProduct } from '../../../features/admin/components/AdminProductForm';

export type PreviewProduct = AdminProduct & { id: string };

type OrderItem = {
  name: string;
  qty: number;
  price: number;
};

type OrderItemsProps = {
  orderId: string;
  items: OrderItem[];
  products: PreviewProduct[];
  onSelectProduct: (product: PreviewProduct) => void;
};

export default function OrderItems({
  orderId,
  items,
  products,
  onSelectProduct,
}: OrderItemsProps) {
  return (
    <div>
      <span
        style={{
          fontSize: 'var(--admin-size-micro)',
          fontWeight: 'var(--admin-weight-medium)',
          color: 'var(--admin-text-faint)',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          lineHeight: 1.2,
          display: 'block',
          marginBottom: 'var(--admin-space-xxs)',
        }}
      >
        Items
      </span>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          borderWidth: '1px',
          borderStyle: 'solid',
          borderColor: 'var(--admin-border-subtle)',
          borderRadius: 'var(--ds-radius-lg)',
          overflow: 'hidden',
          marginTop: 'var(--admin-space-xs)',
        }}
      >
        {items.map((item, index) => {
          const matchedProduct = products.find(
            (product) =>
              product.name.trim().toLowerCase() ===
              item.name.trim().toLowerCase(),
          );

          const isClickable = Boolean(matchedProduct);

          return (
            <div
              key={`${orderId}-${index}`}
              onClick={
                matchedProduct
                  ? () => onSelectProduct(matchedProduct)
                  : undefined
              }
              role={isClickable ? 'button' : undefined}
              tabIndex={isClickable ? 0 : undefined}
              onKeyDown={
                matchedProduct
                  ? (e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        onSelectProduct(matchedProduct);
                      }
                    }
                  : undefined
              }
              style={{
                display: 'grid',
                gridTemplateColumns: 'minmax(0, 1fr) auto auto',
                alignItems: 'center',
                gap: 'var(--admin-space-md)',
                padding: 'var(--admin-space-sm) var(--admin-space-md)',
                borderTop:
                  index > 0
                    ? '1px solid var(--admin-border-subtle)'
                    : 'none',
                cursor: isClickable ? 'pointer' : 'default',
                transition: 'background-color 150ms ease',
              }}
              onMouseEnter={
                isClickable
                  ? (e) => {
                      e.currentTarget.style.backgroundColor =
                        'var(--admin-surface-subtle)';
                    }
                  : undefined
              }
              onMouseLeave={
                isClickable
                  ? (e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }
                  : undefined
              }
            >
              <div
                style={{
                  fontSize: 'var(--admin-size-body)',
                  fontWeight: 'var(--admin-weight-medium)',
                  color: 'var(--admin-text-primary)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {item.name}
              </div>

              <div
                style={{
                  fontSize: 'var(--admin-size-supporting)',
                  color: 'var(--admin-text-secondary)',
                  fontVariantNumeric: 'tabular-nums',
                  whiteSpace: 'nowrap',
                }}
              >
                {item.qty} × {formatPrice(item.price)}
              </div>

              <div
                style={{
                  fontSize: 'var(--admin-size-body)',
                  fontWeight: 'var(--admin-weight-semibold)',
                  color: 'var(--admin-text-primary)',
                  fontVariantNumeric: 'tabular-nums',
                  whiteSpace: 'nowrap',
                  textAlign: 'right',
                  minWidth: '80px',
                }}
              >
                {formatPrice(item.price * item.qty)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
