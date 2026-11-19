import type { InventoryItem, StorefrontFilter } from '../types';

function csvCell(value: string | number): string {
  const text = String(value);
  return '"' + text.replace(/"/g, '""') + '"';
}

export function exportInventoryCsv(
  items: InventoryItem[],
  storefront: StorefrontFilter,
): void {
  const rows: (string | number)[][] = [
    ['SIMATU INVENTORY EXPORT'],
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
    ['Product', 'SKU', 'On hand', 'Reserved', 'Available', 'Supplier cost'],
    ...items.map((item) => [
      item.product_name,
      item.sku ?? '',
      Number(item.on_hand_quantity),
      Number(item.reserved_quantity),
      Number(item.available_quantity),
      item.supplier_cost === null ? '' : Number(item.supplier_cost),
    ]),
  ];

  const csv = rows.map((row) => row.map(csvCell).join(',')).join('\r\n');

  const blob = new Blob(['\uFEFF', csv], {
    type: 'text/csv;charset=utf-8;',
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const date = new Date().toISOString().slice(0, 10);
  const storeName = storefront === 'all' ? 'all-stores' : storefront;

  link.href = url;
  link.download = `inventory-${storeName}-${date}.csv`;

  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
