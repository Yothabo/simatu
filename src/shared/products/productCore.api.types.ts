import type {
  ProductCore,
  ProductCoreAttribute,
  ProductCoreMedia,
  ProductCoreVariant,
  StoreProductListing,
} from './productCore.types';

/** Request to create a platform product. Store and channel fields are prohibited. */
export type CreateProductCoreRequest = Pick<
  ProductCore,
  'name' | 'sku' | 'description' | 'categorySlug' | 'subcategoryId' | 'attributes'
> & {
  variants?: Array<Omit<ProductCoreVariant, 'id' | 'productId'>>;
  media?: Array<Omit<ProductCoreMedia, 'id' | 'productId'>>;
};

/** Partial update to platform-owned product definition only. */
export type UpdateProductCoreRequest = Partial<
  Pick<
    ProductCore,
    'name' | 'sku' | 'description' | 'categorySlug' | 'subcategoryId' | 'attributes' | 'status'
  >
> & {
  variants?: Array<Omit<ProductCoreVariant, 'productId'>>;
  media?: Array<Omit<ProductCoreMedia, 'productId'>>;
};

/** Store association is a separate operation and DTO. */
export type CreateStoreProductListingRequest = Pick<
  StoreProductListing,
  'storeId' | 'productId' | 'price' | 'status' | 'sortOrder'
> & {
  compareAtPrice?: number | null;
  titleOverride?: string | null;
  descriptionOverride?: string | null;
};

/** Marketplace participation is a distinct workflow; this DTO is intentionally not
 * part of product creation or product update.
 */
export type MarketplaceParticipationRequest = {
  productId: string;
  requestedAt?: string;
  notes?: string;
};

/** Typed response envelope for platform product API operations. */
export type ProductCoreResponse = {
  product: ProductCore;
};

export type ProductCoreListResponse = {
  products: ProductCore[];
};

/** Explicitly expose the attribute/media DTO types for API consumers. */
export type ProductCoreAttributeInput = ProductCoreAttribute;
export type ProductCoreMediaInput = Omit<ProductCoreMedia, 'id' | 'productId'>;
