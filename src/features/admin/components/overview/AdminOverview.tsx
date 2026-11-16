import { useMemo, useState } from 'react';
import type { AdminRow, Order, Storefront } from '../../types/admin.types';
import type { AdminActivity } from '../../hooks/useAdminActivity';
import type { OverviewDateSelection } from '../../types/overview.types';
import { calculateOverviewAnalytics } from '../../analytics/overview/overviewCalculations';
import {
  getOverviewDateKey,
  getOverviewDateRange,
} from '../../utils/overview/dateRanges';
import { getOverviewQuickActionDates } from '../../utils/overview/quickActions';
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

type Props = {
  userId: string;
  userName: string;
  onAddProduct: () => void;
  orders: Order[];
  products: AdminRow[];
  storefrontFilter: 'all' | Storefront;
  onStorefrontChange: (value: 'all' | Storefront) => void;
  canSwitchStore: boolean;
  storeCreatedAt: Partial<Record<Storefront, string>>;
  onRefresh: () => Promise<void>;
  ordersLoadError: string | null;
  productsLoadError: string | null;
  isLoadingOrders: boolean;
  isLoadingProducts: boolean;
  activities: AdminActivity[];
  isLoadingActivities: boolean;
  onViewAllActivities: () => void;
};

const QUICK_ACTIONS = [
  { key: '7-days', label: 'Last 7 days' },
  { key: 'month', label: 'Last month' },
  { key: '3-months', label: 'Last 3 months' },
  { key: 'quarter', label: 'Previous quarter' },
  { key: '6-months', label: 'Last 6 months' },
  { key: '2026', label: '2026' },
] as const;

const QUICK_ACTION_OPTIONS = QUICK_ACTIONS.map((action) => ({
  value: action.key,
  label: action.label,
}));

function getFirstName(userName: string): string {
  const firstName = userName.trim().split(/[\s._-]+/)[0];

  if (!firstName) return 'Admin';

  return firstName.charAt(0).toUpperCase() + firstName.slice(1);
}

function getTimeBasedGreeting(): string {
  const hour = new Date().getHours();

  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

function getSelectionLabel(selection: OverviewDateSelection): string {
  if (selection.type === 'preset') {
    return String(selection.preset)
      .replace(/-/g, ' ')
      .replace(/\b\w/g, (character) => character.toUpperCase());
  }

  const count = new Set(selection.dates).size;

  if (count === 0) return 'All available dates';

  return `${count} ${count === 1 ? 'day' : 'days'} selected`;
}

function getSelectionFileKey(selection: OverviewDateSelection): string {
  if (selection.type === 'preset') {
    return `preset-${selection.preset}`;
  }

  const dates = [...new Set(selection.dates)].sort();

  return dates.length > 0 ? dates.join('_') : 'all-available-dates';
}

function get2026Dates(now = new Date()): string[] {
  const todayKey = getOverviewDateKey(now);
  const yearStart = Date.UTC(2026, 0, 1);
  const finalDateKey = todayKey < '2026-12-31' ? todayKey : '2026-12-31';

  const [year, month, day] = finalDateKey.split('-').map(Number);
  const yearEnd = Date.UTC(year, month - 1, day);

  const count = Math.max(
    0,
    Math.floor((yearEnd - yearStart) / 86400000) + 1,
  );

  return Array.from({ length: count }, (_, index) =>
    getOverviewDateKey(new Date(yearStart + index * 86400000)),
  );
}

function getQuickActionDates(
  action: string,
  now = new Date(),
): string[] {
  return action === '2026'
    ? get2026Dates(now)
    : getOverviewQuickActionDates(action, now);
}

function getActiveQuickAction(
  selection: OverviewDateSelection,
): string {
  if (selection.type !== 'dates') return '';

  const selected = [...new Set(selection.dates)].sort();

  return (
    QUICK_ACTIONS.find((action) => {
      const dates = getQuickActionDates(action.key);

      return (
        dates.length > 0 &&
        dates.length === selected.length &&
        dates.every((date, index) => date === selected[index])
      );
    })?.key ?? ''
  );
}

function csvCell(value: string | number): string {
  const text = String(value);

  return '"' + text.replace(/"/g, '""') + '"';
}

function downloadOverviewReport(
  analytics: ReturnType<typeof calculateOverviewAnalytics>,
  storefront: 'all' | Storefront,
  dateRange: OverviewDateSelection,
) {
  const rows: (string | number)[][] = [
    ['SIMATU OVERVIEW REPORT'],
    [
      'Store',
      storefront === 'all'
        ? 'All stores'
        : storefront === 'yotaabo'
          ? 'Yotaabo'
          : 'Poshies',
    ],
    ['Date range', getSelectionLabel(dateRange)],
    [
      'Generated at',
      new Date().toLocaleString('en-ZA', {
        timeZone: 'Africa/Johannesburg',
      }),
    ],
    [],
    ['BUSINESS SUMMARY'],
    ['Metric', 'Value'],
    ['Orders received', analytics.businessSummary.ordersReceived],
    ['Outstanding orders', analytics.businessSummary.outstandingOrders],
    ['Pending orders', analytics.businessSummary.pendingOrders],
    ['Confirmed orders', analytics.businessSummary.confirmedOrders],
    ['Delivered orders', analytics.businessSummary.deliveredOrders],
    ['Cancelled orders', analytics.businessSummary.cancelledOrders],
    ['Total products', analytics.businessSummary.totalProducts],
    ['Active products', analytics.businessSummary.activeProducts],
    ['Hidden products', analytics.businessSummary.hiddenProducts],
    [],
    ['RECORDED SALES ACTIVITY'],
    ['Metric', 'Value'],
    [
      'Recorded sales value',
      analytics.salesPerformance.recordedSalesValue,
    ],
    ['Delivered orders', analytics.salesPerformance.deliveredOrders],
    [],
    ['ORDER OPERATIONS'],
    ['Status', 'Orders'],
    ['Pending', analytics.orderOperations.pending],
    ['Confirmed', analytics.orderOperations.confirmed],
    ['Delivered', analytics.orderOperations.delivered],
    ['Cancelled', analytics.orderOperations.cancelled],
    [],
    ['PRODUCT PERFORMANCE'],
    ['Product', 'Units sold', 'Recorded value'],
    ...analytics.productPerformance.map((item) => [
      item.productName,
      item.unitsSold,
      item.recordedValue,
    ]),
    [],
    ['STORE COMPARISON'],
    [
      'Store',
      'Orders',
      'Delivered orders',
      'Recorded sales value',
      'Units sold',
    ],
    ...analytics.storeComparison.map((item) => [
      item.storefront,
      item.orders,
      item.deliveredOrders,
      item.recordedSalesValue,
      item.unitsSold,
    ]),
  ];

  const csv = rows
    .map((row) => row.map(csvCell).join(','))
    .join('\r\n');

  const blob = new Blob(['\uFEFF', csv], {
    type: 'text/csv;charset=utf-8;',
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const storeName = storefront === 'all' ? 'all-stores' : storefront;
  const date = getOverviewDateKey(new Date());

  link.href = url;
  link.download =
    `simatu-overview-${storeName}-${getSelectionFileKey(dateRange)}-${date}.csv`;

  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

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
}: Props) {
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

      {isLoading && (
        <p
          role="status"
          style={{
            margin: 0,
            fontSize: 'var(--admin-size-supporting)',
            color: 'var(--admin-text-tertiary)',
          }}
        >
          Refreshing overview data…
        </p>
      )}

      {hasLoadError && (
        <div
          role="alert"
          className="admin-card-bg"
          style={{
            borderRadius: 'var(--ds-radius-lg)',
            borderWidth: '1px',
            borderStyle: 'solid',
            borderColor: 'var(--admin-border-subtle)',
            padding: 'var(--admin-space-md)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--admin-space-xs)',
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: 'var(--admin-size-body)',
              fontWeight: 'var(--admin-weight-semibold)',
              color: 'var(--admin-text-primary)',
            }}
          >
            Some overview data could not be refreshed.
          </p>

          {ordersLoadError && (
            <p
              style={{
                margin: 0,
                fontSize: 'var(--admin-size-supporting)',
                color: 'var(--admin-text-secondary)',
              }}
            >
              Orders: {ordersLoadError}
            </p>
          )}

          {productsLoadError && (
            <p
              style={{
                margin: 0,
                fontSize: 'var(--admin-size-supporting)',
                color: 'var(--admin-text-secondary)',
              }}
            >
              Products: {productsLoadError}
            </p>
          )}

          <p
            style={{
              margin: 0,
              fontSize: 'var(--admin-size-micro)',
              color: 'var(--admin-text-tertiary)',
            }}
          >
            Displayed figures may reflect the last successfully loaded snapshot.
          </p>
        </div>
      )}

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
