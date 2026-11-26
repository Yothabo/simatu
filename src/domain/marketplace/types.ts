/**
 * Simatu marketplace domain contracts.
 *
 * These contracts separate business identity and shared offering presentation from
 * product purchasing and service booking lifecycles. They intentionally do not
 * replace the legacy product API until the migration and adapter are implemented.
 */

export type EntityId = string;
export type ISODateTime = string;
export type CurrencyCode = string;

export type BusinessStatus = 'draft' | 'active' | 'suspended' | 'retired';
export type OfferingStatus = 'draft' | 'pending_review' | 'active' | 'suspended' | 'retired';
export type OfferingKind = 'product' | 'service' | 'experience';
export type MarketplaceEligibilityStatus = 'not_submitted' | 'submitted' | 'received' | 'under_review' | 'eligible' | 'rejected' | 'suspended';

export interface Business {
  id: EntityId;
  name: string;
  slug: string;
  description?: string | null;
  status: BusinessStatus;
  categoryIds: EntityId[];
  locationIds?: EntityId[];
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
}

export interface Offering {
  id: EntityId;
  businessId: EntityId;
  kind: OfferingKind;
  name: string;
  description?: string | null;
  media: OfferingMedia[];
  status: OfferingStatus;
  marketplaceVisible: boolean;
  storefrontVisible: boolean;
  marketplaceEligibility: MarketplaceEligibilityStatus;
  currency?: CurrencyCode;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
}

export interface OfferingMedia {
  id: EntityId;
  url: string;
  alt: string;
  sortOrder: number;
}

export type AttributeValueType =
  | 'text'
  | 'number'
  | 'boolean'
  | 'single_select'
  | 'multi_select'
  | 'measurement'
  | 'date';

export interface AttributeOption {
  value: string;
  label: string;
}

export interface MeasurementValue {
  value: number;
  unit: string;
  profile?: string;
}

export type TypedAttributeValue = string | number | boolean | string[] | MeasurementValue;

export interface AttributeDefinition {
  id: EntityId;
  key: string;
  label: string;
  type: AttributeValueType;
  required: boolean;
  searchable: boolean;
  filterable: boolean;
  customerSelectable: boolean;
  variantDefining: boolean;
  inventoryDefining: boolean;
  affectsPrice: boolean;
  unit?: string;
  options?: AttributeOption[];
  min?: number;
  max?: number;
}

export interface ProductVariant {
  id: EntityId;
  offeringId: EntityId;
  sku?: string | null;
  attributes: Record<string, TypedAttributeValue>;
  price?: number | null;
  active: boolean;
}

export interface ProductOffering extends Offering {
  kind: 'product';
  variants: ProductVariant[];
  attributes: Record<string, TypedAttributeValue>;
  inventory: ProductInventorySummary;
  fulfillmentType: 'physical' | 'digital' | 'made_to_order';
}

export interface ProductInventorySummary {
  onHand: number;
  reserved: number;
  available: number;
  marketplaceEligibleQuantity?: number;
}

export type ServicePricingModel = 'fixed' | 'hourly' | 'per_person' | 'starting_at' | 'quote';
export type ServiceDeliveryMode = 'at_business' | 'at_customer' | 'remote' | 'multiple';

export interface ServiceOffering extends Offering {
  kind: 'service' | 'experience';
  durationMinutes?: number | null;
  pricingModel: ServicePricingModel;
  price?: number | null;
  deliveryMode: ServiceDeliveryMode;
  locationIds: EntityId[];
  providerIds: EntityId[];
  resourceIds: EntityId[];
  capacity?: number | null;
  requiresApproval: boolean;
}

export type BookingStatus =
  | 'draft'
  | 'requested'
  | 'held'
  | 'confirmed'
  | 'completed'
  | 'cancelled'
  | 'declined'
  | 'expired'
  | 'rescheduled'
  | 'no_show';

export interface BookingSelection {
  id: EntityId;
  serviceOfferingId: EntityId;
  businessId: EntityId;
  providerId?: EntityId | null;
  resourceId?: EntityId | null;
  startAt: ISODateTime;
  endAt: ISODateTime;
  participantCount: number;
  selectedOptions: Record<string, TypedAttributeValue>;
  status: BookingStatus;
}

export interface MarketplaceCategory {
  id: EntityId;
  slug: string;
  name: string;
  description?: string | null;
  parentId?: EntityId | null;
  active: boolean;
  sortOrder: number;
}

export interface MarketplaceBusinessCategory {
  businessId: EntityId;
  categoryId: EntityId;
}

export interface MarketplaceReceivingRecord {
  id: EntityId;
  offeringId: EntityId;
  submittedByBusinessId: EntityId;
  expectedQuantity: number;
  receivedQuantity: number;
  discrepancyQuantity: number;
  status: 'submitted' | 'received' | 'verified' | 'rejected';
  verifiedBy?: EntityId | null;
  verifiedAt?: ISODateTime | null;
}
