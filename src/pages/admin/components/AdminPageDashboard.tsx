import type { Dispatch, SetStateAction } from 'react';
import type { Session } from '@supabase/supabase-js';
import type { AdminContext } from '../../../features/admin/auth/adminAuth.types';
import type {
  AdminRow,
  Order,
  Tab,
} from '../../../features/admin/types/admin.types';
import type { useAdminProducts } from '../../../features/admin/hooks/useAdminProducts';
import type { useAdminOrders } from '../../../features/admin/hooks/useAdminOrders';
import type { useAdminActivity } from '../../../features/admin/hooks/useAdminActivity';
import type { useAdminPageFilters } from '../hooks/useAdminPageFilters';
import AdminDashboardContent from './AdminDashboardContent';

type Props = {
  activeTab: Tab;
  setActiveTab: Dispatch<SetStateAction<Tab>>;
  admin: AdminContext | null;
  session: Session;
  adminTheme: 'light' | 'dark';
  setAdminTheme: Dispatch<SetStateAction<'light' | 'dark'>>;
  userName: string;
  productData: ReturnType<typeof useAdminProducts>;
  orderData: ReturnType<typeof useAdminOrders>;
  activityData: ReturnType<typeof useAdminActivity>;
  filters: ReturnType<typeof useAdminPageFilters>;
  onAddProduct: () => void;
  onSelectProduct: (product: AdminRow) => void;
  onSelectOrder: (order: Order) => void;
  onStorefrontChange: () => void;
};

export default function AdminPageDashboard({
  activeTab,
  setActiveTab,
  admin,
  session,
  adminTheme,
  setAdminTheme,
  userName,
  productData,
  orderData,
  activityData,
  filters,
  onAddProduct,
  onSelectProduct,
  onSelectOrder,
  onStorefrontChange,
}: Props) {
  return (
    <div
      className={activeTab === 'marketplace' ? "admin-page-shell admin-page-shell--marketplace mx-auto" : "admin-page-shell mx-auto"}
      style={activeTab === 'marketplace' ? { width: '100%', maxWidth: 'none', height: '100dvh', minHeight: 0, maxHeight: '100dvh', overflow: 'hidden', padding: 0, margin: 0 } : undefined}
    >
      <AdminDashboardContent
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        adminRole={admin?.role}
        adminStoreSlug={admin?.storeSlug ?? undefined}
        storeCreatedAt={admin?.storeCreatedAt ?? {}}
        adminTheme={adminTheme}
        setAdminTheme={setAdminTheme}
        userId={session.user.id ?? ''}
        userName={userName}
        accessToken={session.access_token ?? ''}
        products={productData.products}
        orders={orderData.orders}
        activities={activityData.activities}
        productsLoadError={productData.productsLoadError}
        ordersLoadError={orderData.ordersLoadError}
        isLoadingProducts={productData.isLoading}
        isLoadingOrders={orderData.isLoadingOrders}
        isLoadingActivities={activityData.isLoadingActivities}
        loadProducts={productData.loadProducts}
        loadOrders={orderData.loadOrders}
        loadActivities={activityData.loadActivities}
        onAddProduct={onAddProduct}
        onSelectProduct={onSelectProduct}
        onSelectOrder={onSelectOrder}
        storefrontFilter={filters.storefrontFilter}
        setStorefrontFilter={filters.setStorefrontFilter}
        categoryFilter={filters.categoryFilter}
        setCategoryFilter={filters.setCategoryFilter}
        searchQuery={filters.searchQuery}
        setSearchQuery={filters.setSearchQuery}
        currentPage={filters.currentPage}
        setCurrentPage={filters.setCurrentPage}
        filteredProducts={filters.filteredProducts}
        paginatedProducts={filters.paginatedProducts}
        totalPages={filters.totalPages}
        orderFilter={filters.orderFilter}
        setOrderFilter={filters.setOrderFilter}
        orderSearch={filters.orderSearch}
        setOrderSearch={filters.setOrderSearch}
        orderPage={filters.orderPage}
        setOrderPage={filters.setOrderPage}
        filteredOrders={filters.filteredOrders}
        paginatedOrders={filters.paginatedOrders}
        totalOrderPages={filters.totalOrderPages}
        onStorefrontChange={onStorefrontChange}
      />
    </div>
  );
}
