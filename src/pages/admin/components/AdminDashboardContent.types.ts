import type { Dispatch, SetStateAction } from 'react';

import type {
  AdminRow,
  Tab,
  Order,
  Storefront,
  CategoryFilter,
  OrderFilter,
} from '../../../features/admin/types/admin.types';

import type { useAdminProducts } from '../../../features/admin/hooks/useAdminProducts';
import type { useAdminOrders } from '../../../features/admin/hooks/useAdminOrders';
import type { useAdminActivity } from '../../../features/admin/hooks/useAdminActivity';

type Products = ReturnType<typeof useAdminProducts>['products'];
type Orders = ReturnType<typeof useAdminOrders>['orders'];
type Activities = ReturnType<typeof useAdminActivity>['activities'];

export interface AdminDashboardContentProps {
  activeTab: Tab;
  setActiveTab: Dispatch<SetStateAction<Tab>>;

  adminRole?: string;
  adminStoreSlug?: string;
  storeCreatedAt: Record<string, string>;

  adminTheme: 'light' | 'dark';
  setAdminTheme: Dispatch<SetStateAction<'light' | 'dark'>>;

  userId: string;
  userName: string;
  accessToken: string;

  products: Products;
  orders: Orders;
  activities: Activities;

  productsLoadError: ReturnType<typeof useAdminProducts>['productsLoadError'];
  ordersLoadError: ReturnType<typeof useAdminOrders>['ordersLoadError'];

  isLoadingProducts: boolean;
  isLoadingOrders: boolean;
  isLoadingActivities: boolean;

  loadProducts: ReturnType<typeof useAdminProducts>['loadProducts'];
  loadOrders: ReturnType<typeof useAdminOrders>['loadOrders'];
  loadActivities: ReturnType<typeof useAdminActivity>['loadActivities'];

  onAddProduct: () => void;
  onSelectProduct: (product: AdminRow) => void;
  onSelectOrder: (order: Order) => void;

  storefrontFilter: 'all' | Storefront;
  setStorefrontFilter: Dispatch<SetStateAction<'all' | Storefront>>;

  categoryFilter: CategoryFilter;
  setCategoryFilter: Dispatch<SetStateAction<CategoryFilter>>;
  availableCategories: string[];
  searchQuery: string;
  setSearchQuery: Dispatch<SetStateAction<string>>;
  currentPage: number;
  setCurrentPage: Dispatch<SetStateAction<number>>;
  filteredProducts: Products;
  paginatedProducts: Products;
  totalPages: number;

  orderFilter: OrderFilter;
  setOrderFilter: Dispatch<SetStateAction<OrderFilter>>;
  orderSearch: string;
  setOrderSearch: Dispatch<SetStateAction<string>>;
  orderPage: number;
  setOrderPage: Dispatch<SetStateAction<number>>;
  filteredOrders: Orders;
  paginatedOrders: Orders;
  totalOrderPages: number;

  onStorefrontChange: () => void;
}

