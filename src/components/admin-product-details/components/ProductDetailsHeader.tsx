import {
  FiEye,
  FiEyeOff,
  FiTrash2,
  FiX,
} from 'react-icons/fi';
import type { AdminRow } from '../../../features/admin/types/admin.types';
import HeaderIconButton from './HeaderIconButton';

type ProductDetailsHeaderProps = {
  product: AdminRow;
  onClose: () => void;
  onHide: (product: AdminRow) => void;
  onShow: (product: AdminRow) => void;
  onDelete: (product: AdminRow) => void;
};

export default function ProductDetailsHeader({
  product,
  onClose,
  onHide,
  onShow,
  onDelete,
}: ProductDetailsHeaderProps) {
  return (
    <div
      className="relative flex items-center justify-between"
      style={{
        padding: 'var(--admin-space-sm) var(--admin-space-md)',
        paddingRight: 'calc(var(--admin-space-md) + 40px)',
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

      </div>

      {/* Floating close control, inset from the modal's rounded corner. */}
      <div
        style={{
          position: 'absolute',
          top: 'var(--admin-space-sm)',
          right: 'var(--admin-space-sm)',
          zIndex: 2,
        }}
      >
        <HeaderIconButton onClick={onClose} ariaLabel="Close">
          <FiX size={14} aria-hidden="true" />
        </HeaderIconButton>
      </div>
    </div>
  );
}
