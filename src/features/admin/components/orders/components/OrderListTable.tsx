import { formatPrice } from '../../../../../shared/utilities/formatPrice';
import type { Order } from '../../../types/admin.types';

type Props = {
  paginatedOrders: Order[];
  onSelectOrder: (order: Order) => void;
};

export default function OrderListTable({
  paginatedOrders,
  onSelectOrder,
}: Props) {
  return (
    <div className="hidden md:block admin-orders-table-scroll">
      <table className="admin-orders-table">
        <thead>
          <tr>
            <th scope="col">Order</th>
            <th scope="col">Customer</th>
            <th scope="col">Date</th>
            <th scope="col" className="admin-orders-table-number">Items</th>
            <th scope="col" className="admin-orders-table-number">Total</th>
            <th scope="col">Status</th>
          </tr>
        </thead>
        <tbody>
          {paginatedOrders.map((order) => {
            const totalQuantity = order.items.reduce(
              (total, item) => total + item.qty,
              0,
            );

            return (
              <tr
                key={order.id}
                onClick={() => onSelectOrder(order)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    onSelectOrder(order);
                  }
                }}
                tabIndex={0}
                role="button"
                aria-label={`View order ${order.order_number} from ${order.customer_name}`}
              >
                <td className="admin-orders-table-order">{order.order_number}</td>
                <td className="admin-orders-table-customer">{order.customer_name}</td>
                <td>
                  {new Date(order.created_at).toLocaleDateString('en-ZA', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </td>
                <td className="admin-orders-table-number">
                  {totalQuantity} {totalQuantity === 1 ? 'item' : 'items'}
                </td>
                <td className="admin-orders-table-total">{formatPrice(order.subtotal)}</td>
                <td>
                  <span className={`admin-order-status admin-order-status-${order.status}`}>
                    {order.status}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
