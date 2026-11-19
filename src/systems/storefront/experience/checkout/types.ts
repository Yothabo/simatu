import type { CartItem } from '../../../../context/CartContext.tsx';

export type CreatedOrder = {
  order_number: string;
  subtotal: number;
  customerName: string;
  customerPhone: string;
  orderedAt: Date;
  items: { name: string; quantity: number; unitPrice: number }[];
};

export type CheckoutCustomerErrors = {
  fullName: string;
  phoneNumber: string;
};

export type CheckoutCustomerFormProps = {
  fullName: string;
  phoneNumber: string;
  errors: CheckoutCustomerErrors;
  onFullNameChange: (value: string) => void;
  onPhoneNumberChange: (value: string) => void;
};
