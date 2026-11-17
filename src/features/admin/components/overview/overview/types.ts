import type {
  AdminRow,
  Order,
  Storefront,
} from '../../../types/admin.types';
import type { AdminActivity } from '../../../hooks/useAdminActivity';

export type AdminOverviewProps = {
  userId: string;
  userName: string;
  onAddProduct: () => void;
  orders: Order[];
  products: AdminRow[];
  storefrontFilter: 'all' | Storefront;
  onStorefrontChange: (value: 'all' | Storefront) => void;
  canSwitchStore: boolean;
  storeCreatedAt: Partial<Record<Storefront, string>>;
  onRefresh: () => Promise<void>;
  ordersLoadError: string | null;
  productsLoadError: string | null;
  isLoadingOrders: boolean;
  isLoadingProducts: boolean;
  activities: AdminActivity[];
  isLoadingActivities: boolean;
  onViewAllActivities: () => void;
};
