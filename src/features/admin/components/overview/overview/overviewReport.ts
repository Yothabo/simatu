import type { Storefront } from '../../../types/admin.types';
import type { OverviewDateSelection } from '../../../types/overview.types';
import type { calculateOverviewAnalytics } from '../../../analytics/overview/overviewCalculations';
import { getOverviewDateKey } from '../../../utils/overview/dateRanges';
import {
  getSelectionFileKey,
  getSelectionLabel,
} from './overviewDate.utils';

function csvCell(value: string | number): string {
  const text = String(value);

  return '"' + text.replace(/"/g, '""') + '"';
}

export function downloadOverviewReport(
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
