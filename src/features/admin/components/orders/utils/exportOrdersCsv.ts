import type { Order, Storefront } from '../../../types/admin.types';
import { csvCell } from '../../../utils/csv';

export function exportOrdersCsv(
  orders: Order[],
  storefront: 'all' | Storefront,
) {
  const rows: (string | number)[][] = [
    ['SIMATU ORDERS EXPORT'],
    [
      'Store',
      storefront === 'all'
        ? 'All stores'
        : storefront === 'yotaabo'
          ? 'Yotaabo'
          : 'Poshies',
    ],
    [
      'Generated at',
      new Date().toLocaleString('en-ZA', {
        timeZone: 'Africa/Johannesburg',
      }),
    ],
    [],
    ['Order number', 'Customer', 'Phone', 'Date', 'Items', 'Subtotal', 'Status'],
    ...orders.map((order) => {
      const totalQty = order.items.reduce((sum, item) => sum + item.qty, 0);
      return [
        order.order_number,
        order.customer_name,
        order.customer_phone,
        new Date(order.created_at).toISOString().slice(0, 10),
        totalQty,
        order.subtotal,
        order.status,
      ];
    }),
  ];

  const csv = rows
    .map((row) => row.map(csvCell).join(','))
    .join('\r\n');

  const blob = new Blob(['\uFEFF', csv], {
    type: 'text/csv;charset=utf-8;',
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const date = new Date().toISOString().slice(0, 10);
  const storeName = storefront === 'all' ? 'all-stores' : storefront;

  link.href = url;
  link.download = `orders-${storeName}-${date}.csv`;

  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
