import AdminOverview from '../../../features/admin/components/overview';
import AdminProducts from '../../../features/admin/components/AdminProducts';
import AdminInventory from '../../../features/admin/components/inventory/AdminInventory';
import AdminOrders from '../../../features/admin/components/AdminOrders';
import AdminActivities from '../../../features/admin/components/AdminActivities';
import AdminSettingsTab from '../../../features/admin/components/AdminSettingsTab';
import type { AdminDashboardContentProps } from './AdminDashboardContent.types';

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
