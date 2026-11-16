import { useState } from 'react';
import { FiTrash2, FiCheck, FiX, FiTruck, FiCircle } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import { formatPrice } from '../utils/formatPrice';
import Modal from './Modal';
import ProductModal from './ProductModal';
import { getCategoryTheme } from '../utils/categoryTheme';
import type { AdminProduct } from '../features/admin/components/AdminProductForm';
import type { Order } from '../features/admin/types/admin.types';

type PreviewProduct = AdminProduct & { id: string };

type OrderDetailsModalProps = {
  order: Order | null;
  products: PreviewProduct[];
  onClose: () => void;
  onStatusChange: (order: Order, newStatus: Order['status']) => void;
  onDelete: (order: Order) => void;
};

const STATUS_LABELS: Record<Order['status'], string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
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

function WorkflowButton({
  onClick,
  tone,
  icon,
  children,
}: {
  onClick: () => void;
  tone: 'success' | 'primary' | 'danger';
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  const toneStyles = {
    success: {
      bg: 'var(--admin-status-green)',
      border: 'var(--admin-status-green)',
      color: 'var(--admin-on-accent)',
    },
    primary: {
      bg: 'var(--admin-text-primary)',
      border: 'var(--admin-text-primary)',
      color: 'var(--admin-bg)',
    },
    danger: {
      bg: 'transparent',
      border: 'var(--admin-status-red)',
      color: 'var(--admin-status-red)',
    },
  } as const;

  const s = toneStyles[tone];

  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        flex: '1 1 0',
        minWidth: 0,
        height: '40px',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 'var(--admin-space-xs)',
        paddingInline: 'var(--admin-space-sm)',
        borderRadius: 'var(--ds-radius-lg)',
        borderWidth: '1px',
        borderStyle: 'solid',
        borderColor: s.border,
        backgroundColor: s.bg,
        color: s.color,
        fontSize: 'var(--admin-size-supporting)',
        fontWeight: 'var(--admin-weight-medium)',
        cursor: 'pointer',
      }}
    >
      {icon}
      <span style={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {children}
      </span>
    </button>
  );
}

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
              backgroundColor: badge.bg,
              color: badge.color,
              fontSize: 'var(--admin-size-micro)',
              fontWeight: 'var(--admin-weight-semibold)',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              flexShrink: 0,
            }}
          >
            {STATUS_LABELS[order.status]}
          </span>

          <div
            className="flex items-center"
            style={{ gap: 'var(--admin-space-xs)', flexShrink: 0 }}
          >
            <HeaderIconButton onClick={handleWhatsApp} ariaLabel="Contact customer on WhatsApp">
              <FaWhatsapp size={14} aria-hidden="true" />
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

          {/* Items */}
          <div>
            <span style={LABEL_STYLE}>Items</span>
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
              {order.items.map((item, index) => {
                const matchedProduct = products.find(
                  (product) =>
                    product.name.trim().toLowerCase() ===
                    item.name.trim().toLowerCase(),
                );

                const isClickable = Boolean(matchedProduct);

                return (
                  <div
                    key={`${order.id}-${index}`}
                    onClick={
                      matchedProduct
                        ? () => setSelectedProduct(matchedProduct)
                        : undefined
                    }
                    role={isClickable ? 'button' : undefined}
                    tabIndex={isClickable ? 0 : undefined}
                    onKeyDown={
                      matchedProduct
                        ? (e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              setSelectedProduct(matchedProduct);
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
                            e.currentTarget.style.backgroundColor =
                              'transparent';
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

          {/* Subtotal */}
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
              {formatPrice(order.subtotal)}
            </div>
          </div>

          {/* Workflow actions — only what's valid for the current status */}
          {(order.status === 'pending' || order.status === 'confirmed') && (
            <div>
              <span style={LABEL_STYLE}>Actions</span>
              <div
                className="flex flex-wrap"
                style={{
                  gap: 'var(--admin-space-xs)',
                  marginTop: 'var(--admin-space-xs)',
                }}
              >
                {order.status === 'pending' && (
                  <WorkflowButton
                    onClick={() => onStatusChange(order, 'confirmed')}
                    tone="primary"
                    icon={<FiCheck size={14} aria-hidden="true" />}
                  >
                    Confirm order
                  </WorkflowButton>
                )}
                {order.status === 'confirmed' && (
                  <WorkflowButton
                    onClick={() => onStatusChange(order, 'delivered')}
                    tone="success"
                    icon={<FiTruck size={14} aria-hidden="true" />}
                  >
                    Mark delivered
                  </WorkflowButton>
                )}
                <WorkflowButton
                  onClick={() => onStatusChange(order, 'cancelled')}
                  tone="danger"
                  icon={<FiCircle size={14} aria-hidden="true" />}
                >
                  Cancel order
                </WorkflowButton>
              </div>
            </div>
          )}
        </div>

        {/* Sticky footer */}
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
            onClick={() => onDelete(order)}
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
              borderColor: 'var(--admin-status-red)',
              backgroundColor: 'transparent',
              color: 'var(--admin-status-red)',
              fontSize: 'var(--admin-size-supporting)',
              fontWeight: 'var(--admin-weight-medium)',
              cursor: 'pointer',
            }}
          >
            <FiTrash2 size={14} aria-hidden="true" />
            Delete
          </button>
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
              borderColor: 'var(--admin-text-primary)',
              backgroundColor: 'var(--admin-text-primary)',
              color: 'var(--admin-bg)',
              fontSize: 'var(--admin-size-supporting)',
              fontWeight: 'var(--admin-weight-medium)',
              cursor: 'pointer',
            }}
          >
            Close
          </button>
        </div>
      </div>

      <ProductModal
        product={
          selectedProduct
            ? {
                id: selectedProduct.id,
                name: selectedProduct.name,
                price: String(selectedProduct.price),
                description: selectedProduct.description,
                image_url: selectedProduct.image_url,
              }
            : null
        }
        bgColor="bg-white"
        placeholderColor={
          selectedProduct
            ? getCategoryTheme(selectedProduct.category).placeholderColor
            : ''
        }
        accentColor={
          selectedProduct
            ? getCategoryTheme(selectedProduct.category).accentColor
            : 'text-[#8aa89b]'
        }
        isDark={false}
        mode="preview"
        onClose={() => setSelectedProduct(null)}
      />
    </Modal>
  );
}
