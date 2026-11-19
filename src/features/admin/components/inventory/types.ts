export type InventorySection = 'overview' | 'stock' | 'sales' | 'receipts';

export type StockAction = 'receive' | 'adjust' | null;

export type StorefrontFilter = 'all' | 'yotaabo' | 'poshies';

export type InventoryItem = {
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

export type InventoryMovement = {
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

export type InventoryAggregates = {
  received: number | string;
  adjusted: number | string;
};

export type InventoryResponse = {
  inventory: InventoryItem[];
  movements: InventoryMovement[];
  aggregates: InventoryAggregates;
};

export type StockSummary = {
  units: number;
  reserved: number;
  available: number;
  outOfStock: number;
  uninitialized: number;
  valuation: number;
  unvaluedProducts: number;
  received: number;
  adjusted: number;
};

export type AddAction = 'direct-sale' | 'new-product' | 'receipt';

export type InventoryProps = {
  storefrontFilter: StorefrontFilter;
  onStorefrontChange: (value: StorefrontFilter) => void;
  accessToken: string;
  userId: string;
};
