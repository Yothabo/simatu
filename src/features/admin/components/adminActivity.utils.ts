import type { AdminActivity } from '../hooks/adminActivity.types';

export type ActivityPeriod = 'day' | 'month' | 'year';

export function getActivityDescription(activity: AdminActivity): string {
  const metadata = activity.metadata ?? {};
  const productName =
    typeof metadata.product_name === 'string'
      ? metadata.product_name.trim()
      : '';
  const rawOrderNumber =
    typeof metadata.order_number === 'string'
      ? metadata.order_number.trim()
      : '';
  const orderNumber = rawOrderNumber.replace(/^#+/, '');

  return activity.event_type === 'product.created' && productName
    ? `${productName} added`
    : activity.event_type === 'order.received' && orderNumber
      ? `Order #${orderNumber} received`
      : activity.description.replace(/^(Order)\s*#+/i, '$1 #');
}

export function getDateKey(date: Date, period: ActivityPeriod): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  if (period === 'year') return String(year);
  if (period === 'month') return `${year}-${month}`;
  return `${year}-${month}-${day}`;
}

export function getGroupLabel(key: string, period: ActivityPeriod): string {
  if (period === 'year') return key;

  if (period === 'month') {
    const [year, month] = key.split('-').map(Number);
    return new Date(year, month - 1, 1).toLocaleDateString('en-ZA', {
      month: 'long',
      year: 'numeric',
    });
  }

  const [year, month, day] = key.split('-').map(Number);
  return new Date(year, month - 1, day).toLocaleDateString('en-ZA', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function escapeCsvCell(value: unknown): string {
  let text = String(value ?? '');

  if (/^\s*[=+\-@]/.test(text)) {
    text = `'${text}`;
  }

  return `"${text.replace(/"/g, '""')}"`;
}
