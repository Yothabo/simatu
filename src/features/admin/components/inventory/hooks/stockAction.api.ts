import type { InventoryResponse, StorefrontFilter } from '../types';
import { isInventoryResponse } from '../utils';

type StockMovementAction =
  | 'replenishment'
  | 'opening-stock'
  | 'adjustment-increase'
  | 'adjustment-decrease';

type SubmitStockMovementArgs = {
  accessToken: string;
  storefront: StorefrontFilter;
  productId: string;
  action: StockMovementAction;
  quantity: number;
  reason: string;
};

export async function submitStockMovement({
  accessToken,
  storefront,
  productId,
  action,
  quantity,
  reason,
}: SubmitStockMovementArgs): Promise<void> {
  const response = await fetch('/api/inventory', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      storefront,
      product_id: productId,
      action,
      quantity,
      reason,
    }),
  });
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.error || 'Unable to save the stock movement.');
  }
}

type FetchInventoryArgs = {
  accessToken: string;
  storefront: StorefrontFilter;
};

export async function fetchInventorySnapshot({
  accessToken,
  storefront,
}: FetchInventoryArgs): Promise<InventoryResponse> {
  const response = await fetch(
    `/api/inventory?storefront=${encodeURIComponent(storefront)}`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/json',
      },
    },
  );
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.error || 'The inventory refresh failed.');
  }

  if (!isInventoryResponse(data)) {
    throw new Error('The inventory response has an invalid format.');
  }

  return data;
}
