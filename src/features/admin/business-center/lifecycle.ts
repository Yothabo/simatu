import type { CampaignStatus, PromotionStatus, SubscriptionEntitlements, BusinessCenterModuleId } from './types';
import { hasModuleAccess, canCreateWithinLimit } from './entitlements';

export type LifecycleResult<T extends string> = { valid: boolean; next: T; error?: string };

const PROMOTION_TRANSITIONS: Record<PromotionStatus, PromotionStatus[]> = {
  draft: ['scheduled', 'active', 'archived'],
  scheduled: ['active', 'paused', 'archived'],
  active: ['paused', 'expired', 'archived'],
  paused: ['scheduled', 'active', 'archived'],
  expired: ['archived'],
  archived: [],
};

const CAMPAIGN_TRANSITIONS: Record<CampaignStatus, CampaignStatus[]> = {
  draft: ['scheduled', 'active', 'cancelled'],
  scheduled: ['active', 'paused', 'cancelled'],
  active: ['paused', 'completed', 'cancelled'],
  paused: ['scheduled', 'active', 'cancelled'],
  completed: [],
  cancelled: [],
};

export function transitionPromotion(current: PromotionStatus, next: PromotionStatus): LifecycleResult<PromotionStatus> {
  const valid = current === next || PROMOTION_TRANSITIONS[current].includes(next);
  return valid ? { valid, next } : { valid, next: current, error: `Promotion cannot transition from ${current} to ${next}.` };
}

export function transitionCampaign(current: CampaignStatus, next: CampaignStatus): LifecycleResult<CampaignStatus> {
  const valid = current === next || CAMPAIGN_TRANSITIONS[current].includes(next);
  return valid ? { valid, next } : { valid, next: current, error: `Campaign cannot transition from ${current} to ${next}.` };
}

export function canUseBusinessCenterModule(
  entitlements: SubscriptionEntitlements,
  moduleId: BusinessCenterModuleId,
): boolean {
  return hasModuleAccess(entitlements, moduleId);
}

export function canCreateBusinessCenterRecord(
  entitlements: SubscriptionEntitlements,
  moduleId: BusinessCenterModuleId,
  currentEligibleCount: number,
): boolean {
  return canCreateWithinLimit(entitlements, moduleId, currentEligibleCount);
}

export function countLimitEligiblePromotions(statuses: readonly PromotionStatus[]): number {
  return statuses.filter((status) => status === 'active' || status === 'scheduled').length;
}

export function countLimitEligibleCampaigns(statuses: readonly CampaignStatus[]): number {
  return statuses.filter((status) => status === 'active' || status === 'scheduled').length;
}

/** Attribution fields are explicit; organic traffic is never represented as paid. */
export type CommerceAttribution = {
  channel: 'organic' | 'promotion' | 'campaign' | 'sponsored';
  promotionId?: string;
  campaignId?: string;
  placementId?: string;
};

export function validateCommerceAttribution(input: CommerceAttribution): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  if (input.channel === 'promotion' && !input.promotionId) errors.push('Promotion attribution requires a promotion ID.');
  if (input.channel === 'campaign' && !input.campaignId) errors.push('Campaign attribution requires a campaign ID.');
  if (input.channel === 'sponsored' && !input.placementId) errors.push('Sponsored attribution requires a placement ID.');
  if (input.channel === 'organic' && (input.promotionId || input.campaignId || input.placementId)) {
    errors.push('Organic attribution must not contain paid or promotional identifiers.');
  }
  return { valid: errors.length === 0, errors };
}

export type BusinessCenterPersistenceAdapter<T> = {
  list(storeId: string): Promise<T[]>;
  create(storeId: string, record: T): Promise<T>;
  update(storeId: string, recordId: string, patch: Partial<T>): Promise<T>;
};
