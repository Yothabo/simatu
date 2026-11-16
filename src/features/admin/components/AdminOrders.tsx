import { AdminSectionHeader } from '../../../design-system/components';
import OverviewStoreSelector from './overview/header/OverviewStoreSelector';
import type {
  Order,
  OrderFilter,
  Storefront,
} from '../types/admin.types';
import {
  OrderListMobile,
  OrderListTable,
  OrdersFilterBar,
  OrdersPagination,
  OrdersToolbar,
} from './orders/components';

type AdminOrdersProps = {
  orderSearch: string;
  orderFilter: OrderFilter;
  filteredOrders: Order[];
  paginatedOrders: Order[];
  isLoadingOrders: boolean;
  orderPage: number;
  totalOrderPages: number;
  storefrontFilter: 'all' | Storefront;
  onStorefrontChange: (value: 'all' | Storefront) => void;
  onSearchChange: (value: string) => void;
  onFilterChange: (value: OrderFilter) => void;
  onPageChange: (page: number) => void;
  onSelectOrder: (order: Order) => void;
  onRefresh: () => void;
};

export default function AdminOrders({
  orderSearch,
  orderFilter,
  filteredOrders,
  paginatedOrders,
  isLoadingOrders,
  orderPage,
  totalOrderPages,
  storefrontFilter,
  onStorefrontChange,
  onSearchChange,
  onFilterChange,
  onPageChange,
  onSelectOrder,
  onRefresh,
}: AdminOrdersProps) {
  return (
    <div
      className="flex w-full flex-col"
      style={{ gap: 'var(--admin-space-md)' }}
    >
      <AdminSectionHeader
        title="Orders"
        as="h1"
        action={
          <OrdersToolbar
            orderSearch={orderSearch}
            filteredOrders={filteredOrders}
            storefrontFilter={storefrontFilter}
            isLoadingOrders={isLoadingOrders}
            onSearchChange={onSearchChange}
            onRefresh={onRefresh}
          />
        }
      />

      <div className="overview-store-row">
        <OverviewStoreSelector
          value={storefrontFilter}
          onChange={onStorefrontChange}
        />
      </div>

      <OrdersFilterBar
        orderFilter={orderFilter}
        onFilterChange={onFilterChange}
      />

      <div className="admin-order-list-region">
        {isLoadingOrders ? (
          <p
            style={{
              padding: 'var(--admin-space-2xl) 0',
              textAlign: 'center',
              fontSize: 'var(--admin-size-supporting)',
              color: 'var(--admin-text-tertiary)',
              margin: 0,
            }}
          >
            Loading orders...
          </p>
        ) : filteredOrders.length === 0 ? (
          <p
            style={{
              padding: 'var(--admin-space-2xl) 0',
              textAlign: 'center',
              fontSize: 'var(--admin-size-supporting)',
              color: 'var(--admin-text-tertiary)',
              margin: 0,
            }}
          >
            No orders match your filters.
          </p>
        ) : (
          <>
            <OrderListMobile
              paginatedOrders={paginatedOrders}
              onSelectOrder={onSelectOrder}
            />
            <OrderListTable
              paginatedOrders={paginatedOrders}
              onSelectOrder={onSelectOrder}
            />
          </>
        )}
      </div>

      <OrdersPagination
        orderPage={orderPage}
        totalOrderPages={totalOrderPages}
        filteredOrders={filteredOrders}
        onPageChange={onPageChange}
      />
    </div>
  );
}
