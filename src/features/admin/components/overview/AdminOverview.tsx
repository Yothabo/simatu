import { useMemo, useState } from 'react';
import type { OverviewDateSelection } from '../../types/overview.types';
import { calculateOverviewAnalytics } from '../../analytics/overview/overviewCalculations';
import { getOverviewDateRange } from '../../utils/overview/dateRanges';
import {
  readOverviewDateSelection,
  writeOverviewDateSelection,
} from '../../utils/overview/dateSelectionStorage';

import OverviewHeader from './header/OverviewHeader';
import BusinessSummary from './sections/BusinessSummary';
import SalesPerformance from './sections/SalesPerformance';
import OrderOperations from './sections/OrderOperations';
import ProductPerformance from './sections/ProductPerformance';
import StoreComparison from './sections/StoreComparison';
import RecentActivity from './sections/RecentActivity';

import OverviewLoadStatus from './overview/OverviewLoadStatus';
import {
  QUICK_ACTION_OPTIONS,
} from './overview/overview.constants';
import {
  getActiveQuickAction,
  getFirstName,
  getQuickActionDates,
  getTimeBasedGreeting,
} from './overview/overviewDate.utils';
import { downloadOverviewReport } from './overview/overviewReport';
import type { AdminOverviewProps } from './overview/types';

export default function AdminOverview({
  userId,
  userName,
  onAddProduct,
  orders,
  products,
  storefrontFilter,
  onStorefrontChange,
  canSwitchStore,
  storeCreatedAt,
  onRefresh,
  ordersLoadError,
  productsLoadError,
  isLoadingOrders,
  isLoadingProducts,
  activities,
  isLoadingActivities,
  onViewAllActivities,
}: AdminOverviewProps) {
  const [dateRange, setDateRange] = useState<OverviewDateSelection>(
    () => readOverviewDateSelection(userId),
  );

  const storeStartDate = useMemo(() => {
    const dates =
      storefrontFilter === 'all'
        ? Object.values(storeCreatedAt)
        : [storeCreatedAt[storefrontFilter]];

    return dates
      .filter((value): value is string => Boolean(value))
      .sort(
        (a, b) =>
          new Date(a).getTime() - new Date(b).getTime(),
      )[0];
  }, [storeCreatedAt, storefrontFilter]);

  const analytics = useMemo(
    () =>
      calculateOverviewAnalytics({
        orders,
        dateRange: getOverviewDateRange(dateRange, storeStartDate),
        catalogue: {
          total: products.length,
          active: products.filter((product) => product.is_active).length,
          hidden: products.filter((product) => !product.is_active).length,
        },
        selectedStore: storefrontFilter,
      }),
    [
      orders,
      products,
      dateRange,
      storefrontFilter,
      storeStartDate,
    ],
  );

  const hasLoadError = Boolean(ordersLoadError || productsLoadError);
  const isLoading = isLoadingOrders || isLoadingProducts;
  const activeQuickAction = getActiveQuickAction(dateRange);

  const greeting = getTimeBasedGreeting();
  const firstName = getFirstName(userName);

  function handleDateFilterChange(value: string) {
    const dates = getQuickActionDates(value);

    if (dates.length === 0) return;

    const selection: OverviewDateSelection = {
      type: 'dates',
      dates,
    };

    writeOverviewDateSelection(userId, selection);
    setDateRange(selection);
  }

  function handleExport() {
    if (hasLoadError) return;
    downloadOverviewReport(analytics, storefrontFilter, dateRange);
  }

  function handleRefresh() {
    if (isLoading) return;
    void onRefresh();
  }

  return (
    <section
      className="admin-overview flex w-full flex-col"
      style={{ gap: 'var(--admin-space-5xl)' }}
    >
      <OverviewHeader
        greeting={greeting}
        userName={firstName}
        canSwitchStore={canSwitchStore}
        storefrontFilter={storefrontFilter}
        onStorefrontChange={onStorefrontChange}
        activeQuickAction={activeQuickAction}
        quickActionOptions={QUICK_ACTION_OPTIONS}
        onQuickActionChange={handleDateFilterChange}
        isLoading={isLoading}
        onExport={handleExport}
        onRefresh={handleRefresh}
        onAdd={onAddProduct}
      />

      <OverviewLoadStatus
        isLoading={isLoading}
        ordersLoadError={ordersLoadError}
        productsLoadError={productsLoadError}
      />

      <BusinessSummary data={analytics.businessSummary} />
      <SalesPerformance data={analytics.salesPerformance} />
      <OrderOperations data={analytics.orderOperations} />
      <ProductPerformance data={analytics.productPerformance} />
      <StoreComparison data={analytics.storeComparison} />

      <RecentActivity
        activities={activities}
        isLoading={isLoadingActivities}
        onViewAll={onViewAllActivities}
      />
    </section>
  );
}
