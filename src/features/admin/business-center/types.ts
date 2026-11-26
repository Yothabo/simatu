/** Shared contracts for the Simatu Business Center ecosystem. */
export type BusinessCenterModuleId =
  | 'subscriptions'
  | 'promotions'
  | 'campaigns'
  | 'advertising'
  | 'commission'
  | 'intelligence';

export type BusinessCenterModuleStatus = 'available' | 'coming-soon' | 'disabled';

export type BusinessCenterContext = {
  storeId: string;
  storeSlug: string;
  storeName?: string;
  actorId: string;
  actorRole: 'store_admin' | 'super_admin';
};

export type BusinessCenterModule = {
  id: BusinessCenterModuleId;
  title: string;
  description: string;
  status: BusinessCenterModuleStatus;
  primaryAction: string;
  dependencies: BusinessCenterModuleId[];
};

export type SubscriptionTierId = 'free' | 'starter' | 'growth' | 'pro';

export type SubscriptionEntitlements = {
  tier: SubscriptionTierId;
  modules: ReadonlyArray<BusinessCenterModuleId>;
  limits: {
    activePromotions: number;
    activeCampaigns: number;
    sponsoredPlacements: number;
  };
};

export type PromotionStatus = 'draft' | 'scheduled' | 'active' | 'paused' | 'expired' | 'archived';
export type CampaignStatus = 'draft' | 'scheduled' | 'active' | 'paused' | 'completed' | 'cancelled';
export type SubscriptionStatus = 'trial' | 'active' | 'past_due' | 'cancelled' | 'expired';
export type SponsoredPlacementStatus = 'draft' | 'pending_review' | 'approved' | 'active' | 'paused' | 'completed';
export type CommissionStatus = 'pending' | 'earned' | 'reversed' | 'paid';

export type Money = {
  amountMinor: number;
  currency: 'ZAR';
};

export type BusinessCenterRecordBase = {
  id: string;
  storeId: string;
  createdAt: string;
  updatedAt: string;
};

export type SubscriptionRecord = BusinessCenterRecordBase & {
  tier: SubscriptionTierId;
  status: SubscriptionStatus;
  startedAt: string;
  renewsAt?: string | null;
  cancelledAt?: string | null;
};

export type PromotionRecord = BusinessCenterRecordBase & {
  name: string;
  status: PromotionStatus;
  startsAt: string;
  endsAt: string;
  discount: { kind: 'percentage'; value: number } | { kind: 'fixed'; valueMinor: number };
  minimumSubtotalMinor?: number;
  productIds: string[];
};

export type CampaignRecord = BusinessCenterRecordBase & {
  name: string;
  status: CampaignStatus;
  goal: 'reach' | 'clicks' | 'sales' | 'conversions';
  startsAt: string;
  endsAt: string;
  budgetMinor?: number;
  participatingStoreIds: string[];
};

export type SponsoredPlacementRecord = BusinessCenterRecordBase & {
  status: SponsoredPlacementStatus;
  startsAt: string;
  endsAt: string;
  budgetMinor: number;
  spentMinor: number;
  sponsoredLabelRequired: true;
  placementTarget: 'homepage' | 'category' | 'search';
};

export type OrderAttribution = {
  channel: 'organic' | 'promotion' | 'campaign' | 'sponsored';
  promotionId?: string | null;
  campaignId?: string | null;
  sponsoredPlacementId?: string | null;
};

export type CommissionRule = BusinessCenterRecordBase & {
  rateBps: number;
  basis: 'subtotal' | 'item';
  enabled: boolean;
  effectiveFrom: string;
  effectiveUntil?: string | null;
};

export type CommissionLedgerEntry = BusinessCenterRecordBase & {
  orderId: string;
  ruleId: string;
  baseAmount: Money;
  commissionAmount: Money;
  status: CommissionStatus;
  reversedAt?: string | null;
};
