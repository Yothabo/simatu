import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import type * as React from 'react';

import { adminTypography } from '../design-system/tokens/adminTypography';
import { adminColors } from '../design-system/tokens/adminColors';
import { getAdminThemeCssVariables } from '../design-system/themes/admin';
import {
  adminText,
  colors,
  adminSpacingVariables,
} from '../design-system/tokens';
import '../design-system/styles/admin-typography.css';
import '../design-system/styles/admin-spacing.css';
import '../design-system/styles/admin-theme.css';

import AdminProductForm, {
  type AdminProduct,
} from '../components/AdminProductForm';
import { invalidateProductsCache } from '../hooks/useProducts';
import ConfirmModal from '../components/ConfirmModal';
import OrderDetailsModal from '../components/OrderDetailsModal';
import AdminProductDetailsModal from '../components/AdminProductDetailsModal';

import AdminLoginScreen from '../features/admin/components/AdminLoginScreen';
import { Block } from '../features/admin/components/skeleton/SkeletonBlock';
import AdminTopBar from '../features/admin/components/AdminTopBar';
import AdminBottomNavigation from '../features/admin/components/AdminBottomNavigation';
import AdminOverview from '../features/admin/components/overview';
import AdminActivities from '../features/admin/components/AdminActivities';
import AdminManagement from '../features/admin/components/AdminManagement';
import AdminCategories from '../features/admin/components/AdminCategories';
import AdminSettingsTab from '../features/admin/components/AdminSettingsTab';
import AdminProducts from '../features/admin/components/AdminProducts';
import AdminOrders from '../features/admin/components/AdminOrders';
import AdminInventory from '../features/admin/components/inventory/AdminInventory';
import { useAdminAuth } from '../features/admin/hooks/useAdminAuth';
import { useAdminProducts } from '../features/admin/hooks/useAdminProducts';
import { useAdminOrders } from '../features/admin/hooks/useAdminOrders';
import { useAdminActivity } from '../features/admin/hooks/useAdminActivity';

import type {
  AdminRow,
  Tab,
  CategoryFilter,
  OrderStatus,
  OrderFilter,
  Order,
  Storefront,
} from '../features/admin/types/admin.types';

export default function Admin() {
  const {
    session,
    admin,
    isAdmin,
    isChecking,
    isLoggingIn,
    loginError,
  clearLoginError,
    login,
    logout,
  } = useAdminAuth();

  const {
    products,
    hasLoadedProducts,
    productsLoadError,
    isLoading: isLoadingProducts,
    loadProducts,
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
    hasLoadedOrders,
    ordersLoadError,
    loadOrders,
    changeOrderStatus,
    deleteOrder,
  } = useAdminOrders(isAdmin, session?.user.id ?? null);

  // Login form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Product form state
  const formUserId =
    isAdmin === true ? session?.user.id ?? null : null;

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<AdminProduct | null>(null);
  const [formStateReady, setFormStateReady] = useState(false);
  const restoredFormScopeRef = useRef<string | null>(null);

  const [confirmDelete, setConfirmDelete] = useState<AdminRow | null>(null);
  const [confirmPermanentDelete, setConfirmPermanentDelete] =
    useState<AdminRow | null>(null);
  const [isHidingProduct, setIsHidingProduct] = useState(false);
  const isHidingProductRef = useRef(false);
  const [isDeletingProduct, setIsDeletingProduct] = useState(false);
  const isDeletingProductRef = useRef(false);
  const [viewingProduct, setViewingProduct] = useState<AdminRow | null>(null);

  // Dashboard state
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [storefrontFilter, setStorefrontFilter] =
    useState<'all' | Storefront>('all');

  const [adminTheme, setAdminTheme] = useState<'light' | 'dark'>(() => {
    try {
      return localStorage.getItem('simatu-admin-theme') === 'dark'
        ? 'dark'
        : 'light';
    } catch {
      return 'light';
    }
  });

  const themeColors = adminColors.themes[adminTheme];

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

  // Order state
  const [orderFilter, setOrderFilter] = useState<OrderFilter>('All');
  const [orderSearch, setOrderSearch] = useState('');
  const [orderPage, setOrderPage] = useState(1);
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null);
  const [confirmDeleteOrder, setConfirmDeleteOrder] = useState<Order | null>(null);

  const ITEMS_PER_PAGE = 20;
  const ORDERS_PER_PAGE = 20;

  // Restore a product form only after this admin has been authorized.
  useLayoutEffect(() => {
    if (!formUserId) {
      restoredFormScopeRef.current = null;
      setFormOpen(false);
      setEditing(null);
      setFormStateReady(false);
      setConfirmDelete(null);
      setConfirmPermanentDelete(null);
      setIsDeletingProduct(false);
      setViewingProduct(null);
      return;
    }

    setFormStateReady(false);

    try {
      const formOpenKey =
        `yotaabo-admin-product-form-open:${formUserId}`;
      const editingKey =
        `yotaabo-admin-product-editing:${formUserId}`;

      const savedOpen = sessionStorage.getItem(formOpenKey) === 'true';
      const savedEditing = sessionStorage.getItem(editingKey);

      let restoredEditing: AdminProduct | null = null;

      if (savedEditing) {
        try {
          restoredEditing = JSON.parse(savedEditing) as AdminProduct;
        } catch {
          sessionStorage.removeItem(editingKey);
        }
      }

      setFormOpen(savedOpen);
      setEditing(restoredEditing);
    } catch {
      setFormOpen(false);
      setEditing(null);
    }

    restoredFormScopeRef.current = formUserId;
    setFormStateReady(true);
  }, [formUserId]);

  // Preserve the authorized admin's open form across browser reloads.
  useEffect(() => {
    if (
      !formUserId ||
      !formStateReady ||
      restoredFormScopeRef.current !== formUserId
    ) {
      return;
    }

    try {
      const formOpenKey =
        `yotaabo-admin-product-form-open:${formUserId}`;
      const editingKey =
        `yotaabo-admin-product-editing:${formUserId}`;

      if (formOpen) {
        sessionStorage.setItem(formOpenKey, 'true');

        if (editing) {
          sessionStorage.setItem(
            editingKey,
            JSON.stringify(editing),
          );
        } else {
          sessionStorage.removeItem(editingKey);
        }
      } else {
        sessionStorage.removeItem(formOpenKey);
        sessionStorage.removeItem(editingKey);
      }
    } catch {
      // Storage may be unavailable; the admin form remains usable.
    }
  }, [formUserId, formStateReady, formOpen, editing]);

  // Login
  async function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await login(email, password);
  }

  // Product actions
  async function handleHideProduct(product: AdminRow) {
    if (isHidingProductRef.current) return;

    isHidingProductRef.current = true;
    setIsHidingProduct(true);

    try {
      const success = await hideProduct(product);

      if (success) {
        setConfirmDelete(null);
        setViewingProduct(null);
        void loadActivities();
      }
    } finally {
      isHidingProductRef.current = false;
      setIsHidingProduct(false);
    }
  }

  async function handlePermanentDeleteProduct(product: AdminRow) {
    if (isDeletingProductRef.current) return;

    isDeletingProductRef.current = true;
    setIsDeletingProduct(true);

    try {
      const success = await deleteProduct(product);

      if (success) {
        setConfirmPermanentDelete(null);
        setViewingProduct(null);
        void loadActivities();
      }
    } finally {
      isDeletingProductRef.current = false;
      setIsDeletingProduct(false);
    }
  }

  async function handleReactivateProduct(product: AdminRow) {
    const success = await reactivateProduct(product);

    if (success) {
      setViewingProduct(null);
      void loadActivities();
    }
  }

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

  // Apply the shared storefront scope before tab-specific filtering.
  const storefrontProducts = useMemo(
    () =>
      storefrontFilter === 'all'
        ? products
        : products.filter((product) => product.storefront === storefrontFilter),
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

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);

  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredProducts.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredProducts, currentPage]);

  // Order filtering
  const filteredOrders = useMemo(() => {
    return storefrontOrders.filter((order) => {
      if (
        orderFilter !== 'All' &&
        order.status !== orderFilter.toLowerCase()
      ) {
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

  const totalOrderPages = Math.ceil(
    filteredOrders.length / ORDERS_PER_PAGE,
  );

  const paginatedOrders = useMemo(() => {
    const start = (orderPage - 1) * ORDERS_PER_PAGE;
    return filteredOrders.slice(start, start + ORDERS_PER_PAGE);
  }, [filteredOrders, orderPage]);

  // Dashboard statistics
  const stats = useMemo(
    () => ({
      total: storefrontProducts.length,
      active: storefrontProducts.filter((product) => product.is_active).length,
      hidden: storefrontProducts.filter((product) => !product.is_active).length,
    }),
    [storefrontProducts],
  );

  const orderStats = useMemo(
    () => ({
      total: storefrontOrders.length,
      pending: storefrontOrders.filter((order) => order.status === 'pending').length,
      confirmed: storefrontOrders.filter((order) => order.status === 'confirmed').length,
      delivered: storefrontOrders.filter((order) => order.status === 'delivered').length,
      cancelled: storefrontOrders.filter((order) => order.status === 'cancelled').length,
    }),
    [storefrontOrders],
  );

  if (isChecking || (Boolean(session) && isAdmin === null)) {
    return (
      <main
        className="min-h-screen bg-white px-4 py-6"
        aria-busy="true"
        aria-label="Verifying admin access"
      >
        <div className="mx-auto w-full max-w-6xl animate-pulse space-y-6">
          <div className="flex items-center justify-between">
            <Block height="2rem" width="8rem" />
            <Block height="2.5rem" width="2.5rem" radius="9999px" />
          </div>

          <div className="space-y-2">
            <Block height="1.75rem" width="12rem" />
            <Block height="1rem" width="18rem" />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }, (_, index) => (
              <div key={index} className="space-y-3 rounded-xl border border-[#e5e5e5] p-4">
                <Block height="0.875rem" width="5rem" />
                <Block height="2rem" width="7rem" />
                <Block height="0.75rem" width="9rem" />
              </div>
            ))}
          </div>

          <div className="space-y-3 rounded-xl border border-[#e5e5e5] p-4">
            <Block height="1.25rem" width="10rem" />
            <Block height="3rem" />
            <Block height="3rem" />
            <Block height="3rem" />
          </div>
        </div>
      </main>
    );
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

  if (!isChecking && isAdmin === false) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-white px-6">
        <div className="w-full max-w-sm text-center">
          <h1 className="font-heading text-3xl italic text-[#4d4d4d]">
            Access Denied
          </h1>
          <p className="mt-2 text-sm text-[#4d4d4d]/60">
            This account is not authorized for admin access.
          </p>
          <button
            type="button"
            onClick={logout}
            className="mt-6 h-11 w-full border border-solid border-[#4d4d4d] bg-[#4d4d4d] text-xs font-semibold text-white hover:bg-transparent hover:text-[#4d4d4d]"
          >
            Log Out
          </button>
        </div>
      </main>
    );
  }

  return (
    <main
      className="admin-scope min-h-screen bg-white"
      data-theme={adminTheme}
      style={
        {
          ...getAdminThemeCssVariables(adminTheme),
          '--admin-bg': themeColors.background,
          '--admin-surface': themeColors.surface,
          '--admin-surface-subtle': themeColors.surfaceSubtle,
          '--admin-surface-raised': themeColors.surfaceRaised,
          '--admin-text-primary': themeColors.text,
          '--admin-text-secondary': themeColors.textSecondary,
          '--admin-text-supporting': themeColors.textSecondary,
          '--admin-text-muted': themeColors.textMuted,
          '--admin-text-disabled': themeColors.textDisabled,
          '--admin-border-subtle': themeColors.border,
          '--admin-border-strong': themeColors.borderStrong,
          // HARDCODED — category header background.
          // Light: #E2E2E2 (grey header on white card)
          // Dark:  #3A3A3A (lighter grey header on #404040 card)
          '--admin-category-header-bg': adminTheme === 'dark' ? '#3A3A3A' : '#E2E2E2',
          '--admin-hover': themeColors.hover,
          '--admin-accent': adminColors.accent.primary,
          '--admin-accent-hover': adminColors.accent.hover,
          '--admin-accent-text': themeColors.accentText,
          '--admin-on-accent': adminColors.accent.onAccent,
          '--admin-focus': themeColors.focus,
          '--admin-shadow': themeColors.shadow,
          '--admin-charcoal-40':
            adminTheme === 'dark'
              ? 'rgba(244, 241, 236, 0.4)'
              : colors.opacity.charcoal40,
          '--admin-charcoal-50':
            adminTheme === 'dark'
              ? 'rgba(244, 241, 236, 0.5)'
              : colors.opacity.charcoal50,
          '--admin-charcoal-70':
            adminTheme === 'dark'
              ? 'rgba(244, 241, 236, 0.7)'
              : colors.opacity.charcoal70,
          '--admin-card-order-media-surface': themeColors.surfaceSubtle,
          '--admin-status-amber': colors.statusPalette.amber,
          '--admin-status-green': colors.statusPalette.green,
          '--admin-status-red': colors.statusPalette.red,

          ...adminSpacingVariables,

          '--admin-font-heading': adminTypography.heading,
          '--admin-font-body': adminTypography.body,

          '--admin-size-page-title': adminTypography.size.pageTitle,
          '--admin-size-section-title': adminTypography.size.sectionTitle,
          '--admin-size-card-title': adminTypography.size.cardTitle,
          '--admin-size-subsection-title': adminTypography.size.subsectionTitle,
          '--admin-size-body': adminTypography.size.body,
          '--admin-size-supporting': adminTypography.size.supporting,
          '--admin-size-micro': adminTypography.size.micro,

          '--admin-weight-normal': adminTypography.weight.normal,
          '--admin-weight-medium': adminTypography.weight.medium,
          '--admin-weight-semibold': adminTypography.weight.semibold,

          '--admin-line-tight': adminTypography.lineHeight.tight,
          '--admin-line-heading': adminTypography.lineHeight.heading,
          '--admin-line-body': adminTypography.lineHeight.body,
          '--admin-line-compact': adminTypography.lineHeight.compact,
        } as React.CSSProperties
      }
    >
      <AdminTopBar
        email={session?.user?.email?.split('@')[0] || 'Admin'}
        onLogout={logout}
        onBack={activeTab === 'activities' ? () => setActiveTab('overview') : undefined}
        adminTheme={adminTheme}
        onToggleTheme={() => setAdminTheme((c) => (c === 'light' ? 'dark' : 'light'))}
      />

      <div className="admin-page-shell mx-auto">
        {activeTab === 'overview' && (
          <AdminOverview
            key={session?.user.id ?? 'admin-overview'}
            userId={session?.user.id ?? ''}
            searchQuery={searchQuery}
            onSearchChange={(value) => {
              setSearchQuery(value);
              setCurrentPage(1);
              setActiveTab('products');
            }}
            onSearchFocus={() => setActiveTab('products')}
            onAddProduct={() => {
              setEditing(null);
              setFormOpen(true);
            }}
            orders={orders}
            products={products}
            storefrontFilter={storefrontFilter}
            onStorefrontChange={(value) => {
              if (admin?.role === 'super_admin') {
                setStorefrontFilter(value);
              }
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
            onSearchChange={(value) => {
              setSearchQuery(value);
              setCurrentPage(1);
            }}
            onCategoryChange={setCategoryFilter}
            onPageChange={setCurrentPage}
            onAddProduct={() => {
              setEditing(null);
              setFormOpen(true);
            }}
            onSelectProduct={setViewingProduct}
          />
        )}

        {activeTab === 'inventory' && (
          <AdminInventory
            storefrontFilter={storefrontFilter}
            accessToken={session?.access_token ?? ''}
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
            toggleTheme={() => setAdminTheme((c) => (c === 'light' ? 'dark' : 'light'))}
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

      <AdminProductDetailsModal
        product={viewingProduct}
        onClose={() => setViewingProduct(null)}
        onEdit={(product) => {
          setViewingProduct(null);
          setEditing(product);
          setFormOpen(true);
        }}
        onHide={setConfirmDelete}
        onShow={handleReactivateProduct}
        onDelete={(product) => {
          setViewingProduct(null);
          setConfirmPermanentDelete(product);
        }}
      />

      <AdminProductForm
        isOpen={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
        onSaved={() => {
          invalidateProductsCache();
          void loadProducts();
          void loadActivities();
        }}
        productToEdit={editing}
        adminRole={admin?.role ?? null}
        storeSlug={
          admin?.storeSlug === 'yotaabo' || admin?.storeSlug === 'poshies'
            ? admin.storeSlug
            : null
        }
      />

      <ConfirmModal
        isOpen={!!confirmDelete}
        title="Hide product?"
        message={
          confirmDelete
            ? `"${confirmDelete.name}" will be hidden from the site. You can reactivate it later.`
            : ''
        }
        confirmText="Hide"
        cancelText="Cancel"
        variant="grey"
        isLoading={isHidingProduct}
        onConfirm={() => {
          if (confirmDelete) void handleHideProduct(confirmDelete);
        }}
        onCancel={() => {
          if (!isHidingProduct) setConfirmDelete(null);
        }}
      />

      <ConfirmModal
        isOpen={!!confirmPermanentDelete}
        title="Delete product permanently?"
        message={
          confirmPermanentDelete
            ? `"${confirmPermanentDelete.name}" will be permanently deleted. This cannot be undone.`
            : ''
        }
        confirmText="Delete"
        cancelText="Cancel"
        variant="grey"
        isLoading={isDeletingProduct}
        onConfirm={() => {
          if (confirmPermanentDelete) {
            void handlePermanentDeleteProduct(confirmPermanentDelete);
          }
        }}
        onCancel={() => {
          if (!isDeletingProduct) setConfirmPermanentDelete(null);
        }}
      />

      <OrderDetailsModal
        order={viewingOrder}
        products={products.filter(
          (product): product is AdminRow & { id: string } =>
            typeof product.id === 'string',
        )}
        onClose={() => setViewingOrder(null)}
        onStatusChange={handleOrderStatusChange}
        onDelete={(order) => {
          setViewingOrder(null);
          setConfirmDeleteOrder(order);
        }}
      />

      <ConfirmModal
        isOpen={!!confirmDeleteOrder}
        title="Delete order permanently?"
        message={
          confirmDeleteOrder
            ? `Order ${confirmDeleteOrder.order_number} will be permanently removed. This cannot be undone.`
            : ''
        }
        confirmText="Delete"
        cancelText="Cancel"
        variant="grey"
        onConfirm={() => {
          if (confirmDeleteOrder) void handleDeleteOrder(confirmDeleteOrder);
        }}
        onCancel={() => setConfirmDeleteOrder(null)}
      />
    </main>
  );
}
