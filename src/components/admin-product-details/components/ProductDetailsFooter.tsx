import { FiEdit2 } from 'react-icons/fi';
import type { AdminRow } from '../../../features/admin/types/admin.types';

type ProductDetailsFooterProps = {
  product: AdminRow;
  onClose: () => void;
  onEdit: (product: AdminRow) => void;
};

export default function ProductDetailsFooter({
  product,
  onClose,
  onEdit,
}: ProductDetailsFooterProps) {
  return (
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
  );
}
