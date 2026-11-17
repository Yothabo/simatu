import { useEffect, useState } from 'react';
import type * as React from 'react';

import { buildAdminThemeStyle } from '../../design-system/themes/admin';
import '../../design-system/styles/admin-typography.css';
import '../../design-system/styles/admin-spacing.css';
import '../../design-system/styles/admin-theme.css';
import '../../design-system/components/AdminButton/AdminButton.css';
import '../../design-system/components/AdminRow/AdminRow.css';

import type {
  AdminRow,
  Tab,
  OrderStatus,
  Order,
  Storefront,
} from '../../features/admin/types/admin.types';

import AdminLoginScreen from '../../features/admin/components/AdminLoginScreen';
import AdminTopBar from '../../features/admin/components/AdminTopBar';
import AdminBottomNavigation from '../../features/admin/components/AdminBottomNavigation';

import { useAdminAuth } from '../../features/admin/hooks/useAdminAuth';
import { useAdminProducts } from '../../features/admin/hooks/useAdminProducts';
import { useAdminOrders } from '../../features/admin/hooks/useAdminOrders';
import { useAdminActivity } from '../../features/admin/hooks/useAdminActivity';

import AdminLoadingScreen from './AdminLoadingScreen';
import {
  AdminVerificationErrorScreen,
  AdminAccessDeniedScreen,
} from './AdminDeniedScreens';

import AdminProductModals from './components/AdminProductModals';
import AdminOrderModals from './components/AdminOrderModals';
import AdminDashboardContent from './components/AdminDashboardContent';

import { useProductFormSession } from './hooks/useProductFormSession';
import { useProductActions } from './hooks/useProductActions';
import { useAdminPageFilters } from './hooks/useAdminPageFilters';

export default function AdminPage() {
  const {
    session,
    admin,
    isAdmin,
    isChecking,
    isLoggingIn,
    loginError,
    authError,
    clearLoginError,
    retryAuthorization,
    login,
    logout,
  } = useAdminAuth();

  const {
    products,
    productsLoadError,
    isLoading: isLoadingProducts,
    loadProducts,
    upsertProduct,
    hideProduct,
    reactivateProduct,
    deleteProduct,
  } = useAdminProducts(isAdmin, session?.user.id ?? null);

  const {
    activities,
    isLoadingActivities,
    loadActivities,
  } = useAdminActivity(isAdmin, session?.user.id ?? null);

  const {
    orders,
    isLoadingOrders,
    ordersLoadError,
    loadOrders,
    changeOrderStatus,
    deleteOrder,
  } = useAdminOrders(isAdmin, session?.user.id ?? null);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const formUserId = isAdmin === true ? session?.user.id ?? null : null;

  const {
    formOpen,
    editing,
    openCreateForm,
    openEditForm,
    closeForm,
  } = useProductFormSession({ formUserId });

  const [viewingProduct, setViewingProduct] = useState<AdminRow | null>(null);
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null);
  const [confirmDeleteOrder, setConfirmDeleteOrder] =
    useState<Order | null>(null);

  const {
    confirmDelete,
    setConfirmDelete,
    confirmPermanentDelete,
    setConfirmPermanentDelete,
    isHidingProduct,
    isDeletingProduct,
    handleHideProduct,
    handlePermanentDeleteProduct,
    handleReactivateProduct,
  } = useProductActions({
    hideProduct,
    reactivateProduct,
    deleteProduct,
    loadActivities,
    onProductClosed: () => setViewingProduct(null),
  });

  const [activeTab, setActiveTab] = useState<Tab>('overview');

  const [adminTheme, setAdminTheme] = useState<'light' | 'dark'>(() => {
    try {
      return localStorage.getItem('simatu-admin-theme') === 'dark'
        ? 'dark'
        : 'light';
    } catch {
      return 'light';
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('simatu-admin-theme', adminTheme);
    } catch {
      // Theme remains usable when browser storage is unavailable.
    }
  }, [adminTheme]);

  const filters = useAdminPageFilters({ products, orders });

  useEffect(() => {
    if (admin?.role === 'store_admin' && admin.storeSlug) {
      filters.setStorefrontFilter(admin.storeSlug as Storefront);
    } else if (admin?.role === 'super_admin') {
      filters.setStorefrontFilter('all');
    }
  }, [admin?.role, admin?.storeSlug]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [activeTab]);

  async function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await login(email, password);
  }

  async function handleOrderStatusChange(
    order: Order,
    newStatus: OrderStatus,
  ) {
    const success = await changeOrderStatus(order, newStatus);

    if (success) {
      setViewingOrder(null);
      void loadActivities();
    }
  }

  async function handleDeleteOrder(order: Order) {
    const success = await deleteOrder(order);

    if (success) {
      setConfirmDeleteOrder(null);
      setViewingOrder(null);
      void loadActivities();
    }
  }

  if (isChecking && (!session || isAdmin !== true) && !authError) {
    return <AdminLoadingScreen />;
  }

  if (!session) {
    return (
      <AdminLoginScreen
        email={email}
        password={password}
        loginError={loginError}
        isLoggingIn={isLoggingIn}
        isResolving={false}
        showAuthIndicator={false}
        isTransitioning={false}
        onTransitionComplete={() => {}}
        onEmailChange={setEmail}
        onPasswordChange={setPassword}
        onLogin={handleLogin}
        onClearLoginError={clearLoginError}
      />
    );
  }

  if (session && authError && isAdmin !== true) {
    return (
      <AdminVerificationErrorScreen
        authError={authError}
        onRetry={retryAuthorization}
        onLogout={logout}
      />
    );
  }

  if (!isChecking && isAdmin === false) {
    return <AdminAccessDeniedScreen onLogout={logout} />;
  }

  const storeSlugForForm =
    admin?.storeSlug === 'yotaabo' || admin?.storeSlug === 'poshies'
      ? admin.storeSlug
      : null;

  const productsWithId = products.filter(
    (product): product is AdminRow & { id: string } =>
      typeof product.id === 'string',
  );

  const userName =
    session.user.user_metadata?.first_name ??
    session.user.user_metadata?.full_name ??
    session.user.user_metadata?.name ??
    session.user.email?.split('@')[0] ??
    'Admin';

  return (
    <main
      className="admin-scope min-h-screen bg-white"
      data-theme={adminTheme}
      style={buildAdminThemeStyle(adminTheme)}
    >
      <AdminTopBar
        email={session.user.email?.split('@')[0] || 'Admin'}
        onLogout={logout}
        onBack={
          activeTab === 'activities'
            ? () => setActiveTab('overview')
            : undefined
        }
        adminTheme={adminTheme}
        onToggleTheme={() =>
          setAdminTheme((current) =>
            current === 'light' ? 'dark' : 'light',
          )
        }
      />

      <div className="admin-page-shell mx-auto">
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
          products={products}
          orders={orders}
          activities={activities}
          productsLoadError={productsLoadError}
          ordersLoadError={ordersLoadError}
          isLoadingProducts={isLoadingProducts}
          isLoadingOrders={isLoadingOrders}
          isLoadingActivities={isLoadingActivities}
          loadProducts={loadProducts}
          loadOrders={loadOrders}
          loadActivities={loadActivities}
          onAddProduct={openCreateForm}
          onSelectProduct={setViewingProduct}
          onSelectOrder={setViewingOrder}
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
          onStorefrontChange={() => {
            setViewingProduct(null);
            setViewingOrder(null);
            setConfirmDelete(null);
            setConfirmPermanentDelete(null);
            setConfirmDeleteOrder(null);
          }}
        />
      </div>

      <AdminBottomNavigation
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      <AdminProductModals
        viewingProduct={viewingProduct}
        onCloseViewingProduct={() => setViewingProduct(null)}
        onEditProduct={openEditForm}
        onRequestHide={setConfirmDelete}
        onReactivate={handleReactivateProduct}
        onRequestPermanentDelete={setConfirmPermanentDelete}
        formOpen={formOpen}
        editing={editing}
        onCloseForm={closeForm}
        onSavedProduct={upsertProduct}
        adminRole={admin?.role ?? null}
        storeSlug={storeSlugForForm}
        confirmDelete={confirmDelete}
        isHiding={isHidingProduct}
        onConfirmHide={handleHideProduct}
        onCancelHide={() => setConfirmDelete(null)}
        confirmPermanentDelete={confirmPermanentDelete}
        isDeleting={isDeletingProduct}
        onConfirmPermanentDelete={handlePermanentDeleteProduct}
        onCancelPermanentDelete={() => setConfirmPermanentDelete(null)}
      />

      <AdminOrderModals
        viewingOrder={viewingOrder}
        onCloseViewingOrder={() => setViewingOrder(null)}
        products={productsWithId}
        onStatusChange={handleOrderStatusChange}
        onRequestDelete={(order) => {
          setViewingOrder(null);
          setConfirmDeleteOrder(order);
        }}
        confirmDeleteOrder={confirmDeleteOrder}
        onConfirmDelete={handleDeleteOrder}
        onCancelDelete={() => setConfirmDeleteOrder(null)}
      />
    </main>
  );
}
