import {
  FiEye,
  FiEyeOff,
  FiTrash2,
  FiEdit2,
  FiX,
} from 'react-icons/fi';
import { formatPrice } from '../utils/formatPrice';
import { getCategoryTheme } from '../utils/categoryTheme';
import Modal from './Modal';
import type { AdminRow } from '../features/admin/types/admin.types';

type AdminProductDetailsModalProps = {
  product: AdminRow | null;
  onClose: () => void;
  onEdit: (product: AdminRow) => void;
  onHide: (product: AdminRow) => void;
  onShow: (product: AdminRow) => void;
  onDelete: (product: AdminRow) => void;
};

const LABEL_STYLE = {
  fontSize: 'var(--admin-size-micro)',
  fontWeight: 'var(--admin-weight-medium)' as const,
  color: 'var(--admin-text-faint)',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.08em',
  lineHeight: 1.2,
  display: 'block',
  marginBottom: 'var(--admin-space-xxs)',
};

const BIG_VALUE = {
  fontSize: '32px',
  fontWeight: 'var(--admin-weight-semibold)' as const,
  color: 'var(--admin-text-primary)',
  lineHeight: 1.05,
  fontVariantNumeric: 'tabular-nums' as const,
};

const MID_VALUE = {
  fontSize: 'var(--admin-size-section-title)',
  fontWeight: 'var(--admin-weight-semibold)' as const,
  color: 'var(--admin-text-primary)',
  lineHeight: 1.15,
  fontVariantNumeric: 'tabular-nums' as const,
};

const SMALL_VALUE = {
  fontSize: 'var(--admin-size-body)',
  fontWeight: 'var(--admin-weight-medium)' as const,
  color: 'var(--admin-text-primary)',
  lineHeight: 1.4,
};

function HeaderIconButton({
  onClick,
  ariaLabel,
  tone = 'neutral',
  children,
}: {
  onClick: () => void;
  ariaLabel: string;
  tone?: 'neutral' | 'danger';
  children: React.ReactNode;
}) {
  const isDanger = tone === 'danger';
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      style={{
        width: '32px',
        height: '32px',
        borderRadius: '50%',
        borderWidth: '1px',
        borderStyle: 'solid',
        borderColor: isDanger
          ? 'var(--admin-status-red)'
          : 'var(--admin-border-strong)',
        backgroundColor: 'var(--admin-surface)',
        color: isDanger
          ? 'var(--admin-status-red)'
          : 'var(--admin-text-secondary)',
        cursor: 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        transition: 'background-color 150ms ease, color 150ms ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = isDanger
          ? 'var(--admin-status-red)'
          : 'var(--admin-surface-subtle)';
        e.currentTarget.style.color = isDanger
          ? 'var(--admin-on-accent)'
          : 'var(--admin-text-primary)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'var(--admin-surface)';
        e.currentTarget.style.color = isDanger
          ? 'var(--admin-status-red)'
          : 'var(--admin-text-secondary)';
      }}
    >
      {children}
    </button>
  );
}

export default function AdminProductDetailsModal({
  product,
  onClose,
  onEdit,
  onHide,
  onShow,
  onDelete,
}: AdminProductDetailsModalProps) {
  if (!product) return null;

  const theme = getCategoryTheme(product.category);
  const addedDate = new Date(product.created_at).toLocaleDateString('en-ZA', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  return (
    <Modal isOpen={!!product} onClose={onClose} scrollable={false}>
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
        <div
          className="flex items-center justify-between"
          style={{
            padding: 'var(--admin-space-sm) var(--admin-space-md)',
            borderBottom: '1px solid var(--admin-border-subtle)',
            flexShrink: 0,
            gap: 'var(--admin-space-md)',
          }}
        >
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              paddingBlock: 'var(--admin-space-xxs)',
              paddingInline: 'var(--admin-space-sm)',
              borderRadius: 'var(--ds-radius-full)',
              backgroundColor: product.is_active
                ? 'var(--admin-status-green)'
                : 'var(--admin-status-red)',
              color: 'var(--admin-on-accent)',
              fontSize: 'var(--admin-size-micro)',
              fontWeight: 'var(--admin-weight-semibold)',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              flexShrink: 0,
            }}
          >
            {product.is_active ? 'Active' : 'Inactive'}
          </span>

          <div
            className="flex items-center"
            style={{ gap: 'var(--admin-space-xs)', flexShrink: 0 }}
          >
            <HeaderIconButton
              onClick={() =>
                product.is_active ? onHide(product) : onShow(product)
              }
              ariaLabel={product.is_active ? 'Hide product' : 'Show product'}
            >
              {product.is_active ? (
                <FiEyeOff size={14} aria-hidden="true" />
              ) : (
                <FiEye size={14} aria-hidden="true" />
              )}
            </HeaderIconButton>

            <HeaderIconButton
              onClick={() => onDelete(product)}
              ariaLabel="Delete product"
              tone="danger"
            >
              <FiTrash2 size={14} aria-hidden="true" />
            </HeaderIconButton>

            <div
              style={{
                width: '1px',
                height: '20px',
                backgroundColor: 'var(--admin-border-subtle)',
                marginInline: 'var(--admin-space-xxs)',
              }}
            />

            <HeaderIconButton onClick={onClose} ariaLabel="Close">
              <FiX size={14} aria-hidden="true" />
            </HeaderIconButton>
          </div>
        </div>

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
          {/* Image */}
          <div
            style={{
              width: '100%',
              height: '220px',
              borderRadius: 'var(--ds-radius-lg)',
              overflow: 'hidden',
              backgroundColor: product.is_active
                ? undefined
                : 'var(--admin-surface-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            className={product.is_active ? theme.placeholderColor : ''}
          >
            {product.image_url && (
              <img
                src={product.image_url}
                alt={product.name}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  padding: 'var(--admin-space-md)',
                }}
              />
            )}
          </div>

          {/* Name */}
          <h2
            style={{
              fontSize: 'var(--admin-size-section-title)',
              fontWeight: 'var(--admin-weight-semibold)',
              color: 'var(--admin-text-primary)',
              margin: 0,
              lineHeight: 1.25,
            }}
          >
            {product.name}
          </h2>

          {/* Row 1 — Price | Supplier cost */}
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

          {/* Row 2 — Times ordered | Sort order */}
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

          {/* Row 3 — Category | Subcategory | SKU */}
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

          {/* Row 4 — Added | Sizes */}
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

          {/* Row 5 — Description */}
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
        </div>

        {/* Sticky footer — Close + Edit */}
        <div
          className="flex"
          style={{
            padding: 'var(--admin-space-md) var(--admin-space-lg)',
            borderTop: '1px solid var(--admin-border-subtle)',
            flexShrink: 0,
            gap: 'var(--admin-space-xs)',
          }}
        >
          <button
            type="button"
            onClick={onClose}
            style={{
              flex: '1 1 0',
              height: '44px',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 'var(--ds-radius-xl)',
              borderWidth: '1px',
              borderStyle: 'solid',
              borderColor: 'var(--admin-border-strong)',
              backgroundColor: 'var(--admin-surface)',
              color: 'var(--admin-text-secondary)',
              fontSize: 'var(--admin-size-supporting)',
              fontWeight: 'var(--admin-weight-medium)',
              cursor: 'pointer',
            }}
          >
            Close
          </button>
          <button
            type="button"
            onClick={() => {
              onClose();
              onEdit(product);
            }}
            style={{
              flex: '1 1 0',
              height: '44px',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 'var(--admin-space-xs)',
              borderRadius: 'var(--ds-radius-xl)',
              borderWidth: '1px',
              borderStyle: 'solid',
              borderColor: 'var(--admin-text-primary)',
              backgroundColor: 'var(--admin-text-primary)',
              color: 'var(--admin-bg)',
              fontSize: 'var(--admin-size-supporting)',
              fontWeight: 'var(--admin-weight-medium)',
              cursor: 'pointer',
            }}
          >
            <FiEdit2 size={14} aria-hidden="true" />
            Edit
          </button>
        </div>
      </div>
    </Modal>
  );
}
