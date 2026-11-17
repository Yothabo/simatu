import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import AdminOverview from '../../../src/features/admin/components/overview/AdminOverview';
import type { Order, Storefront } from '../../../src/features/admin/types/admin.types';

const USER_ID = 'overview-interaction-user';

function makeOrder(overrides: Partial<Order> = {}): Order {
  return {
    id: 'order-1',
    storefront: 'yotaabo',
    order_number: 'YOT-001',
    customer_name: 'Test Customer',
    customer_phone: '0000000000',
    status: 'delivered',
    subtotal: 100,
    created_at: '2026-11-10T10:00:00+02:00',
    updated_at: '2026-11-10T10:00:00+02:00',
    items: [
      {
        product_id: 'product-1',
        name: 'Test Fragrance',
        price: 100,
        qty: 1,
      },
    ],
    ...overrides,
  };
}

const orders: Order[] = [
  makeOrder({
    id: 'order-1',
    order_number: 'YOT-001',
    storefront: 'yotaabo',
    status: 'delivered',
    subtotal: 100,
    created_at: '2026-11-10T10:00:00+02:00',
  }),
  makeOrder({
    id: 'order-2',
    order_number: 'POS-002',
    storefront: 'poshies',
    status: 'pending',
    subtotal: 50,
    created_at: '2026-11-11T10:00:00+02:00',
  }),
  makeOrder({
    id: 'order-3',
    order_number: 'POS-003',
    storefront: 'poshies',
    status: 'delivered',
    subtotal: 200,
    created_at: '2026-11-12T10:00:00+02:00',
  }),
  makeOrder({
    id: 'order-4',
    order_number: 'YOT-004',
    storefront: 'yotaabo',
    status: 'cancelled',
    subtotal: 999,
    created_at: '2026-11-12T12:00:00+02:00',
  }),
  makeOrder({
    id: 'order-5',
    order_number: 'YOT-005',
    storefront: 'yotaabo',
    status: 'delivered',
    subtotal: 75,
    created_at: '2026-10-15T10:00:00+02:00',
  }),
  makeOrder({
    id: 'order-6',
    order_number: 'POS-006',
    storefront: 'poshies',
    status: 'delivered',
    subtotal: 60,
    created_at: '2026-09-15T10:00:00+02:00',
  }),
  makeOrder({
    id: 'order-7',
    order_number: 'YOT-007',
    storefront: 'yotaabo',
    status: 'pending',
    subtotal: 40,
    created_at: '2026-08-15T10:00:00+02:00',
  }),
  makeOrder({
    id: 'order-8',
    order_number: 'POS-008',
    storefront: 'poshies',
    status: 'delivered',
    subtotal: 30,
    created_at: '2026-07-15T10:00:00+02:00',
  }),
  makeOrder({
    id: 'order-9',
    order_number: 'YOT-009',
    storefront: 'yotaabo',
    status: 'delivered',
    subtotal: 25,
    created_at: '2026-05-15T10:00:00+02:00',
  }),
];

function renderOverview(initialStore: 'all' | Storefront = 'all') {
  function OverviewHarness() {
    const [storefront, setStorefront] =
      useState<'all' | Storefront>(initialStore);

    return (
      <AdminOverview
        userId={USER_ID}
        userName="Test Admin"
        onAddProduct={vi.fn()}
        orders={orders}
        products={[]}
        storefrontFilter={storefront}
        onStorefrontChange={setStorefront}
        canSwitchStore
        storeCreatedAt={{
          yotaabo: '2026-01-01T00:00:00+02:00',
          poshies: '2026-01-01T00:00:00+02:00',
        }}
        onRefresh={vi.fn().mockResolvedValue(undefined)}
        ordersLoadError={null}
        productsLoadError={null}
        isLoadingOrders={false}
        isLoadingProducts={false}
        activities={[]}
        isLoadingActivities={false}
        onViewAllActivities={vi.fn()}
      />
    );
  }

  render(<OverviewHarness />);
}

function metricValue(label: string): string {
  const labelElement = screen.getAllByText(label)[0];

  if (!labelElement) {
    throw new Error(`Metric label not found for "${label}".`);
  }

  const article = labelElement.closest('article');

  if (!article) {
    throw new Error(`Metric article not found for "${label}".`);
  }

  const value = article.querySelector(':scope > span');

  if (!value) {
    throw new Error(`Metric value not found for "${label}".`);
  }

  return value.textContent ?? '';
}

async function openDateFilter(user: ReturnType<typeof userEvent.setup>) {
  await user.click(
    screen.getByRole('button', {
      name: 'Filter overview by date',
    }),
  );

  return screen.getByRole('listbox');
}

function getStoreFilterGroup() {
  return screen.getByRole('group', {
    name: 'Filter overview by storefront',
  });
}

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2026-11-13T12:00:00.000Z'));
  sessionStorage.clear();
});

afterEach(() => {
  cleanup();
  sessionStorage.clear();
  vi.useRealTimers();
});

describe('AdminOverview reporting-period interactions', () => {
  it('starts unrestricted and displays analytics from all available orders', () => {
    renderOverview();

    expect(metricValue('Orders received')).toBe('8');
    expect(metricValue('Recorded sales value')).toContain('490');
    expect(metricValue('Delivered orders')).toBe('6');
    expect(metricValue('Pending')).toBe('2');
    expect(metricValue('Cancelled')).toBe('1');
  });

  it('opens the reporting-period modal and applies the exact 7-day range', async () => {
    const user = userEvent.setup({
      advanceTimers: vi.advanceTimersByTime,
    });

    renderOverview();

    const dialog = await openDateFilter(user);

    await user.click(
      within(dialog).getByRole('option', { name: 'Last 7 days' }),
    );

    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    expect(metricValue('Orders received')).toBe('3');
    expect(metricValue('Recorded sales value')).toContain('300');
    expect(metricValue('Delivered orders')).toBe('2');
    expect(metricValue('Pending')).toBe('1');
    expect(metricValue('Cancelled')).toBe('1');
  });

  it.each([
    {
      action: 'Last month',
      expectedOrders: '1',
      sales: '75',
      delivered: '1',
      pending: '0',
    },
    {
      action: 'Last 3 months',
      expectedOrders: '3',
      sales: '135',
      delivered: '2',
      pending: '1',
    },
    {
      action: 'Previous quarter',
      expectedOrders: '3',
      sales: '90',
      delivered: '2',
      pending: '1',
    },
    {
      action: 'Last 6 months',
      expectedOrders: '5',
      sales: '190',
      delivered: '4',
      pending: '1',
    },
  ])(
    'applies $action and recalculates dashboard analytics',
    async ({ action, expectedOrders, sales, delivered, pending }) => {
      const user = userEvent.setup({
        advanceTimers: vi.advanceTimersByTime,
      });

      renderOverview();

      const dialog = await openDateFilter(user);

      await user.click(
        within(dialog).getByRole('option', { name: action }),
      );

      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
      expect(metricValue('Orders received')).toBe(expectedOrders);
      expect(metricValue('Recorded sales value')).toContain(sales);
      expect(metricValue('Delivered orders')).toBe(delivered);
      expect(metricValue('Pending')).toBe(pending);
      expect(metricValue('Cancelled')).toBe('0');
    },
  );

  it('applies the 2026 selection through today', async () => {
    const user = userEvent.setup({
      advanceTimers: vi.advanceTimersByTime,
    });

    renderOverview();

    const dialog = await openDateFilter(user);

    await user.click(
      within(dialog).getByRole('option', { name: '2026' }),
    );

    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    expect(metricValue('Orders received')).toBe('8');
    expect(metricValue('Recorded sales value')).toContain('490');
    expect(metricValue('Delivered orders')).toBe('6');
  });

  it('keeps the reporting-period dropdown separate from the store selector', async () => {
    const user = userEvent.setup({
      advanceTimers: vi.advanceTimersByTime,
    });

    renderOverview();

    const listbox = await openDateFilter(user);
    expect(getStoreFilterGroup()).toBeInTheDocument();

    await user.click(
      within(listbox).getByRole('option', { name: 'Last 7 days' }),
    );

    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    expect(getStoreFilterGroup()).toBeInTheDocument();
    expect(
      within(getStoreFilterGroup()).getByRole('button', {
        name: 'Filter by All',
      }),
    ).toHaveAttribute('aria-current', 'page');
  });
});

describe('AdminOverview store-filter interactions', () => {
  it('renders accessible segmented store filters instead of a native select', () => {
    renderOverview();

    const group = getStoreFilterGroup();

    expect(
      within(group).getByRole('button', { name: 'Filter by All' }),
    ).toHaveAttribute('aria-current', 'page');
    expect(
      within(group).getByRole('button', { name: 'Filter by Yotaabo' }),
    ).not.toHaveAttribute('aria-current', 'page');
    expect(
      within(group).getByRole('button', { name: 'Filter by Poshies' }),
    ).not.toHaveAttribute('aria-current', 'page');

    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
  });

  it('switches to Yotaabo and updates the dashboard figures', async () => {
    const user = userEvent.setup({
      advanceTimers: vi.advanceTimersByTime,
    });

    renderOverview();

    await user.click(
      within(getStoreFilterGroup()).getByRole('button', {
        name: 'Filter by Yotaabo',
      }),
    );

    expect(
      within(getStoreFilterGroup()).getByRole('button', {
        name: 'Filter by Yotaabo',
      }),
    ).toHaveAttribute('aria-current', 'page');

    expect(metricValue('Orders received')).toBe('4');
    expect(metricValue('Recorded sales value')).toContain('200');
    expect(metricValue('Delivered orders')).toBe('3');
    expect(metricValue('Pending')).toBe('1');
    expect(metricValue('Cancelled')).toBe('1');
  });

  it('switches to Poshies and updates the dashboard figures', async () => {
    const user = userEvent.setup({
      advanceTimers: vi.advanceTimersByTime,
    });

    renderOverview();

    await user.click(
      within(getStoreFilterGroup()).getByRole('button', {
        name: 'Filter by Poshies',
      }),
    );

    expect(
      within(getStoreFilterGroup()).getByRole('button', {
        name: 'Filter by Poshies',
      }),
    ).toHaveAttribute('aria-current', 'page');

    expect(metricValue('Orders received')).toBe('4');
    expect(metricValue('Recorded sales value')).toContain('290');
    expect(metricValue('Delivered orders')).toBe('3');
    expect(metricValue('Pending')).toBe('1');
    expect(metricValue('Cancelled')).toBe('0');
  });

  it('returns to All and restores combined dashboard figures', async () => {
    const user = userEvent.setup({
      advanceTimers: vi.advanceTimersByTime,
    });

    renderOverview('yotaabo');

    expect(metricValue('Orders received')).toBe('4');

    await user.click(
      within(getStoreFilterGroup()).getByRole('button', {
        name: 'Filter by All',
      }),
    );

    expect(
      within(getStoreFilterGroup()).getByRole('button', {
        name: 'Filter by All',
      }),
    ).toHaveAttribute('aria-current', 'page');

    expect(metricValue('Orders received')).toBe('8');
    expect(metricValue('Recorded sales value')).toContain('490');
    expect(metricValue('Delivered orders')).toBe('6');
  });

  it('preserves the selected store when the reporting period changes', async () => {
    const user = userEvent.setup({
      advanceTimers: vi.advanceTimersByTime,
    });

    renderOverview('yotaabo');

    const listbox = await openDateFilter(user);
    await user.click(
      within(listbox).getByRole('option', { name: 'Last 7 days' }),
    );

    expect(
      within(getStoreFilterGroup()).getByRole('button', {
        name: 'Filter by Yotaabo',
      }),
    ).toHaveAttribute('aria-current', 'page');
  });
});
