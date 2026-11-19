import type { Order, AdminRow } from '../types/admin.types';
import { getCategoryTheme } from '../../../systems/storefront/core/configuration/categoryTheme';
import StatsHeader from './stats/StatsHeader';
import OrdersStatCard from './stats/OrdersStatCard';
import ProductsStatCard from './stats/ProductsStatCard';

type StatsRowProps = {
  totalOrders: number;
  pendingOrders: number;
  confirmedOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  totalProducts: number;
  activeProducts: number;
  inactiveProducts: number;
  activeFilter?: string;
  orders?: Order[];
  products?: AdminRow[];
};

export default function StatsRow({
  totalOrders,
  pendingOrders,
  deliveredOrders,
  totalProducts,
  activeProducts,
  inactiveProducts,
  activeFilter = 'all',
  orders = [],
  products = [],
}: StatsRowProps) {
  const accentColor =
    activeFilter === 'yotaabo'
      ? getCategoryTheme('His').hexColor
      : activeFilter === 'poshies'
        ? getCategoryTheme('Hers').hexColor
        : 'var(--admin-accent)';

  return (
    <div className="flex w-full flex-col" style={{ gap: 'var(--admin-space-md)' }}>
      <StatsHeader />
      <div className="grid w-full grid-cols-2" style={{ gap: 'var(--admin-space-md)' }}>
        <OrdersStatCard
          totalOrders={totalOrders}
          pendingOrders={pendingOrders}
          deliveredOrders={deliveredOrders}
          orders={orders}
          accentColor={accentColor}
        />
        <ProductsStatCard
          totalProducts={totalProducts}
          activeProducts={activeProducts}
          inactiveProducts={inactiveProducts}
          products={products}
          accentColor={accentColor}
        />
      </div>
    </div>
  );
}
