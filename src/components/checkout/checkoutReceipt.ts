import { jsPDF } from 'jspdf';
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

export const createReceiptPdf = (
  name: string,
  primaryAccent: string,
  createdOrder: CreatedOrder | null
) => {
  if (!createdOrder) return null;

  const pdf = new jsPDF();
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 18;
  const contentWidth = pageWidth - margin * 2;

  const hex = primaryAccent.replace('#', '');
  const accent = [
    parseInt(hex.slice(0, 2), 16),
    parseInt(hex.slice(2, 4), 16),
    parseInt(hex.slice(4, 6), 16),
  ] as [number, number, number];

  const money = (value: number) => `R ${value.toFixed(2)}`;

  const drawTableHeader = (y: number) => {
    pdf.setFillColor(245, 245, 245);
    pdf.roundedRect(margin, y, contentWidth, 11, 2, 2, 'F');

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(8);
    pdf.setTextColor(100, 100, 100);
    pdf.text('PRODUCT', margin + 4, y + 7);
    pdf.text('QTY', 133, y + 7, { align: 'right' });
    pdf.text('UNIT PRICE', 160, y + 7, { align: 'right' });
    pdf.text('TOTAL', pageWidth - margin - 4, y + 7, { align: 'right' });

    return y + 17;
  };

  // Branded header.
  pdf.setFillColor(...accent);
  pdf.rect(0, 0, pageWidth, 51, 'F');

  pdf.setFillColor(...accent);
  pdf.rect(0, 51, pageWidth, 2, 'F');

  pdf.setTextColor(255, 255, 255);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(23);
  pdf.text(name, margin, 23);

  // Customer details on the right side of the header.
  pdf.setTextColor(255, 255, 255);
  pdf.setFont('helvetica', 'bold');

  let customerNameSize = 16;
  pdf.setFontSize(customerNameSize);

  const customerNameMaxWidth = contentWidth / 2;
  while (
    pdf.getTextWidth(createdOrder.customerName) > customerNameMaxWidth &&
    customerNameSize > 9
  ) {
    customerNameSize -= 0.5;
    pdf.setFontSize(customerNameSize);
  }

  pdf.text(
    createdOrder.customerName,
    pageWidth - margin,
    23,
    { align: 'right' }
  );

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8);
  pdf.text(
    'Thank you for your order',
    pageWidth - margin,
    35,
    { align: 'right' }
  );

  pdf.text(
    createdOrder.customerPhone,
    pageWidth - margin,
    45,
    { align: 'right' }
  );

  // Order information.
  pdf.setTextColor(90, 90, 90);
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8);
  pdf.text('ORDER NUMBER', margin, 69);
  pdf.text('ORDER CONFIRMATION', pageWidth / 2, 69, { align: 'center' });
  pdf.text('ORDER DATE', pageWidth - margin, 69, { align: 'right' });

  pdf.setTextColor(43, 43, 43);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(12);
  pdf.text(createdOrder.order_number, margin, 77);

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(10);
  pdf.text(
    createdOrder.orderedAt.toLocaleDateString('en-ZA', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    }),
    pageWidth - margin,
    77,
    { align: 'right' }
  );

  // Items section.
  pdf.setTextColor(43, 43, 43);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(11);
  pdf.text('Order details', margin, 98);

  let y = drawTableHeader(105);

  createdOrder.items.forEach((item) => {
    const nameLines = pdf.splitTextToSize(item.name, 91);
    const rowHeight = Math.max(13, nameLines.length * 5 + 7);

    if (y + rowHeight > pageHeight - 32) {
      pdf.addPage();
      y = 22;
      y = drawTableHeader(y);
    }

    pdf.setTextColor(55, 55, 55);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(9);
    pdf.text(nameLines, margin + 4, y);

    pdf.setFontSize(8);
    pdf.text(String(item.quantity), 133, y, { align: 'right' });
    pdf.text(money(item.unitPrice), 160, y, { align: 'right' });
    pdf.setFont('helvetica', 'bold');
    pdf.text(
      money(item.quantity * item.unitPrice),
      pageWidth - margin - 4,
      y,
      { align: 'right' }
    );

    y += rowHeight;

    pdf.setDrawColor(235, 235, 235);
    pdf.line(margin, y - 3, pageWidth - margin, y - 3);
  });

  // Subtotal panel.
  if (y + 35 > pageHeight - 28) {
    pdf.addPage();
    y = 25;
  }

  y += 5;
  pdf.setFillColor(247, 247, 247);
  pdf.roundedRect(margin, y, contentWidth, 27, 2, 2, 'F');

  pdf.setTextColor(85, 85, 85);
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(10);
  pdf.text('Subtotal', margin + 5, y + 11);

  pdf.setTextColor(...accent);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(16);
  pdf.text(
    money(Number(createdOrder.subtotal)),
    pageWidth - margin - 5,
    y + 17,
    { align: 'right' }
  );

  // Footer.
  const footerY = pageHeight - 17;
  pdf.setDrawColor(230, 230, 230);
  pdf.line(margin, footerY - 7, pageWidth - margin, footerY - 7);

  pdf.setTextColor(105, 105, 105);
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8);
  pdf.text(
    'We will contact you on WhatsApp to arrange payment and delivery.',
    margin,
    footerY
  );

  pdf.setTextColor(...accent);
  pdf.setFont('helvetica', 'bold');
  pdf.text(name, pageWidth - margin, footerY + 7, { align: 'right' });

  return pdf;
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
