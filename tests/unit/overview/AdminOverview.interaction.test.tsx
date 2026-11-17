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

  const value = article.querySelector('strong');

  if (!value) {
    throw new Error(`Metric value not found for "${label}".`);
  }

  return value.textContent ?? '';
}

async function openDateFilter(user: ReturnType<typeof userEvent.setup>) {
  await user.click(
    screen.getByRole('button', {
      name: 'Open reporting period filters',
    }),
  );

  return screen.getByRole('dialog', { name: 'Filter' });
}

async function openStoreFilter(user: ReturnType<typeof userEvent.setup>) {
  await user.click(
    screen.getByRole('button', {
      name: /Select store/,
    }),
  );

  return screen.getByRole('dialog', { name: 'Select store' });
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
      within(dialog).getByRole('button', { name: 'Last 7 days' }),
    );

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
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
        within(dialog).getByRole('button', { name: action }),
      );

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
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
      within(dialog).getByRole('button', { name: '2026' }),
    );

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(metricValue('Orders received')).toBe('8');
    expect(metricValue('Recorded sales value')).toContain('490');
    expect(metricValue('Delivered orders')).toBe('6');
  });

  it('keeps the reporting-period modal separate from the store selector', async () => {
    const user = userEvent.setup({
      advanceTimers: vi.advanceTimersByTime,
    });

    renderOverview();

    await openDateFilter(user);

    expect(
      screen.queryByRole('dialog', { name: 'Select store' }),
    ).not.toBeInTheDocument();

    await user.click(screen.getByRole('presentation'));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    await openStoreFilter(user);

    expect(
      screen.queryByRole('dialog', { name: 'Filter' }),
    ).not.toBeInTheDocument();
  });
});

describe('AdminOverview store-filter interactions', () => {
  it('opens the custom store modal instead of a native select', async () => {
    const user = userEvent.setup({
      advanceTimers: vi.advanceTimersByTime,
    });

    renderOverview();

    const dialog = await openStoreFilter(user);

    expect(within(dialog).getByRole('button', { name: 'All' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(
      within(dialog).getByRole('button', { name: 'Yotaabo' }),
    ).toHaveAttribute('aria-pressed', 'false');
    expect(
      within(dialog).getByRole('button', { name: 'Poshies' }),
    ).toHaveAttribute('aria-pressed', 'false');

    expect(screen.queryByRole('combobox', { name: 'Switch store' }))
      .not.toBeInTheDocument();
  });

  it('switches to Yotaabo and updates the dashboard figures', async () => {
    const user = userEvent.setup({
      advanceTimers: vi.advanceTimersByTime,
    });

    renderOverview();

    const dialog = await openStoreFilter(user);

    await user.click(
      within(dialog).getByRole('button', { name: 'Yotaabo' }),
    );

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Current store: Yotaabo/ }),
    ).toBeInTheDocument();

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

    const dialog = await openStoreFilter(user);

    await user.click(
      within(dialog).getByRole('button', { name: 'Poshies' }),
    );

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Current store: Poshies/ }),
    ).toBeInTheDocument();

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

    const dialog = await openStoreFilter(user);

    await user.click(
      within(dialog).getByRole('button', { name: 'All' }),
    );

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Current store: All/ }),
    ).toBeInTheDocument();

    expect(metricValue('Orders received')).toBe('8');
    expect(metricValue('Recorded sales value')).toContain('490');
    expect(metricValue('Delivered orders')).toBe('6');
  });

  it('closes the store modal when the backdrop is clicked without changing the store', async () => {
    const user = userEvent.setup({
      advanceTimers: vi.advanceTimersByTime,
    });

    renderOverview();

    await openStoreFilter(user);

    await user.click(screen.getByRole('presentation'));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Current store: All/ }),
    ).toBeInTheDocument();
    expect(metricValue('Orders received')).toBe('8');
  });
});
