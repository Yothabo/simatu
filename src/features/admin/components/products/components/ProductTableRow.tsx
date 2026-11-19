import { formatPrice } from '../../../../../shared/utilities/formatPrice';
import { getCategoryTheme } from '../../../../../systems/storefront/core/configuration/categoryTheme';
import type { AdminRow } from '../../../types/admin.types';

type Props = {
  product: AdminRow;
  onSelectProduct: (product: AdminRow) => void;
};

export default function ProductTableRow({
  product,
  onSelectProduct,
}: Props) {
  const theme = getCategoryTheme(product.category);
  const isActive = product.is_active;

  return (
    <tr
      onClick={() => onSelectProduct(product)}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onSelectProduct(product);
        }
      }}
      tabIndex={0}
      role="button"
      aria-label={`View product ${product.name}`}
      style={{
        cursor: 'pointer',
        opacity: isActive ? 1 : 0.6,
        borderBottom:
          '1px solid var(--admin-border-subtle)',
        transition: 'background-color 150ms ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor =
          'var(--admin-surface-subtle)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'transparent';
      }}
    >
      <td
        style={{
          padding: 'var(--admin-space-sm) var(--admin-space-md)',
        }}
      >
        <div
          style={{
            width: '40px',
            height: '40px',
            borderRadius: 'var(--ds-radius-sm)',
            backgroundColor: isActive
              ? undefined
              : 'var(--admin-surface-subtle)',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          className={isActive ? theme.placeholderColor : ''}
        >
          {product.image_url && (
            <img
              src={product.image_url}
              alt=""
              loading="lazy"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                padding: '2px',
              }}
            />
          )}
        </div>
      </td>
      <td
        style={{
          padding: 'var(--admin-space-sm) var(--admin-space-md)',
          maxWidth: '260px',
        }}
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
          {product.name}
        </div>
      </td>
      <td
        style={{
          padding: 'var(--admin-space-sm) var(--admin-space-md)',
          maxWidth: '200px',
        }}
      >
        <div
          style={{
            fontSize: 'var(--admin-size-body)',
            color: 'var(--admin-text-secondary)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {product.category}
          {product.subcategory
            ? ` · ${product.subcategory}`
            : ''}
        </div>
      </td>
      <td
        style={{
          padding: 'var(--admin-space-sm) var(--admin-space-md)',
          textAlign: 'right',
          fontSize: 'var(--admin-size-body)',
          color: 'var(--admin-text-primary)',
          fontVariantNumeric: 'tabular-nums',
          whiteSpace: 'nowrap',
        }}
      >
        {formatPrice(product.price)}
      </td>
      <td
        style={{
          padding: 'var(--admin-space-sm) var(--admin-space-md)',
          fontSize: 'var(--admin-size-body)',
          color: isActive
            ? 'var(--admin-text-secondary)'
            : 'var(--admin-status-red)',
          whiteSpace: 'nowrap',
        }}
      >
        {isActive ? 'Active' : 'Inactive'}
      </td>
    </tr>
  );
}
