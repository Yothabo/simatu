import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ADMIN_STORAGE_KEYS } from '../../../constants/admin.constants';
import {
  readAdminSnapshot,
  writeAdminSnapshot,
} from '../../../utils/adminSnapshot';
import type {
  InventoryAggregates,
  InventoryItem,
  InventoryMovement,
  InventoryResponse,
  StockSummary,
  StorefrontFilter,
} from '../types';
import { isInventoryResponse } from '../utils';

type Args = {
  storefrontFilter: StorefrontFilter;
  accessToken: string;
  userId: string;
};

export function useInventoryData({
  storefrontFilter,
  accessToken,
  userId,
}: Args) {
  const accessTokenRef = useRef(accessToken);
  accessTokenRef.current = accessToken;

  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [movements, setMovements] = useState<InventoryMovement[]>([]);
  const [aggregates, setAggregates] = useState<InventoryAggregates>({
    received: 0,
    adjusted: 0,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState('');

  const applyInventoryResponse = useCallback(
    (data: InventoryResponse, persistSnapshot = true) => {
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
          data,
        );
      }
    },
    [storefrontFilter, userId],
  );

  const refreshInventory = useCallback(async () => {
    if (storefrontFilter === 'all' || !userId) {
      setInventory([]);
      setMovements([]);
      setAggregates({ received: 0, adjusted: 0 });
      setLoadError('');
      setIsLoading(false);
      return;
    }

    const token = accessTokenRef.current;
    if (!token) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setLoadError('');

    try {
      const response = await fetch(
        `/api/inventory?storefront=${encodeURIComponent(storefrontFilter)}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${accessTokenRef.current}`,
            Accept: 'application/json',
          },
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || 'Unable to load inventory.');
      }

      if (!isInventoryResponse(data)) {
        throw new Error('The inventory response has an invalid format.');
      }

      applyInventoryResponse(data);
      setLoadError('');
    } catch (error) {
      setLoadError(
        error instanceof Error ? error.message : 'Unable to load inventory.',
      );
    } finally {
      setIsLoading(false);
    }
  }, [applyInventoryResponse, storefrontFilter, userId]);

  useEffect(() => {
    if (storefrontFilter === 'all' || !userId) {
      setInventory([]);
      setMovements([]);
      setAggregates({ received: 0, adjusted: 0 });
      setLoadError('');
      setIsLoading(false);
      return;
    }

    const storageKey = `${ADMIN_STORAGE_KEYS.inventoryCache}:${storefrontFilter}`;

    const cachedInventory = readAdminSnapshot(
      storageKey,
      userId,
      isInventoryResponse,
    );

    if (cachedInventory) {
      applyInventoryResponse(cachedInventory, false);
      setLoadError('');
      setIsLoading(false);
      return;
    }

    void refreshInventory();
  }, [applyInventoryResponse, storefrontFilter, userId, refreshInventory]);

  const stockSummary = useMemo<StockSummary>(
    () => ({
      units: inventory.reduce(
        (total, item) => total + Number(item.on_hand_quantity || 0),
        0,
      ),
      reserved: inventory.reduce(
        (total, item) => total + Number(item.reserved_quantity || 0),
        0,
      ),
      available: inventory.reduce(
        (total, item) => total + Number(item.available_quantity || 0),
        0,
      ),
      outOfStock: inventory.filter(
        (item) => item.is_initialized && Number(item.available_quantity) <= 0,
      ).length,
      uninitialized: inventory.filter((item) => !item.is_initialized).length,
      valuation: inventory.reduce((total, item) => {
        if (item.supplier_cost === null || item.supplier_cost === undefined) {
          return total;
        }
        return (
          total +
          Number(item.supplier_cost) * Number(item.on_hand_quantity || 0)
        );
      }, 0),
      unvaluedProducts: inventory.filter(
        (item) =>
          Number(item.on_hand_quantity) > 0 &&
          (item.supplier_cost === null || item.supplier_cost === undefined),
      ).length,
      received: Number(aggregates.received) || 0,
      adjusted: Number(aggregates.adjusted) || 0,
    }),
    [inventory, aggregates],
  );

  return {
    inventory,
    movements,
    aggregates,
    isLoading,
    loadError,
    stockSummary,
    refreshInventory,
    applyInventoryResponse,
    setLoadError,
  };
}
