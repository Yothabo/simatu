import type { AdminProduct } from './types';

export const DRAFT_STORAGE_KEY = 'yotaabo-admin-product-form-draft';

export const EMPTY_PRODUCT: AdminProduct = {
  storefront: 'yotaabo',
  name: '',
  price: 0,
  supplier_cost: null,
  sku: '',
  category: '',
  category_id: null,
  subcategory: '',
  subcategory_id: null,
  description: '',
  image_url: '',
  is_active: true,
  marketplace_visible: true,
  storefront_visible: true,
  sort_order: 0,
  sizes: [],
  order_count: 0,
};
