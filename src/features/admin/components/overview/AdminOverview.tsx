import { useMemo, useState } from 'react';
import {
  FiChevronDown,
  FiDownload,
  FiFilter,
  FiPlus,
  FiRefreshCw,
} from 'react-icons/fi';
import type { AdminRow, Order, Storefront } from '../../types/admin.types';
import type { AdminActivity } from '../../hooks/useAdminActivity';
import type { OverviewDateSelection } from '../../types/overview.types';
import { calculateOverviewAnalytics } from '../../analytics/overview/overviewCalculations';
import { getOverviewDateKey, getOverviewDateRange } from '../../utils/overview/dateRanges';
import {
  getOverviewQuickActionDates,
  isOverviewQuickActionActive,
} from '../../utils/overview/quickActions';
import {
  readOverviewDateSelection,
  writeOverviewDateSelection,
} from '../../utils/overview/dateSelectionStorage';
import BusinessSummary from './sections/BusinessSummary';
import SalesPerformance from './sections/SalesPerformance';
import OrderOperations from './sections/OrderOperations';
import ProductPerformance from './sections/ProductPerformance';
import StoreComparison from './sections/StoreComparison';
import RecentActivity from './sections/RecentActivity';
import './overview.css';

type Props = {
  userId: string;
  userName: string;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onSearchFocus: () => void;
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

function getFirstName(userName: string): string {
  const firstName = userName.trim().split(/[\\s._-]+/)[0];

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
      .replace(/\\b\\w/g, (character) => character.toUpperCase());
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

const controlStyle = {
  borderColor: 'var(--admin-border-subtle)',
  borderRadius: 'var(--admin-radius-md, 8px)',
  background: 'var(--admin-surface)',
  color: 'var(--admin-text-primary)',
};

const primaryButtonStyle = {
  background: 'var(--admin-text-primary)',
  color: 'var(--admin-surface)',
};

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
    ['Store', storefront === 'all' ? 'All stores' : storefront === 'yotaabo' ? 'Yotaabo' : 'Poshies'],
    ['Date range', getSelectionLabel(dateRange)],
    ['Generated at', new Date().toLocaleString('en-ZA', { timeZone: 'Africa/Johannesburg' })],
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
    ['Recorded sales value', analytics.salesPerformance.recordedSalesValue],
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
    ['Store', 'Orders', 'Delivered orders', 'Recorded sales value', 'Units sold'],
    ...analytics.storeComparison.map((item) => [
      item.storefront,
      item.orders,
      item.deliveredOrders,
      item.recordedSalesValue,
      item.unitsSold,
    ]),
  ];

  const csv = rows.map((row) => row.map(csvCell).join(',')).join('\r\n');
  const blob = new Blob(['\uFEFF', csv], {
    type: 'text/csv;charset=utf-8;',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const storeName = storefront === 'all' ? 'all-stores' : storefront;
  const date = getOverviewDateKey(new Date());

  link.href = url;
  link.download = `simatu-overview-${storeName}-${getSelectionFileKey(dateRange)}-${date}.csv`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export default function AdminOverview({
  userId,
  userName,
  searchQuery,
  onSearchChange,
  onSearchFocus,
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
    () => readOverviewDateSelection(userId)
  );
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isStoreFilterOpen, setIsStoreFilterOpen] = useState(false);

  const storeStartDate = useMemo(() => {
    const dates = storefrontFilter === 'all'
      ? Object.values(storeCreatedAt)
      : [storeCreatedAt[storefrontFilter]];

    return dates
      .filter((value): value is string => Boolean(value))
      .sort((a, b) => new Date(a).getTime() - new Date(b).getTime())[0];
  }, [storeCreatedAt, storefrontFilter]);

  const selectedDates = dateRange.type === 'dates'
    ? dateRange.dates
    : [];

const quickActions = [
  { key: '7-days', label: 'Last 7 days' },
  { key: 'month', label: 'Last month' },
  { key: '3-months', label: 'Last 3 months' },
  { key: 'quarter', label: 'Previous quarter' },
  { key: '6-months', label: 'Last 6 months' },
  { key: '2026', label: '2026' },
];

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
    [orders, products, dateRange, storefrontFilter, storeStartDate],
  );

  const hasLoadError = Boolean(ordersLoadError || productsLoadError);
  const isLoading = isLoadingOrders || isLoadingProducts;

  return (
    <section
      className="admin-overview flex w-full flex-col"
      style={{ gap: 'var(--admin-space-xl)' }}
    >
      <header className="flex flex-col gap-4">
        <div className="w-full">
          <h2 className="text-2xl font-semibold leading-tight tracking-tight overview-text-primary sm:text-3xl">
            {getTimeBasedGreeting()}, {getFirstName(userName)}
          </h2>
          <p className="mt-2 text-sm overview-text-secondary">
            Here's your business overview for today.
          </p>
        </div>

          <div className="flex w-full items-center gap-2">
            {canSwitchStore && (
              <button
                type="button"
                onClick={() => setIsStoreFilterOpen(true)}
                aria-label={`Select store. Current store: ${
                  storefrontFilter === 'all' ? 'All' : storefrontFilter === 'yotaabo' ? 'Yotaabo' : 'Poshies'
                }`}
                aria-haspopup="dialog"
                aria-expanded={isStoreFilterOpen}
                className="inline-flex min-h-10 min-w-0 flex-1 items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--admin-text-primary)]"
                style={controlStyle}
              >
                <span>
                  {storefrontFilter === 'all' ? 'All' : storefrontFilter === 'yotaabo' ? 'Yotaabo' : 'Poshies'}
                </span>
                <FiChevronDown size={16} aria-hidden="true" />
              </button>
            )}

            <button
              type="button"
              onClick={() => void onRefresh()}
              disabled={isLoading}
              aria-label={isLoading ? 'Refreshing overview' : 'Refresh overview'}
              title={isLoading ? 'Refreshing' : 'Refresh'}
              className="inline-flex min-h-10 min-w-0 flex-1 items-center justify-center gap-2 rounded-lg border px-2 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60"
              style={controlStyle}
            >
              <FiRefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
              <span className="hidden sm:inline">{isLoading ? 'Refreshing' : 'Refresh'}</span>
            </button>

            <button
              type="button"
              onClick={() =>
                downloadOverviewReport(analytics, storefrontFilter, dateRange)
              }
              disabled={hasLoadError}
              aria-label="Export overview report"
              title={hasLoadError ? 'Export unavailable while data has load errors' : 'Export current Overview report'}
              className="inline-flex min-h-10 min-w-0 flex-1 items-center justify-center gap-2 rounded-lg border px-2 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60"
              style={controlStyle}
            >
              <FiDownload size={16} />
              <span className="hidden sm:inline">Export</span>
            </button>

            <button
              type="button"
              onClick={() => setIsFilterOpen(true)}
              aria-label="Open reporting period filters"
              title={`Reporting period: ${getSelectionLabel(dateRange)}`}
              className="inline-flex min-h-10 min-w-0 flex-1 items-center justify-center gap-2 rounded-lg border px-2 py-2 text-sm font-semibold"
              style={controlStyle}
            >
              <FiFilter size={16} />
              <span className="hidden sm:inline">Filter</span>
            </button>
          </div>

        <div className="flex w-full items-center gap-2">
          <input
            value={searchQuery}
            onChange={(event) => onSearchChange(event.target.value)}
            onFocus={onSearchFocus}
            placeholder="Search products"
            aria-label="Search products"
            className="min-h-10 min-w-0 flex-1 rounded-lg border px-3 py-2 text-sm outline-none transition-colors placeholder:text-[var(--admin-text-secondary)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--admin-text-primary)]"
            style={controlStyle}
          />

          <button
            type="button"
            onClick={onAddProduct}
            aria-label="Add product"
            title="Add product"
            className="inline-flex min-h-10 min-w-10 shrink-0 items-center justify-center gap-2 rounded-lg px-2 py-2 text-sm font-semibold sm:px-3"
            style={primaryButtonStyle}
          >
            <FiPlus size={16} />
            <span className="hidden sm:inline">Add product</span>
          </button>
        </div>
      </header>

      {isStoreFilterOpen && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center p-4"
          role="presentation"
          style={{ background: 'rgba(0, 0, 0, 0.55)' }}
          onClick={(event) => {
            if (event.target === event.currentTarget) setIsStoreFilterOpen(false);
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="overview-store-filter-title"
            className="flex w-full max-w-md flex-col overflow-hidden rounded-xl border shadow-xl"
            style={{
              background: 'var(--admin-bg)',
              borderColor: 'var(--admin-border-subtle)',
            }}
          >
            <header
              className="border-b px-5 py-4"
              style={{ borderColor: 'var(--admin-border-subtle)' }}
            >
              <h2
                id="overview-store-filter-title"
                className="text-base font-semibold"
                style={{ color: 'var(--admin-text-primary)' }}
              >
                Select store
              </h2>
            </header>
            <div
              className="flex flex-col gap-2 p-5"
              role="group"
              aria-label="Available stores"
            >
              {([
                { value: 'all', label: 'All' },
                { value: 'yotaabo', label: 'Yotaabo' },
                { value: 'poshies', label: 'Poshies' },
              ] as const).map((option) => {
                const active = storefrontFilter === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    aria-pressed={active}
                    onClick={() => {
                      onStorefrontChange(option.value);
                      setIsStoreFilterOpen(false);
                    }}
                    className="flex min-h-11 w-full items-center justify-start rounded-lg border px-4 py-3 text-left text-sm font-semibold shadow-sm transition-all hover:brightness-95 hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--admin-text-primary)] active:scale-[0.99]"
                    style={{
                      borderColor: active ? 'var(--admin-text-primary)' : 'var(--admin-border-subtle)',
                      background: active ? 'var(--admin-text-primary)' : 'var(--admin-surface)',
                      color: active ? 'var(--admin-surface)' : 'var(--admin-text-primary)',
                    }}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </section>
        </div>
      )}

      {isFilterOpen && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center p-4"
          role="presentation"
          style={{ background: 'rgba(0, 0, 0, 0.55)' }}
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              setIsFilterOpen(false);
            }
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="overview-filter-title"
            className="flex w-full max-w-md flex-col overflow-hidden rounded-xl border shadow-xl"
            style={{
              background: 'var(--admin-bg)',
              borderColor: 'var(--admin-border-subtle)',
            }}
          >
            <header
              className="border-b px-5 py-4"
              style={{ borderColor: 'var(--admin-border-subtle)' }}
            >
              <h2
                id="overview-filter-title"
                className="text-base font-semibold"
                style={{ color: 'var(--admin-text-primary)' }}
              >
                Filter
              </h2>
            </header>

            <div className="flex flex-col gap-5 p-5">
              <div
                className="flex flex-col gap-2"
                role="group"
                aria-label="Quick date selections"
              >
                {quickActions.map((action) => {
                  const todayKey = getOverviewDateKey(new Date());
                  const yearStart = Date.UTC(2026, 0, 1);
                  const yearEndKey = '2026-12-31';
                  const lastYearDate = todayKey < yearEndKey ? todayKey : yearEndKey;
                  const [endYear, endMonth, endDay] = lastYearDate.split('-').map(Number);
                  const yearEnd = Date.UTC(endYear, endMonth - 1, endDay);

                  const yearDates = Array.from(
                    { length: Math.max(0, Math.floor((yearEnd - yearStart) / 86400000) + 1) },
                    (_, index) => getOverviewDateKey(
                      new Date(yearStart + index * 86400000)
                    ),
                  );

                  const dates = action.key === '2026'
                    ? yearDates
                    : getOverviewQuickActionDates(action.key, new Date());

                  const active = action.key === '2026'
                    ? selectedDates.length === dates.length &&
                      dates.every((date, index) => selectedDates[index] === date)
                    : isOverviewQuickActionActive(
                        action.key,
                        selectedDates,
                        new Date(),
                      );

                  return (
                    <button
                      key={action.key}
                      type="button"
                      aria-label={action.label}
                      aria-pressed={active}
                      disabled={dates.length === 0}
                      onClick={() => {
                        const selection: OverviewDateSelection = {
                          type: 'dates',
                          dates,
                        };
                        writeOverviewDateSelection(userId, selection);
                        setDateRange(selection);
                        setIsFilterOpen(false);
                      }}
                      className="flex min-h-11 w-full items-center justify-start rounded-lg border px-4 py-3 text-left text-sm font-semibold shadow-sm transition-all hover:brightness-95 hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--admin-text-primary)] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-25"
                      style={{
                        borderColor: active
                          ? 'var(--admin-text-primary)'
                          : 'var(--admin-border-subtle)',
                        background: active
                          ? 'var(--admin-text-primary)'
                          : 'var(--admin-surface)',
                        color: active
                          ? 'var(--admin-surface)'
                          : 'var(--admin-text-primary)',
                      }}
                    >
                      <span>{action.label}</span>
                    </button>
                  );
                })}
              </div>

            </div>

          </section>
        </div>
      )}

      {isLoading && (
        <p className="text-sm overview-text-muted" role="status">
          Refreshing overview data…
        </p>
      )}

      {hasLoadError && (
        <div
          role="alert"
          className="rounded-xl border p-4 text-sm"
          style={{
            borderColor: 'var(--admin-border-subtle)',
            color: 'var(--admin-text-primary)',
            background: 'var(--admin-surface)',
          }}
        >
          <p className="font-semibold">Some overview data could not be refreshed.</p>
          {ordersLoadError && <p className="mt-1">Orders: {ordersLoadError}</p>}
          {productsLoadError && <p className="mt-1">Products: {productsLoadError}</p>}
          <p className="mt-2 text-xs overview-text-muted">
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
