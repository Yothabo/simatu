import { FiX } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import type { Order } from '../../../features/admin/types/admin.types';
import HeaderIconButton from '../../admin-product-details/components/HeaderIconButton';

type OrderDetailsHeaderProps = {
  order: Order;
  badge: {
    bg: string;
    color: string;
  };
  onClose: () => void;
  onWhatsApp: () => void;
};

export default function OrderDetailsHeader({
  order,
  badge,
  onClose,
  onWhatsApp,
}: OrderDetailsHeaderProps) {
  return (
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
        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
      </span>

      <div
        className="flex items-center"
        style={{ gap: 'var(--admin-space-xs)', flexShrink: 0 }}
      >
        <HeaderIconButton
          onClick={onWhatsApp}
          ariaLabel="Contact customer on WhatsApp"
        >
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
  );
}
