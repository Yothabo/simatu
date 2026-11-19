import {
  FiCheck,
  FiTruck,
  FiCircle,
} from 'react-icons/fi';
import type { Order } from '../../../features/admin/types/admin.types';
import { LABEL_STYLE } from '../styles/orderDetails.styles';

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
      <span
        style={{
          minWidth: 0,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {children}
      </span>
    </button>
  );
}

type OrderWorkflowActionsProps = {
  order: Order;
  onStatusChange: (order: Order, newStatus: Order['status']) => void;
};

export default function OrderWorkflowActions({
  order,
  onStatusChange,
}: OrderWorkflowActionsProps) {
  if (order.status !== 'pending' && order.status !== 'confirmed') {
    return null;
  }

  return (
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
  );
}
