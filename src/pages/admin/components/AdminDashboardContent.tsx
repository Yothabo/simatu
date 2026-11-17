import type { Dispatch, SetStateAction } from 'react';

import type {
  AdminRow,
  Tab,
  Order,
  Storefront,
} from '../../../features/admin/types/admin.types';

import type { useAdminProducts } from '../../../features/admin/hooks/useAdminProducts';
import type { useAdminOrders } from '../../../features/admin/hooks/useAdminOrders';
import type { useAdminActivity } from '../../../features/admin/hooks/useAdminActivity';

import AdminOverview from '../../../features/admin/components/overview';
import AdminProducts from '../../../features/admin/components/AdminProducts';
import AdminInventory from '../../../features/admin/components/inventory/AdminInventory';
import AdminOrders from '../../../features/admin/components/AdminOrders';
import AdminActivities from '../../../features/admin/components/AdminActivities';
import AdminSettingsTab from '../../../features/admin/components/AdminSettingsTab';

import type { CategoryFilter, OrderFilter } from '../../../features/admin/types/admin.types';

type Products = ReturnType<typeof useAdminProducts>['products'];
type Orders = ReturnType<typeof useAdminOrders>['orders'];
type Activities = ReturnType<typeof useAdminActivity>['activities'];

interface AdminDashboardContentProps {
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

export default function AdminDashboardContent({
  activeTab,
  setActiveTab,
  adminRole,
  adminStoreSlug,
  storeCreatedAt,
  adminTheme,
  setAdminTheme,
  userId,
  userName,
  accessToken,
  products,
  orders,
  activities,
  productsLoadError,
  ordersLoadError,
  isLoadingProducts,
  isLoadingOrders,
  isLoadingActivities,
  loadProducts,
  loadOrders,
  loadActivities,
  onAddProduct,
  onSelectProduct,
  onSelectOrder,
  storefrontFilter,
  setStorefrontFilter,
  categoryFilter,
  setCategoryFilter,
  searchQuery,
  setSearchQuery,
  currentPage,
  setCurrentPage,
  filteredProducts,
  paginatedProducts,
  totalPages,
  orderFilter,
  setOrderFilter,
  orderSearch,
  setOrderSearch,
  orderPage,
  setOrderPage,
  filteredOrders,
  paginatedOrders,
  totalOrderPages,
  onStorefrontChange,
}: AdminDashboardContentProps) {
  return (
    <>
      {activeTab === 'overview' && (
        <AdminOverview
          key={userId || 'admin-overview'}
          userId={userId}
          userName={userName}
          onAddProduct={onAddProduct}
          orders={orders}
          products={products}
          storefrontFilter={storefrontFilter}
          onStorefrontChange={(value) => {
            if (adminRole === 'super_admin') setStorefrontFilter(value);
          }}
          canSwitchStore={adminRole === 'super_admin'}
          storeCreatedAt={storeCreatedAt}
          onRefresh={async () => {
            await Promise.all([loadOrders(), loadProducts()]);
          }}
          ordersLoadError={ordersLoadError}
          productsLoadError={productsLoadError}
          isLoadingOrders={isLoadingOrders}
          isLoadingProducts={isLoadingProducts}
          activities={activities}
          isLoadingActivities={isLoadingActivities}
          onViewAllActivities={() => {
            setActiveTab('activities');
            void loadActivities();
          }}
        />
      )}

      {activeTab === 'products' && (
        <AdminProducts
          searchQuery={searchQuery}
          categoryFilter={categoryFilter}
          filteredProducts={filteredProducts}
          paginatedProducts={paginatedProducts}
          currentPage={currentPage}
          totalPages={totalPages}
          storefrontFilter={storefrontFilter}
          isLoadingProducts={isLoadingProducts}
          onStorefrontChange={(value) => {
            if (adminRole === 'super_admin') setStorefrontFilter(value);
          }}
          onSearchChange={(value) => {
            setSearchQuery(value);
            setCurrentPage(1);
          }}
          onCategoryChange={setCategoryFilter}
          onPageChange={setCurrentPage}
          onAddProduct={onAddProduct}
          onSelectProduct={onSelectProduct}
          onRefresh={() => {
            void loadProducts();
          }}
        />
      )}

      {activeTab === 'inventory' && (
        <AdminInventory
          storefrontFilter={storefrontFilter}
          onStorefrontChange={setStorefrontFilter}
          accessToken={accessToken}
          userId={userId}
        />
      )}

      {activeTab === 'orders' && (
        <AdminOrders
          orderSearch={orderSearch}
          orderFilter={orderFilter}
          filteredOrders={filteredOrders}
          paginatedOrders={paginatedOrders}
          isLoadingOrders={isLoadingOrders}
          orderPage={orderPage}
          totalOrderPages={totalOrderPages}
          storefrontFilter={storefrontFilter}
          onStorefrontChange={(value) => {
            if (adminRole === 'super_admin') setStorefrontFilter(value);
          }}
          onSearchChange={(value) => {
            setOrderSearch(value);
            setOrderPage(1);
          }}
          onFilterChange={(value) => {
            setOrderFilter(value);
            setOrderPage(1);
          }}
          onPageChange={setOrderPage}
          onSelectOrder={onSelectOrder}
          onRefresh={() => {
            void loadOrders();
          }}
        />
      )}

      {activeTab === 'activities' && (
        <AdminActivities
          activities={activities}
          isLoadingActivities={isLoadingActivities}
        />
      )}

      {activeTab === 'settings' && (
        <AdminSettingsTab
          adminTheme={adminTheme}
          toggleTheme={() =>
            setAdminTheme((current) =>
              current === 'light' ? 'dark' : 'light',
            )
          }
          storefrontFilter={storefrontFilter}
          setStorefrontFilter={setStorefrontFilter}
          adminRole={adminRole}
          adminStoreSlug={adminStoreSlug}
          accessToken={accessToken}
          onStorefrontChange={onStorefrontChange}
        />
      )}
    </>
  );
}
