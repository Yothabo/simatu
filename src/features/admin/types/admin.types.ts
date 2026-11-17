import type { AdminActivity } from '../hooks/adminActivity.types';
import type { ReactNode } from 'react';
import type { AdminProduct } from '../components/AdminProductForm';

export type AdminRow = AdminProduct & {
  id: string;
  created_at: string;
};

export type Tab = 'overview' | 'products' | 'orders' | 'inventory' | 'activities' | 'settings';

export type CategoryFilter = 'All' | 'His' | 'Hers' | 'Spaces' | 'Lounge' | 'Hidden';

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'delivered'
  | 'cancelled';

export type OrderFilter =
  | 'All'
  | 'Pending'
  | 'Confirmed'
  | 'Delivered'
  | 'Cancelled';

export type OrderItem = {
  product_id: string | null;
  name: string;
  price: number;
  qty: number;
};

export type Storefront = 'yotaabo' | 'poshies';

export type Order = {
  id: string;
  storefront: Storefront;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  items: OrderItem[];
  subtotal: number;
  status: OrderStatus;
  created_at: string;
  updated_at: string;
};

export type AdminPageHeaderProps = {
  title: string;
  eyebrow?: string;
  description?: string;
  searchValue?: string;
  searchPlaceholder?: string;
  onSearchChange?: (value: string) => void;
  onSearchFocus?: () => void;
  action?: ReactNode;
  filters?: ReactNode;
};

// Props for the refactored Admin Overview component
export type AdminOverviewProps = {
  activities: AdminActivity[];
  isLoadingActivities: boolean;
  email: string;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onSearchFocus: () => void;
  onAddProduct: () => void;
  onViewAllActivities: () => void;
  onViewOrders?: () => void;
  stats: {
    total: number;
    active: number;
    hidden: number; // Note: You may need to remove 'hidden' if your hook doesn't provide it
  };
  orderStats: {
    total: number;
    pending: number;
    confirmed: number;
    delivered: number;
    cancelled: number;
  };
};


export type TimeRange = 'this-month' | 'last-month' | 'last-quarter' | 'ytd' | 'this-year' | 'last-year' | 'all';
