import { FiTrash2 } from 'react-icons/fi';
import type { Order } from '../../../features/admin/types/admin.types';

type OrderDetailsFooterProps = {
  order: Order;
  onDelete: (order: Order) => void;
  onClose: () => void;
};

export default function OrderDetailsFooter({
  order,
  onDelete,
  onClose,
}: OrderDetailsFooterProps) {
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
  );
}
