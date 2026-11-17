import { useEffect, useState } from 'react';
import type * as React from 'react';

import { buildAdminThemeStyle } from '../../design-system/themes/admin';
import '../../design-system/styles/admin-typography.css';
import '../../design-system/styles/admin-spacing.css';
import '../../design-system/styles/admin-theme.css';
import '../../design-system/components/AdminButton/AdminButton.css';
import '../../design-system/components/AdminRow/AdminRow.css';

import type { Tab, Storefront } from '../../features/admin/types/admin.types';
import AdminBottomNavigation from '../../features/admin/components/AdminBottomNavigation';
import { useAdminAuth } from '../../features/admin/hooks/useAdminAuth';
import { useAdminProducts } from '../../features/admin/hooks/useAdminProducts';
import { useAdminOrders } from '../../features/admin/hooks/useAdminOrders';
import { useAdminActivity } from '../../features/admin/hooks/useAdminActivity';
import { getAdminPageAuthScreen } from './components/AdminPageAuthScreen';
import AdminPageHeader from './components/AdminPageHeader';
import AdminPageModals from './components/AdminPageModals';
import AdminPageDashboard from './components/AdminPageDashboard';
import { useAdminPageActions } from './hooks/useAdminPageActions';
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

  const productData = useAdminProducts(isAdmin, session?.user.id ?? null);
  const orderData = useAdminOrders(isAdmin, session?.user.id ?? null);
  const activityData = useAdminActivity(isAdmin, session?.user.id ?? null);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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

  const filters = useAdminPageFilters({
    products: productData.products,
    orders: orderData.orders,
  });

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

  const formUserId = isAdmin === true ? session?.user.id ?? null : null;
  const storeSlug =
    admin?.storeSlug === 'yotaabo' || admin?.storeSlug === 'poshies'
      ? admin.storeSlug
      : null;

  const pageActions = useAdminPageActions({
    formUserId,
    adminRole: admin?.role ?? null,
    storeSlug,
    productData,
    orderData,
    loadActivities: activityData.loadActivities,
  });

  const authScreen = getAdminPageAuthScreen({
    session,
    isAdmin,
    isChecking,
    authError,
    email,
    password,
    loginError,
    isLoggingIn,
    onEmailChange: setEmail,
    onPasswordChange: setPassword,
    onLogin: handleLogin,
    onClearLoginError: clearLoginError,
    onRetryAuthorization: retryAuthorization,
    onLogout: logout,
  });

  if (authScreen) return authScreen;
  if (!session) return null;

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
      <AdminPageHeader
        email={session.user.email?.split('@')[0] || 'Admin'}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        adminTheme={adminTheme}
        setAdminTheme={setAdminTheme}
        onLogout={logout}
      />

      <AdminPageDashboard
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        admin={admin}
        session={session}
        adminTheme={adminTheme}
        setAdminTheme={setAdminTheme}
        userName={userName}
        productData={productData}
        orderData={orderData}
        activityData={activityData}
        filters={filters}
        onAddProduct={pageActions.openCreateForm}
        onSelectProduct={pageActions.setViewingProduct}
        onSelectOrder={pageActions.setViewingOrder}
        onStorefrontChange={pageActions.clearSelectionForStorefrontChange}
      />

      <AdminBottomNavigation
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      <AdminPageModals
        productProps={pageActions.productModalProps}
        orderProps={pageActions.orderModalProps}
      />
    </main>
  );
}
