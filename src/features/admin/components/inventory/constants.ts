import {
  FiActivity,
  FiFileText,
  FiPackage,
  FiPlus,
  FiShoppingCart,
} from 'react-icons/fi';
import type { AddAction, InventorySection } from './types';

export const SECTIONS: {
  id: InventorySection;
  label: string;
  description: string;
  Icon: typeof FiPackage;
}[] = [
  {
    id: 'overview',
    label: 'Overview',
    description: 'Inventory performance and stock health',
    Icon: FiActivity,
  },
  {
    id: 'stock',
    label: 'Stock management',
    description: 'Balances, receiving and adjustments',
    Icon: FiPackage,
  },
  {
    id: 'sales',
    label: 'Direct sales',
    description: 'Record sales outside the storefront',
    Icon: FiShoppingCart,
  },
  {
    id: 'receipts',
    label: 'Receipts',
    description: 'Review and manage customer receipts',
    Icon: FiFileText,
  },
];

export const ADD_ACTIONS: {
  key: AddAction;
  label: string;
  icon: typeof FiPlus;
}[] = [
  {
    key: 'direct-sale',
    label: 'Register a direct sale',
    icon: FiShoppingCart,
  },
  {
    key: 'new-product',
    label: 'Add new product',
    icon: FiPlus,
  },
  {
    key: 'receipt',
    label: 'Create a receipt',
    icon: FiFileText,
  },
];
