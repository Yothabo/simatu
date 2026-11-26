import type { AdminRow } from '../../types/admin.types';

export type AdminProduct = {
  id?: string;
  storefront: 'yotaabo' | 'poshies';
  name: string;
  price: number;
  supplier_cost?: number | null;
  sku?: string | null;
  category: string;
  category_id: string | null;
  subcategory: string;
  subcategory_id: string | null;
  description: string | null;
  image_url: string | null;
  is_active: boolean;
  marketplace_visible: boolean;
  storefront_visible: boolean;
  sort_order: number;
  sizes: string[];
  order_count: number;
  marketplace_category_slug?: string | null;
  marketplace_subcategory_id?: string | null;
};

export type AdminProductFormProps = {
  isOpen: boolean;
  onClose: () => void;
  onSaved: (product: AdminRow) => void;
  productToEdit?: AdminProduct | null;
  adminRole?: 'super_admin' | 'store_admin' | null;
  storeSlug?: 'yotaabo' | 'poshies' | null;
};

export type CategoryOption = {
  value: string;
  label: string;
};
