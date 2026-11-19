import type { AdminRow, Storefront } from '../../../types/admin.types';
import { csvCell } from '../../../utils/csv';

export function exportProductsCsv(
  products: AdminRow[],
  storefront: 'all' | Storefront,
) {
  const rows: (string | number)[][] = [
    ['SIMATU PRODUCTS EXPORT'],
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
    [
      'Name',
      'SKU',
      'Category',
      'Subcategory',
      'Price',
      'Supplier cost',
      'Status',
      'Created',
    ],
    ...products.map((product) => [
      product.name,
      product.sku ?? '',
      product.category,
      product.subcategory,
      product.price,
      product.supplier_cost ?? '',
      product.is_active ? 'Active' : 'Hidden',
      product.created_at.slice(0, 10),
    ]),
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
  link.download = `products-${storeName}-${date}.csv`;

  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
