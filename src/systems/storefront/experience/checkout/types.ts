import type { CartItem } from '../../core/context/CartContext';

export type CreatedOrder = {
  order_number: string;
  subtotal: number;
  customerName: string;
  customerPhone: string;
  orderedAt: Date;
  items: { name: string; storeName?: string; quantity: number; unitPrice: number }[];
  storeOrders?: { storefront: string; order_number: string; subtotal: number; status: string }[];
  checkoutGroupId?: string;
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
