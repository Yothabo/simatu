/**
 * Simatu-owned product core.
 *
 * A product is platform-defined and store-independent. Store listings and
 * Marketplace participation must reference ProductCore rather than extend it
 * with channel-specific visibility, pricing, or status fields.
 *
 * This contract is an initial type foundation; persistence/API migration
 * remains staged and must preserve legacy references.
 */

export type ProductCoreStatus = 'draft' | 'active' | 'archived';

export type ProductAttributeValue =
  | string
  | number
  | boolean
  | null
  | ProductAttributeValue[]
  | { [key: string]: ProductAttributeValue };

export interface ProductCoreAttribute {
  key: string;
  value: ProductAttributeValue;
}

export interface ProductCoreVariant {
  id: string;
  productId: string;
  sku?: string | null;
  name: string;
  options: Record<string, ProductAttributeValue>;
  status: ProductCoreStatus;
}

export interface ProductCoreMedia {
  id: string;
  productId: string;
  variantId?: string | null;
  url: string;
  altText?: string | null;
  mediaType: 'image' | 'video';
  sortOrder: number;
}

export interface ProductCore {
  id: string;
  name: string;
  sku?: string | null;
  description: string | null;
  categorySlug: string;
  subcategoryId: string;
  attributes: ProductCoreAttribute[];
  variants: ProductCoreVariant[];
  media: ProductCoreMedia[];
  status: ProductCoreStatus;
  createdAt: string;
  updatedAt: string;
}

/**
 * Store-specific commerce data is deliberately separate from ProductCore.
 * A listing references a platform product and holds store-owned commercial
 * configuration. It is not the product definition.
 */
export type StoreListingStatus = 'draft' | 'published' | 'hidden' | 'archived';

export interface StoreProductListing {
  id: string;
  storeId: string;
  productId: string;
  titleOverride?: string | null;
  descriptionOverride?: string | null;
  price: number;
  compareAtPrice?: number | null;
  status: StoreListingStatus;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}
