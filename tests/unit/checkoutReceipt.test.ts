import { describe, expect, it } from 'vitest';
import {
  getReceiptFileName,
  getReceiptText,
} from '../../src/systems/storefront/experience/checkout/checkoutReceipt';
import type { CreatedOrder } from '../../src/systems/storefront/experience/checkout/types';

const createdOrder: CreatedOrder = {
  order_number: 'SIM-2026-001',
  subtotal: 900,
  customerName: 'Test Customer',
  customerPhone: '27820000000',
  orderedAt: new Date('2026-11-17T10:00:00.000Z'),
  items: [
    {
      name: 'Amber Eau de Parfum',
      quantity: 2,
      unitPrice: 450,
    },
  ],
};

describe('checkout receipt utilities', () => {
  it('returns an empty receipt when there is no completed order', () => {
    expect(getReceiptText('Yotaabo', null)).toBe('');
  });

  it('formats the order number, items, subtotal, and fulfilment message', () => {
    const receipt = getReceiptText('Yotaabo', createdOrder);

    expect(receipt).toContain('Yotaabo');
    expect(receipt).toContain('Order: SIM-2026-001');
    expect(receipt).toContain(
      'Amber Eau de Parfum | 2 x R 450.00 = R 900.00',
    );
    expect(receipt).toContain('Subtotal: R 900.00');
    expect(receipt).toContain(
      'We will contact you on WhatsApp to arrange payment and delivery.',
    );
  });

  it('returns a safe storefront-specific filename', () => {
    expect(getReceiptFileName('Yotaabo & Co.', createdOrder)).toBe(
      'Yotaabo-Co-SIM-2026-001-confirmation.pdf',
    );
  });

  it('uses a generic filename when there is no completed order', () => {
    expect(getReceiptFileName('Yotaabo', null)).toBe(
      'order-confirmation.pdf',
    );
  });
});
