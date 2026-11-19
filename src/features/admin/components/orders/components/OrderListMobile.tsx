import AdminItemCard from '../../../../../components/AdminItemCard';
import { formatPrice } from '../../../../../utils/formatPrice';
import type { Order } from '../../../types/admin.types';

type Props = {
  paginatedOrders: Order[];
  onSelectOrder: (order: Order) => void;
};

export default function OrderListMobile({
  paginatedOrders,
  onSelectOrder,
}: Props) {
  return (
    <div className="admin-order-mobile-list flex flex-col gap-6 md:hidden">
      {paginatedOrders.map((order) => {
        const orderDate = new Date(order.created_at).toLocaleDateString(
          'en-ZA',
          {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          },
        );

        return (
          <AdminItemCard
            key={order.id}
            layout="product"
            title={order.customer_name}
            status={order.status}
            price={formatPrice(order.subtotal)}
            meta={orderDate}
            onClick={() => onSelectOrder(order)}
            ariaLabel={`View order from ${order.customer_name}`}
            leftClassName="admin-item-card-order-media"
            statusClassName={
              order.status === 'pending'
                ? 'text-amber-600'
                : order.status === 'cancelled'
                  ? 'text-red-500'
                  : 'text-green-700'
            }
          />
        );
      })}
    </div>
  );
}
