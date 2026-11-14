import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
} from 'react';
import { ADMIN_STORAGE_KEYS } from '../../constants/admin.constants';
import {
  readAdminSnapshot,
  writeAdminSnapshot,
} from '../../utils/adminSnapshot';
import {
  FiActivity,
  FiArrowDownCircle,
  FiArrowUpCircle,
  FiFileText,
  FiPackage,
  FiPlus,
  FiSearch,
  FiX,
  FiShoppingCart,
  FiTrendingDown,
  FiTrendingUp,
} from 'react-icons/fi';

type InventorySection = 'overview' | 'stock' | 'sales' | 'receipts';
type StockAction = 'receive' | 'adjust' | null;
type StorefrontFilter = 'all' | 'yotaabo' | 'poshies';

type InventoryItem = {
  product_id: string;
  product_name: string;
  sku: string | null;
  price: number | string | null;
  supplier_cost: number | string | null;
  image_url: string | null;
  is_active: boolean;
  on_hand_quantity: number;
  reserved_quantity: number;
  available_quantity: number;
  is_initialized: boolean;
  updated_at: string | null;
};

type InventoryMovement = {
  id: string;
  product_id: string;
  product_name: string;
  product_sku: string | null;
  movement_type: string;
  quantity_delta: number;
  reserved_delta: number;
  source_type: string;
  reason: string | null;
  actor_email: string | null;
  created_at: string;
};

type InventoryAggregates = {
  received: number | string;
  adjusted: number | string;
};

type InventoryResponse = {
  inventory: InventoryItem[];
  movements: InventoryMovement[];
  aggregates: InventoryAggregates;
};

function isNumericValue(value: unknown): boolean {
  return (
    (typeof value === 'number' || typeof value === 'string') &&
    String(value).trim() !== '' &&
    Number.isFinite(Number(value))
  );
}

function isNullableString(value: unknown): boolean {
  return value === null || typeof value === 'string';
}

function isInventoryResponse(value: unknown): value is InventoryResponse {
  if (!value || typeof value !== 'object') return false;

  const data = value as Record<string, unknown>;

  if (
    !Array.isArray(data.inventory) ||
    !Array.isArray(data.movements) ||
    !data.aggregates ||
    typeof data.aggregates !== 'object'
  ) {
    return false;
  }

  const inventoryValid = data.inventory.every((entry: unknown) => {
    if (!entry || typeof entry !== 'object') return false;

    const item = entry as Record<string, unknown>;

    return (
      typeof item.product_id === 'string' &&
      typeof item.product_name === 'string' &&
      isNullableString(item.sku) &&
      (item.price === null || isNumericValue(item.price)) &&
      (item.supplier_cost === null || isNumericValue(item.supplier_cost)) &&
      isNullableString(item.image_url) &&
      typeof item.is_active === 'boolean' &&
      isNumericValue(item.on_hand_quantity) &&
      isNumericValue(item.reserved_quantity) &&
      isNumericValue(item.available_quantity) &&
      typeof item.is_initialized === 'boolean' &&
      isNullableString(item.updated_at)
    );
  });

  const movementsValid = data.movements.every((entry: unknown) => {
    if (!entry || typeof entry !== 'object') return false;

    const item = entry as Record<string, unknown>;

    return (
      typeof item.id === 'string' &&
      typeof item.product_id === 'string' &&
      typeof item.product_name === 'string' &&
      isNullableString(item.product_sku) &&
      typeof item.movement_type === 'string' &&
      isNumericValue(item.quantity_delta) &&
      isNumericValue(item.reserved_delta) &&
      typeof item.source_type === 'string' &&
      isNullableString(item.reason) &&
      isNullableString(item.actor_email) &&
      typeof item.created_at === 'string'
    );
  });

  const aggregates = data.aggregates as Record<string, unknown>;

  return (
    inventoryValid &&
    movementsValid &&
    isNumericValue(aggregates.received) &&
    isNumericValue(aggregates.adjusted)
  );
}

const sections: {
  id: InventorySection;
  label: string;
  description: string;
  Icon: typeof FiPackage;
}[] = [
  {
    id: 'overview',
    label: 'Overview',
    description: 'Inventory performance and stock health',
    Icon: FiActivity,
  },
  {
    id: 'stock',
    label: 'Stock management',
    description: 'Balances, receiving and adjustments',
    Icon: FiPackage,
  },
  {
    id: 'sales',
    label: 'Direct sales',
    description: 'Record sales outside the storefront',
    Icon: FiShoppingCart,
  },
  {
    id: 'receipts',
    label: 'Receipts',
    description: 'Review and manage customer receipts',
    Icon: FiFileText,
  },
];

function MetricCard({
  label,
  value,
  description,
  Icon,
}: {
  label: string;
  value: string;
  description: string;
  Icon: typeof FiPackage;
}) {
  return (
    <article
      className="min-w-0 rounded-xl border p-4"
      style={{
        background: 'var(--admin-surface)',
        borderColor: 'var(--admin-border-subtle)',
      }}
    >
      <div className="flex items-center justify-between gap-3">
        <span
          className="text-xs font-medium"
          style={{ color: 'var(--admin-text-secondary)' }}
        >
          {label}
        </span>
        <Icon size={18} style={{ color: 'var(--admin-text-secondary)' }} />
      </div>
      <p
        className="mt-3 text-2xl font-semibold"
        style={{ color: 'var(--admin-text-primary)' }}
      >
        {value}
      </p>
      <p
        className="mt-1 text-xs"
        style={{ color: 'var(--admin-text-muted)' }}
      >
        {description}
      </p>
    </article>
  );
}

export default function AdminInventory({
  storefrontFilter,
  accessToken,
  userId,
}: {
  storefrontFilter: StorefrontFilter;
  accessToken: string;
  userId: string;
}) {
  const accessTokenRef = useRef(accessToken);
  accessTokenRef.current = accessToken;

  const [section, setSection] = useState<InventorySection>('overview');
  const [stockSearch, setStockSearch] = useState('');
  const [stockAction, setStockAction] = useState<StockAction>(null);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [movements, setMovements] = useState<InventoryMovement[]>([]);
  const [movementSearch, setMovementSearch] = useState('');
  const [movementTypeFilter, setMovementTypeFilter] = useState('all');
  const [aggregates, setAggregates] = useState<InventoryAggregates>({
    received: 0,
    adjusted: 0,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [selectedProductId, setSelectedProductId] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [reason, setReason] = useState('');
  const [adjustmentDirection, setAdjustmentDirection] =
    useState<'increase' | 'decrease'>('increase');
  const activeSection = sections.find((item) => item.id === section)!;

  const selectedProduct = inventory.find(
    (item) => item.product_id === selectedProductId
  );

  function applyInventoryResponse(
    data: InventoryResponse,
    persistSnapshot = true
  ) {
    setInventory(data.inventory);
    setMovements(data.movements);
    setAggregates({
      received: Number(data.aggregates.received) || 0,
      adjusted: Number(data.aggregates.adjusted) || 0,
    });

    if (persistSnapshot && userId && storefrontFilter !== 'all') {
      writeAdminSnapshot(
        `${ADMIN_STORAGE_KEYS.inventoryCache}:${storefrontFilter}`,
        userId,
        data
      );
    }
  }

  async function handleStockSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (
      !stockAction ||
      storefrontFilter === 'all' ||
      !accessToken ||
      !selectedProduct
    ) {
      setSubmitError('Select a storefront and a valid product.');
      return;
    }

    const parsedQuantity = Number(quantity);

    if (
      !Number.isInteger(parsedQuantity) ||
      parsedQuantity < 1 ||
      parsedQuantity > 1000000
    ) {
      setSubmitError('Quantity must be a whole number between 1 and 1,000,000.');
      return;
    }

    const action =
      stockAction === 'receive'
        ? selectedProduct.is_initialized
          ? 'replenishment'
          : 'opening-stock'
        : adjustmentDirection === 'increase'
          ? 'adjustment-increase'
          : 'adjustment-decrease';

    const requiresReason = action !== 'opening-stock';

    if (requiresReason && !reason.trim()) {
      setSubmitError('A reason is required for this stock movement.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');

    try {
      const response = await fetch('/api/inventory', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          storefront: storefrontFilter,
          product_id: selectedProduct.product_id,
          action,
          quantity: parsedQuantity,
          reason: reason.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || 'Unable to save the stock movement.');
      }

      // The stock movement is committed. Close the form before refreshing
      // so a refresh failure cannot lead to the same movement being submitted again.
      setStockAction(null);
      setSelectedProductId('');
      setQuantity('1');
      setReason('');
      setAdjustmentDirection('increase');

      try {
        const refreshResponse = await fetch(
          `/api/inventory?storefront=${encodeURIComponent(storefrontFilter)}`,
          {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${accessToken}`,
              Accept: 'application/json',
            },
          }
        );

        const refreshData = await refreshResponse.json();

        if (!refreshResponse.ok) {
          throw new Error(
            refreshData?.error || 'The inventory refresh failed.'
          );
        }

        if (!isInventoryResponse(refreshData)) {
          throw new Error('The inventory response has an invalid format.');
        }

        applyInventoryResponse(refreshData);
        setLoadError('');
      } catch (refreshError) {
        setLoadError(
          `Stock was saved, but inventory could not be refreshed. Reload the page. ${
            refreshError instanceof Error
              ? refreshError.message
              : ''
          }`.trim()
        );
      }
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : 'Unable to save the stock movement.'
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  useEffect(() => {
    if (storefrontFilter === 'all' || !userId) {
      setInventory([]);
      setMovements([]);
      setAggregates({ received: 0, adjusted: 0 });
      setLoadError('');
      setIsLoading(false);
      return;
    }

    const storageKey =
      `${ADMIN_STORAGE_KEYS.inventoryCache}:${storefrontFilter}`;

    const cachedInventory = readAdminSnapshot(
      storageKey,
      userId,
      isInventoryResponse
    );

    if (cachedInventory) {
      applyInventoryResponse(cachedInventory, false);
      setLoadError('');
      setIsLoading(false);
      return;
    }

    const token = accessTokenRef.current;

    if (!token) {
      setIsLoading(false);
      return;
    }

    const controller = new AbortController();
    setIsLoading(true);
    setLoadError('');

    async function loadInventory() {
      try {
        const response = await fetch(
          `/api/inventory?storefront=${encodeURIComponent(storefrontFilter)}`,
          {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${accessTokenRef.current}`,
              Accept: 'application/json',
            },
            signal: controller.signal,
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data?.error || 'Unable to load inventory.');
        }

        if (!isInventoryResponse(data)) {
          throw new Error('The inventory response has an invalid format.');
        }

        applyInventoryResponse(data);
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') return;

        setLoadError(
          error instanceof Error
            ? error.message
            : 'Unable to load inventory.'
        );
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    void loadInventory();

    return () => controller.abort();
  }, [storefrontFilter, userId, Boolean(accessToken)]);

  const filteredInventory = useMemo(() => {
    const search = stockSearch.trim().toLowerCase();

    if (!search) return inventory;

    return inventory.filter((item) =>
      [item.product_name, item.sku || '']
        .some((value) => value.toLowerCase().includes(search))
    );
  }, [inventory, stockSearch]);

  const filteredMovements = useMemo(() => {
    const search = movementSearch.trim().toLowerCase();

    return movements.filter((movement) => {
      const matchesSearch =
        !search ||
        [movement.product_name, movement.product_sku || ''].some((value) =>
          value.toLowerCase().includes(search)
        );

      const matchesType =
        movementTypeFilter === 'all' ||
        movement.movement_type === movementTypeFilter;

      return matchesSearch && matchesType;
    });
  }, [movements, movementSearch, movementTypeFilter]);

  const stockSummary = useMemo(() => ({
    units: inventory.reduce(
      (total, item) => total + Number(item.on_hand_quantity || 0), 0
    ),
    reserved: inventory.reduce(
      (total, item) => total + Number(item.reserved_quantity || 0), 0
    ),
    available: inventory.reduce(
      (total, item) => total + Number(item.available_quantity || 0), 0
    ),
    outOfStock: inventory.filter(
      (item) =>
        item.is_initialized &&
        Number(item.available_quantity) <= 0
    ).length,
    uninitialized: inventory.filter(
      (item) => !item.is_initialized
    ).length,
    valuation: inventory.reduce((total, item) => {
      if (item.supplier_cost === null || item.supplier_cost === undefined) {
        return total;
      }

      return total +
        Number(item.supplier_cost) * Number(item.on_hand_quantity || 0);
    }, 0),
    unvaluedProducts: inventory.filter(
      (item) =>
        Number(item.on_hand_quantity) > 0 &&
        (item.supplier_cost === null || item.supplier_cost === undefined)
    ).length,
    received: Number(aggregates.received) || 0,
    adjusted: Number(aggregates.adjusted) || 0,
  }), [inventory, aggregates]);

  return (
    <section
      className="flex w-full flex-col"
      style={{ gap: 'var(--admin-space-xl)' }}
    >
      <header className="flex flex-col gap-2">
        <div
          className="text-xs font-semibold uppercase tracking-wider"
          style={{ color: 'var(--admin-text-muted)' }}
        >
          Operations
        </div>
        <h1
          className="text-2xl font-semibold"
          style={{ color: 'var(--admin-text-primary)' }}
        >
          Inventory
        </h1>
        <p
          className="text-sm"
          style={{ color: 'var(--admin-text-secondary)' }}
        >
          Manage stock, direct sales and receipts across your store.
        </p>
      </header>

      <nav
        aria-label="Inventory sections"
        className="grid grid-cols-2 gap-2 sm:grid-cols-4"
      >
        {sections.map(({ id, label, Icon }) => {
          const selected = section === id;

          return (
            <button
              key={id}
              type="button"
              onClick={() => setSection(id)}
              aria-current={selected ? 'page' : undefined}
              className="flex min-h-11 items-center justify-center gap-2 rounded-lg border px-3 py-3 text-xs font-semibold transition-colors"
              style={{
                background: selected
                  ? 'var(--admin-text-primary)'
                  : 'var(--admin-surface)',
                color: selected
                  ? 'var(--admin-surface)'
                  : 'var(--admin-text-secondary)',
                borderColor: selected
                  ? 'var(--admin-text-primary)'
                  : 'var(--admin-border-subtle)',
              }}
            >
              <Icon size={16} />
              <span>{label}</span>
            </button>
          );
        })}
      </nav>

      <div className="flex flex-col gap-1">
        <h2
          className="text-lg font-semibold"
          style={{ color: 'var(--admin-text-primary)' }}
        >
          {activeSection.label}
        </h2>
        <p
          className="text-sm"
          style={{ color: 'var(--admin-text-secondary)' }}
        >
          {activeSection.description}
        </p>
      </div>

      {loadError && (
        <p
          role="alert"
          className="rounded-lg border p-3 text-sm"
          style={{
            background: 'var(--admin-page)',
            borderColor: 'var(--admin-border-subtle)',
            color: 'var(--admin-text-primary)',
          }}
        >
          {loadError}
        </p>
      )}

      {section === 'overview' && (
        <div className="flex flex-col gap-5">
          <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
            <MetricCard
              label="Stock units"
              value={
                isLoading || loadError
                  ? '—'
                  : stockSummary.units.toLocaleString('en-ZA')
              }
              description="Physical units on hand"
              Icon={FiPackage}
            />
            <MetricCard
              label="Stock valuation"
              value={
                isLoading || loadError
                  ? '—'
                  : new Intl.NumberFormat('en-ZA', {
                      style: 'currency',
                      currency: 'ZAR',
                      maximumFractionDigits: 2,
                    }).format(stockSummary.valuation)
              }
              description={
                stockSummary.unvaluedProducts > 0
                  ? `Partial valuation: ${stockSummary.unvaluedProducts} stocked products missing supplier cost`
                  : 'Based on recorded supplier costs'
              }
              Icon={FiTrendingUp}
            />
            <MetricCard
              label="Out of stock"
              value={
                isLoading || loadError
                  ? '—'
                  : stockSummary.outOfStock.toLocaleString('en-ZA')
              }
              description="Products with no available units"
              Icon={FiTrendingDown}
            />
            <MetricCard
              label="Reserved units"
              value={
                isLoading || loadError
                  ? '—'
                  : stockSummary.reserved.toLocaleString('en-ZA')
              }
              description="Allocated to orders"
              Icon={FiShoppingCart}
            />
            <MetricCard
              label="Available units"
              value={
                isLoading || loadError
                  ? '—'
                  : stockSummary.available.toLocaleString('en-ZA')
              }
              description="Physical stock less reservations"
              Icon={FiPackage}
            />
            <MetricCard
              label="Uninitialised"
              value={
                isLoading || loadError
                  ? '—'
                  : stockSummary.uninitialized.toLocaleString('en-ZA')
              }
              description="Products awaiting opening stock"
              Icon={FiPackage}
            />
          </div>

          {!isLoading && !loadError && inventory.length === 0 && (
            <div
              className="rounded-xl border p-4 text-sm"
              style={{
                background: 'var(--admin-surface)',
                borderColor: 'var(--admin-border-subtle)',
                color: 'var(--admin-text-secondary)',
              }}
            >
              No products are available in this storefront yet. Inventory
              metrics will appear here once products have been added.
            </div>
          )}

          <div
            className="rounded-xl border p-4"
            style={{
              background: 'var(--admin-surface)',
              borderColor: 'var(--admin-border-subtle)',
            }}
          >
            <h3
              className="font-semibold"
              style={{ color: 'var(--admin-text-primary)' }}
            >
              Recent stock movements
            </h3>
            <div
              className="mt-4 flex min-h-32 flex-col gap-3"
              style={{ color: 'var(--admin-text-muted)' }}
            >
              {isLoading ? (
                <p className="py-8 text-center text-sm">
                  Loading stock movements...
                </p>
              ) : movements.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-2 py-8 text-center">
                  <FiActivity size={22} />
                  <p className="text-sm">No stock movements recorded yet.</p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div className="relative">
                      <FiSearch
                        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2"
                        size={16}
                        style={{ color: 'var(--admin-text-muted)' }}
                      />
                      <input
                        type="search"
                        value={movementSearch}
                        onChange={(event) => setMovementSearch(event.target.value)}
                        placeholder="Search product name or SKU"
                        aria-label="Search movements by product name or SKU"
                        className="w-full rounded-lg border py-2 pl-9 pr-3 text-sm"
                        style={{
                          background: 'var(--admin-surface)',
                          borderColor: 'var(--admin-border-subtle)',
                          color: 'var(--admin-text-primary)',
                        }}
                      />
                    </div>

                    <select
                      value={movementTypeFilter}
                      onChange={(event) => setMovementTypeFilter(event.target.value)}
                      aria-label="Filter movements by type"
                      className="w-full rounded-lg border px-3 py-2 text-sm"
                      style={{
                        background: 'var(--admin-surface)',
                        borderColor: 'var(--admin-border-subtle)',
                        color: 'var(--admin-text-primary)',
                      }}
                    >
                      <option value="all">All movement types</option>
                      <option value="opening_stock">Opening stock</option>
                      <option value="replenishment">Replenishment</option>
                      <option value="adjustment_increase">Adjustment increase</option>
                      <option value="adjustment_decrease">Adjustment decrease</option>
                    </select>
                  </div>

                  <p className="text-xs" aria-live="polite">
                    Showing {Math.min(filteredMovements.length, 8)} of{' '}
                    {filteredMovements.length} matching movements
                    {' '}from the latest {movements.length} loaded records.
                  </p>

                  {filteredMovements.length === 0 ? (
                    <p className="py-8 text-center text-sm">
                      No stock movements match these filters.
                    </p>
                  ) : (
                    <div className="w-full self-stretch text-left">
                      {filteredMovements.slice(0, 8).map((movement) => (
                        <div
                          key={movement.id}
                          className="flex flex-col gap-1 border-b py-3 last:border-b-0 sm:flex-row sm:items-center sm:justify-between"
                          style={{ borderColor: 'var(--admin-border-subtle)' }}
                        >
                          <div>
                            <p
                              className="text-sm font-medium"
                              style={{ color: 'var(--admin-text-primary)' }}
                            >
                              {movement.product_name}
                            </p>
                            <p
                              className="text-xs"
                              style={{ color: 'var(--admin-text-muted)' }}
                            >
                              {movement.product_sku
                                ? `SKU: ${movement.product_sku} · `
                                : ''}
                              {movement.movement_type.replace(/_/g, ' ')}
                              {movement.reason ? ` · ${movement.reason}` : ''}
                            </p>
                          </div>
                          <div className="text-left sm:text-right">
                            <p
                              className="text-sm font-semibold"
                              style={{ color: 'var(--admin-text-primary)' }}
                            >
                              {movement.quantity_delta > 0 ? '+' : ''}
                              {movement.quantity_delta}
                            </p>
                            <p
                              className="text-xs"
                              style={{ color: 'var(--admin-text-muted)' }}
                            >
                              {new Date(movement.created_at).toLocaleString('en-ZA')}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {section === 'stock' && (
        <div className="flex flex-col gap-5">
          <div className="grid grid-cols-2 gap-3">
            <MetricCard
              label="Stock received"
              value={
                isLoading || loadError
                  ? '—'
                  : stockSummary.received.toLocaleString('en-ZA')
              }
              description="Opening stock and replenishment"
              Icon={FiArrowDownCircle}
            />
            <MetricCard
              label="Stock adjusted"
              value={
                isLoading || loadError
                  ? '—'
                  : stockSummary.adjusted.toLocaleString('en-ZA')
              }
              description="Units changed by adjustments"
              Icon={FiArrowUpCircle}
            />
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3
                className="text-base font-semibold"
                style={{ color: 'var(--admin-text-primary)' }}
              >
                Stock balances
              </h3>
              <p
                className="mt-1 text-sm"
                style={{ color: 'var(--admin-text-secondary)' }}
              >
                Track physical stock, reservations and available quantities.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => {
                  setSubmitError('');
                  setSelectedProductId('');
                  setQuantity('1');
                  setReason('');
                  setStockAction('receive');
                }}
                className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold"
                style={{
                  background: 'var(--admin-text-primary)',
                  color: 'var(--admin-surface)',
                }}
              >
                <FiPlus size={16} />
                Receive stock
              </button>
              <button
                type="button"
                onClick={() => {
                  setSubmitError('');
                  setSelectedProductId('');
                  setQuantity('1');
                  setReason('');
                  setAdjustmentDirection('increase');
                  setStockAction('adjust');
                }}
                className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold"
                style={{
                  background: 'var(--admin-surface)',
                  color: 'var(--admin-text-primary)',
                  borderColor: 'var(--admin-border-subtle)',
                }}
              >
                <FiActivity size={16} />
                Adjust stock
              </button>
            </div>
          </div>

          <div
            className="overflow-hidden rounded-xl border"
            style={{
              background: 'var(--admin-surface)',
              borderColor: 'var(--admin-border-subtle)',
            }}
          >
            <div className="border-b p-3 sm:p-4" style={{ borderColor: 'var(--admin-border-subtle)' }}>
              <div className="relative">
                <FiSearch
                  size={17}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2"
                  style={{ color: 'var(--admin-text-muted)' }}
                />
                <input
                  type="search"
                  value={stockSearch}
                  onChange={(event) => setStockSearch(event.target.value)}
                  placeholder="Search product name or SKU"
                  aria-label="Search stock balances"
                  className="min-h-11 w-full rounded-lg border py-2 pl-10 pr-3 text-sm outline-none"
                  style={{
                    background: 'var(--admin-surface)',
                    color: 'var(--admin-text-primary)',
                    borderColor: 'var(--admin-border-subtle)',
                  }}
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead>
                  <tr
                    className="border-b text-xs font-semibold"
                    style={{
                      color: 'var(--admin-text-secondary)',
                      borderColor: 'var(--admin-border-subtle)',
                    }}
                  >
                    <th className="px-4 py-3">Product</th>
                    <th className="px-4 py-3">SKU</th>
                    <th className="px-4 py-3 text-right">On hand</th>
                    <th className="px-4 py-3 text-right">Reserved</th>
                    <th className="px-4 py-3 text-right">Available</th>
                    <th className="px-4 py-3 text-right">Supplier cost</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-12 text-center">
                        <p style={{ color: 'var(--admin-text-secondary)' }}>
                          Loading stock balances...
                        </p>
                      </td>
                    </tr>
                  ) : filteredInventory.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-12 text-center">
                        <div className="flex flex-col items-center gap-2">
                          <FiPackage
                            size={24}
                            style={{ color: 'var(--admin-text-muted)' }}
                          />
                          <p
                            className="text-sm font-medium"
                            style={{ color: 'var(--admin-text-primary)' }}
                          >
                            {stockSearch
                              ? 'No matching stock balances'
                              : 'No products found'}
                          </p>
                          <p
                            className="max-w-md text-xs"
                            style={{ color: 'var(--admin-text-muted)' }}
                          >
                            Products for this storefront will appear here.
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredInventory.map((item) => (
                      <tr
                        key={item.product_id}
                        className="border-b last:border-b-0"
                        style={{ borderColor: 'var(--admin-border-subtle)' }}
                      >
                        <td className="px-4 py-3">
                          <div
                            className="font-medium"
                            style={{ color: 'var(--admin-text-primary)' }}
                          >
                            {item.product_name}
                          </div>
                          {!item.is_initialized && (
                            <span
                              className="text-xs"
                              style={{ color: 'var(--admin-text-muted)' }}
                            >
                              Opening stock required
                            </span>
                          )}
                        </td>
                        <td
                          className="px-4 py-3"
                          style={{ color: 'var(--admin-text-secondary)' }}
                        >
                          {item.sku || '—'}
                        </td>
                        <td
                          className="px-4 py-3 text-right tabular-nums"
                          style={{ color: 'var(--admin-text-primary)' }}
                        >
                          {Number(item.on_hand_quantity).toLocaleString('en-ZA')}
                        </td>
                        <td
                          className="px-4 py-3 text-right tabular-nums"
                          style={{ color: 'var(--admin-text-secondary)' }}
                        >
                          {Number(item.reserved_quantity).toLocaleString('en-ZA')}
                        </td>
                        <td
                          className="px-4 py-3 text-right tabular-nums"
                          style={{
                            color: Number(item.available_quantity) <= 0
                              ? 'var(--admin-text-muted)'
                              : 'var(--admin-text-primary)',
                          }}
                        >
                          {Number(item.available_quantity).toLocaleString('en-ZA')}
                        </td>
                        <td
                          className="px-4 py-3 text-right tabular-nums"
                          style={{ color: 'var(--admin-text-secondary)' }}
                        >
                          {item.supplier_cost === null
                            ? '—'
                            : new Intl.NumberFormat('en-ZA', {
                                style: 'currency',
                                currency: 'ZAR',
                              }).format(Number(item.supplier_cost))}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {stockAction && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4"
              role="presentation"
              style={{ background: 'rgba(0, 0, 0, 0.55)' }}
              onClick={(event) => {
                if (
                  !isSubmitting &&
                  event.target === event.currentTarget
                ) {
                  setStockAction(null);
                }
              }}
            >
              <section
                role="dialog"
                aria-modal="true"
                aria-labelledby="stock-action-title"
                className="my-auto w-full max-w-lg rounded-xl border p-5 shadow-xl"
                style={{
                  background: 'var(--admin-surface)',
                  borderColor: 'var(--admin-border-subtle)',
                }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3
                      id="stock-action-title"
                      className="text-lg font-semibold"
                      style={{ color: 'var(--admin-text-primary)' }}
                    >
                      {stockAction === 'receive'
                        ? 'Receive stock'
                        : 'Adjust stock'}
                    </h3>
                    <p
                      className="mt-1 text-sm"
                      style={{ color: 'var(--admin-text-secondary)' }}
                    >
                      {stockAction === 'receive'
                        ? 'Record new stock received from a supplier.'
                        : 'Record a verified correction to the physical stock balance.'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setStockAction(null)}
                    disabled={isSubmitting}
                    aria-label="Close dialog"
                    className="rounded-lg p-2"
                    style={{ color: 'var(--admin-text-secondary)' }}
                  >
                    <FiX size={19} />
                  </button>
                </div>

                <form onSubmit={handleStockSubmit} className="mt-5 flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label
                      htmlFor="inventory-product"
                      className="text-sm font-medium"
                      style={{ color: 'var(--admin-text-primary)' }}
                    >
                      Product
                    </label>
                    <select
                      id="inventory-product"
                      value={selectedProductId}
                      onChange={(event) => setSelectedProductId(event.target.value)}
                      required
                      disabled={isSubmitting}
                      className="min-h-11 w-full rounded-lg border px-3 py-2 text-sm outline-none"
                      style={{
                        background: 'var(--admin-surface)',
                        color: 'var(--admin-text-primary)',
                        borderColor: 'var(--admin-border-subtle)',
                      }}
                    >
                      <option value="">Select a product</option>
                      {inventory
                        .filter((item) => item.is_active)
                        .map((item) => (
                          <option key={item.product_id} value={item.product_id}>
                            {item.product_name}
                            {!item.is_initialized ? ' · Opening stock required' : ''}
                          </option>
                        ))}
                    </select>
                  </div>

                  {stockAction === 'adjust' && (
                    <div className="flex flex-col gap-1.5">
                      <label
                        htmlFor="inventory-adjustment-direction"
                        className="text-sm font-medium"
                        style={{ color: 'var(--admin-text-primary)' }}
                      >
                        Adjustment type
                      </label>
                      <select
                        id="inventory-adjustment-direction"
                        value={adjustmentDirection}
                        onChange={(event) =>
                          setAdjustmentDirection(
                            event.target.value as 'increase' | 'decrease'
                          )
                        }
                        disabled={isSubmitting}
                        className="min-h-11 w-full rounded-lg border px-3 py-2 text-sm outline-none"
                        style={{
                          background: 'var(--admin-surface)',
                          color: 'var(--admin-text-primary)',
                          borderColor: 'var(--admin-border-subtle)',
                        }}
                      >
                        <option value="increase">Increase stock</option>
                        <option value="decrease">Decrease stock</option>
                      </select>
                    </div>
                  )}

                  <div className="flex flex-col gap-1.5">
                    <label
                      htmlFor="inventory-quantity"
                      className="text-sm font-medium"
                      style={{ color: 'var(--admin-text-primary)' }}
                    >
                      Quantity
                    </label>
                    <input
                      id="inventory-quantity"
                      type="number"
                      min="1"
                      max="1000000"
                      step="1"
                      inputMode="numeric"
                      value={quantity}
                      onChange={(event) => setQuantity(event.target.value)}
                      required
                      disabled={isSubmitting}
                      className="min-h-11 w-full rounded-lg border px-3 py-2 text-sm outline-none"
                      style={{
                        background: 'var(--admin-surface)',
                        color: 'var(--admin-text-primary)',
                        borderColor: 'var(--admin-border-subtle)',
                      }}
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label
                      htmlFor="inventory-reason"
                      className="text-sm font-medium"
                      style={{ color: 'var(--admin-text-primary)' }}
                    >
                      Reason
                      {stockAction === 'receive' &&
                        selectedProduct &&
                        !selectedProduct.is_initialized
                        ? ' (optional for opening stock)'
                        : ''}
                    </label>
                    <textarea
                      id="inventory-reason"
                      value={reason}
                      onChange={(event) => setReason(event.target.value)}
                      required={
                        stockAction === 'adjust' ||
                        Boolean(selectedProduct?.is_initialized)
                      }
                      maxLength={500}
                      rows={3}
                      disabled={isSubmitting}
                      placeholder={
                        stockAction === 'receive'
                          ? 'Supplier, purchase reference or other details'
                          : 'Explain why this stock correction is required'
                      }
                      className="w-full rounded-lg border px-3 py-2 text-sm outline-none"
                      style={{
                        background: 'var(--admin-surface)',
                        color: 'var(--admin-text-primary)',
                        borderColor: 'var(--admin-border-subtle)',
                      }}
                    />
                  </div>

                  {submitError && (
                    <p
                      role="alert"
                      className="rounded-lg border p-3 text-sm"
                      style={{
                        background: 'var(--admin-page)',
                        borderColor: 'var(--admin-border-subtle)',
                        color: 'var(--admin-text-primary)',
                      }}
                    >
                      {submitError}
                    </p>
                  )}

                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setStockAction(null)}
                      disabled={isSubmitting}
                      className="min-h-10 rounded-lg border px-4 py-2 text-sm font-semibold"
                      style={{
                        background: 'var(--admin-surface)',
                        color: 'var(--admin-text-primary)',
                        borderColor: 'var(--admin-border-subtle)',
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={
                        isSubmitting ||
                        inventory.filter((item) => item.is_active).length === 0
                      }
                      className="min-h-10 rounded-lg px-4 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60"
                      style={{
                        background: 'var(--admin-text-primary)',
                        color: 'var(--admin-surface)',
                      }}
                    >
                      {isSubmitting
                        ? 'Saving...'
                        : stockAction === 'receive'
                          ? 'Save received stock'
                          : 'Save adjustment'}
                    </button>
                  </div>
                </form>
              </section>
            </div>
          )}
        </div>
      )}

      {section === 'sales' && (
        <div
          className="rounded-xl border p-5"
          style={{
            background: 'var(--admin-surface)',
            borderColor: 'var(--admin-border-subtle)',
          }}
        >
          <div className="flex items-center gap-2">
            <FiShoppingCart
              size={18}
              style={{ color: 'var(--admin-text-secondary)' }}
            />
            <h3
              className="font-semibold"
              style={{ color: 'var(--admin-text-primary)' }}
            >
              Direct sales
            </h3>
          </div>
          <p
            className="mt-2 text-sm"
            style={{ color: 'var(--admin-text-secondary)' }}
          >
            Record offline transactions, select products, capture quantities
            and payment details, and update inventory through audited movements.
          </p>
        </div>
      )}

      {section === 'receipts' && (
        <div
          className="rounded-xl border p-5"
          style={{
            background: 'var(--admin-surface)',
            borderColor: 'var(--admin-border-subtle)',
          }}
        >
          <div className="flex items-center gap-2">
            <FiFileText
              size={18}
              style={{ color: 'var(--admin-text-secondary)' }}
            />
            <h3
              className="font-semibold"
              style={{ color: 'var(--admin-text-primary)' }}
            >
              Receipt management
            </h3>
          </div>
          <p
            className="mt-2 text-sm"
            style={{ color: 'var(--admin-text-secondary)' }}
          >
            Review receipt records, approve them, send them and track their
            status.
          </p>
        </div>
      )}
    </section>
  );
}
