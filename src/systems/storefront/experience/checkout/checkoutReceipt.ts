import type { CreatedOrder } from './types';

export const getReceiptText = (
  name: string,
  createdOrder: CreatedOrder | null
) => {
  if (!createdOrder) return '';

  const lines = [
    name,
    'ORDER CONFIRMATION',
    `Order: ${createdOrder.order_number}`,
    `Date: ${createdOrder.orderedAt.toLocaleString('en-ZA')}`,
    '',
    'ITEMS',
    ...createdOrder.items.map(
      (item) =>
        `${item.name} | ${item.quantity} x R ${item.unitPrice.toFixed(2)} = R ${(item.quantity * item.unitPrice).toFixed(2)}`
    ),
    '',
    `Subtotal: R ${Number(createdOrder.subtotal).toFixed(2)}`,
    '',
    'Thank you for your order.',
    'We will contact you on WhatsApp to arrange payment and delivery.',
  ];

  return lines.join('\n');
};

export const getReceiptFileName = (
  name: string,
  createdOrder: CreatedOrder | null
) => {
  if (!createdOrder) return 'order-confirmation.pdf';

  const storeFileName = name
    .replace(/[^a-z0-9]+/gi, '-')
    .replace(/^-|-$/g, '');

  return `${storeFileName}-${createdOrder.order_number}-confirmation.pdf`;
};
