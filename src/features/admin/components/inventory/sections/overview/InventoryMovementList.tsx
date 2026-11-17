import {
  AdminEmptyState,
  AdminRow,
  AdminText,
} from '../../../../../../design-system/components';
import type { InventoryMovement } from '../../types';
import { FiActivity } from 'react-icons/fi';

type Props = {
  movements: InventoryMovement[];
};

export default function InventoryMovementList({ movements }: Props) {
  if (movements.length === 0) {
    return (
      <p
        style={{
          padding: 'var(--admin-space-2xl) 0',
          textAlign: 'center',
          fontSize: 'var(--admin-size-supporting)',
          color: 'var(--admin-text-tertiary)',
          margin: 0,
        }}
      >
        No stock movements match these filters.
      </p>
    );
  }

  return (
    <div className="w-full self-stretch text-left">
      {movements.slice(0, 8).map((movement, index) => (
        <AdminRow
          key={movement.id}
          columns="minmax(0, 1fr) auto"
          border={index > 0}
        >
          <div className="min-w-0">
            <AdminText
              variant="body"
              as="p"
              truncate
              style={{
                fontWeight: 'var(--admin-weight-medium)',
              }}
            >
              {movement.product_name}
            </AdminText>
            <AdminText variant="micro" as="p">
              {movement.product_sku
                ? `SKU: ${movement.product_sku} · `
                : ''}
              {movement.movement_type.replace(/_/g, ' ')}
              {movement.reason ? ` · ${movement.reason}` : ''}
            </AdminText>
          </div>
          <div style={{ textAlign: 'right' }}>
            <AdminText
              variant="body"
              as="p"
              numeric
              style={{
                fontWeight: 'var(--admin-weight-semibold)',
              }}
            >
              {movement.quantity_delta > 0 ? '+' : ''}
              {movement.quantity_delta}
            </AdminText>
            <AdminText variant="micro" as="p">
              {new Date(movement.created_at).toLocaleString('en-ZA')}
            </AdminText>
          </div>
        </AdminRow>
      ))}
    </div>
  );
}
