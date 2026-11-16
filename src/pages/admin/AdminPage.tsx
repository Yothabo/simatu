import { useEffect, useMemo, useRef, useState } from 'react';
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
  CategoryFilter,
  OrderStatus,
  OrderFilter,
  Order,
  Storefront,
} from '../../features/admin/types/admin.types';

import type { AdminProduct } from '../../features/admin/components/AdminProductForm';

import AdminLoginScreen from '../../features/admin/components/AdminLoginScreen';
import AdminTopBar from '../../features/admin/components/AdminTopBar';
import AdminBottomNavigation from '../../features/admin/components/AdminBottomNavigation';
import AdminOverview from '../../features/admin/components/overview';
import AdminActivities from '../../features/admin/components/AdminActivities';
import AdminCategories from '../../features/admin/components/AdminCategories';
import AdminSettingsTab from '../../features/admin/components/AdminSettingsTab';
import AdminProducts from '../../features/admin/components/AdminProducts';
import AdminOrders from '../../features/admin/components/AdminOrders';
import AdminInventory from '../../features/admin/components/inventory/AdminInventory';

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
import { useProductFormSession } from './hooks/useProductFormSession';
import { useProductActions } from './hooks/useProductActions';

const ITEMS_PER_PAGE = 20;
const ORDERS_PER_PAGE = 20;

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

  const { activities, isLoadingActivities, loadActivities } = useAdminActivity(
    isAdmin,
    session?.user.id ?? null,
  );

  const {
    orders,
    isLoadingOrders,
    ordersLoadError,
    loadOrders,
    changeOrderStatus,
    deleteOrder,
  } = useAdminOrders(isAdmin, session?.user.id ?? null);

  // Login form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Product form session (open/editing + sessionStorage persistence)
  const formUserId = isAdmin === true ? session?.user.id ?? null : null;
  const {
    formOpen,
    editing,
    openCreateForm,
    openEditForm,
    closeForm,
  } = useProductFormSession({ formUserId });

  // Modals
  const [viewingProduct, setViewingProduct] = useState<AdminRow | null>(null);
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null);
  const [confirmDeleteOrder, setConfirmDeleteOrder] = useState<Order | null>(
    null,
  );

  // Product actions (hide / reactivate / permanent delete + confirm modals)
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

  // Order actions
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

  // Dashboard state
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [storefrontFilter, setStorefrontFilter] = useState<'all' | Storefront>(
    'all',
  );

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

  useEffect(() => {
    if (admin?.role === 'store_admin' && admin.storeSlug) {
      setStorefrontFilter(admin.storeSlug as Storefront);
    } else if (admin?.role === 'super_admin') {
      setStorefrontFilter('all');
    }
  }, [admin?.role, admin?.storeSlug]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [activeTab]);

  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const [orderFilter, setOrderFilter] = useState<OrderFilter>('All');
  const [orderSearch, setOrderSearch] = useState('');
  const [orderPage, setOrderPage] = useState(1);

  // Login
  async function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await login(email, password);
  }

  // Apply the shared storefront scope before tab-specific filtering.
  const storefrontProducts = useMemo(
    () =>
      storefrontFilter === 'all'
        ? products
        : products.filter(
            (product) => product.storefront === storefrontFilter,
          ),
    [products, storefrontFilter],
  );

  const storefrontOrders = useMemo(
    () =>
      storefrontFilter === 'all'
        ? orders
        : orders.filter((order) => order.storefront === storefrontFilter),
    [orders, storefrontFilter],
  );

  // Product filtering
  const filteredProducts = useMemo(() => {
    return storefrontProducts
      .filter((product) => {
        if (categoryFilter === 'Hidden') {
          if (product.is_active) return false;
        } else if (
          categoryFilter !== 'All' &&
          product.category !== categoryFilter
        ) {
          return false;
        }

        if (
          searchQuery.trim() &&
          !product.name.toLowerCase().includes(searchQuery.toLowerCase())
        ) {
          return false;
        }

        return true;
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [storefrontProducts, categoryFilter, searchQuery]);

  useEffect(() => {
    setCurrentPage(1);
  }, [storefrontFilter, categoryFilter, searchQuery]);

  useEffect(() => {
    if (storefrontFilter === 'yotaabo' && categoryFilter === 'Lounge') {
      setCategoryFilter('All');
    }
    if (storefrontFilter === 'poshies' && categoryFilter === 'Spaces') {
      setCategoryFilter('All');
    }
  }, [storefrontFilter, categoryFilter]);

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);

  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredProducts.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredProducts, currentPage]);

  // Order filtering
  const filteredOrders = useMemo(() => {
    return storefrontOrders.filter((order) => {
      if (orderFilter !== 'All' && order.status !== orderFilter.toLowerCase()) {
        return false;
      }

      if (orderSearch.trim()) {
        const query = orderSearch.toLowerCase();

        const matches =
          order.order_number.toLowerCase().includes(query) ||
          order.customer_name.toLowerCase().includes(query) ||
          order.customer_phone.includes(orderSearch);

        if (!matches) return false;
      }

      return true;
    });
  }, [storefrontOrders, orderFilter, orderSearch]);

  useEffect(() => {
    setOrderPage(1);
  }, [storefrontFilter, orderFilter, orderSearch]);

  const totalOrderPages = Math.ceil(filteredOrders.length / ORDERS_PER_PAGE);

  const paginatedOrders = useMemo(() => {
    const start = (orderPage - 1) * ORDERS_PER_PAGE;
    return filteredOrders.slice(start, start + ORDERS_PER_PAGE);
  }, [filteredOrders, orderPage]);

  // Early-exit screens
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

  return (
    <main
      className="admin-scope min-h-screen bg-white"
      data-theme={adminTheme}
      style={buildAdminThemeStyle(adminTheme)}
    >
      <AdminTopBar
        email={session?.user?.email?.split('@')[0] || 'Admin'}
        onLogout={logout}
        onBack={
          activeTab === 'activities'
            ? () => setActiveTab('overview')
            : undefined
        }
        adminTheme={adminTheme}
        onToggleTheme={() =>
          setAdminTheme((c) => (c === 'light' ? 'dark' : 'light'))
        }
      />

      <div className="admin-page-shell mx-auto">
        {activeTab === 'overview' && (
          <AdminOverview
            key={session?.user.id ?? 'admin-overview'}
            userId={session?.user.id ?? ''}
            userName={
              session?.user.user_metadata?.first_name ??
              session?.user.user_metadata?.full_name ??
              session?.user.user_metadata?.name ??
              session?.user.email?.split('@')[0] ??
              'Admin'
            }
            onAddProduct={openCreateForm}
            orders={orders}
            products={products}
            storefrontFilter={storefrontFilter}
            onStorefrontChange={(value) => {
              if (admin?.role === 'super_admin') setStorefrontFilter(value);
            }}
            canSwitchStore={admin?.role === 'super_admin'}
            storeCreatedAt={admin?.storeCreatedAt ?? {}}
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
              if (admin?.role === 'super_admin') setStorefrontFilter(value);
            }}
            onSearchChange={(value) => {
              setSearchQuery(value);
              setCurrentPage(1);
            }}
            onCategoryChange={setCategoryFilter}
            onPageChange={setCurrentPage}
            onAddProduct={openCreateForm}
            onSelectProduct={setViewingProduct}
            onRefresh={() => {
              void loadProducts();
            }}
          />
        )}

        {activeTab === 'inventory' && (
          <AdminInventory
            storefrontFilter={storefrontFilter}
            onStorefrontChange={setStorefrontFilter}
            accessToken={session?.access_token ?? ''}
            userId={session?.user.id ?? ''}
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
              if (admin?.role === 'super_admin') setStorefrontFilter(value);
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
            onSelectOrder={setViewingOrder}
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
              setAdminTheme((c) => (c === 'light' ? 'dark' : 'light'))
            }
            storefrontFilter={storefrontFilter}
            setStorefrontFilter={setStorefrontFilter}
            adminRole={admin?.role}
            adminStoreSlug={admin?.storeSlug ?? undefined}
            accessToken={session?.access_token}
            onStorefrontChange={() => {
              setViewingProduct(null);
              setViewingOrder(null);
              setConfirmDelete(null);
              setConfirmPermanentDelete(null);
              setConfirmDeleteOrder(null);
            }}
          />
        )}
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
