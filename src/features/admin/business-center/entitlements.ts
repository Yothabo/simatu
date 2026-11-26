import type { BusinessCenterModuleId, SubscriptionEntitlements, SubscriptionTierId } from './types';
import { getTierModules } from './catalog';

const DEFAULT_LIMITS: Readonly<Record<SubscriptionTierId, SubscriptionEntitlements['limits']>> = {
  free: { activePromotions: 0, activeCampaigns: 0, sponsoredPlacements: 0 },
  starter: { activePromotions: 3, activeCampaigns: 0, sponsoredPlacements: 0 },
  growth: { activePromotions: 10, activeCampaigns: 3, sponsoredPlacements: 0 },
  pro: { activePromotions: 50, activeCampaigns: 20, sponsoredPlacements: 5 },
};

export function resolveEntitlements(tier: SubscriptionTierId): SubscriptionEntitlements {
  return {
    tier,
    modules: getTierModules(tier),
    limits: { ...DEFAULT_LIMITS[tier] },
  };
}

export function hasModuleAccess(
  entitlements: SubscriptionEntitlements,
  moduleId: BusinessCenterModuleId,
): boolean {
  return entitlements.modules.includes(moduleId);
}

export function assertModuleAccess(
  entitlements: SubscriptionEntitlements,
  moduleId: BusinessCenterModuleId,
): void {
  if (!hasModuleAccess(entitlements, moduleId)) {
    throw new Error(`Module "${moduleId}" is not included in the "${entitlements.tier}" plan.`);
  }
}

export function canCreateWithinLimit(
  entitlements: SubscriptionEntitlements,
  moduleId: BusinessCenterModuleId,
  currentCount: number,
): boolean {
  if (!Number.isFinite(currentCount) || currentCount < 0) return false;
  if (!hasModuleAccess(entitlements, moduleId)) return false;

  switch (moduleId) {
    case 'promotions':
      return currentCount < entitlements.limits.activePromotions;
    case 'campaigns':
      return currentCount < entitlements.limits.activeCampaigns;
    case 'advertising':
      return currentCount < entitlements.limits.sponsoredPlacements;
    default:
      return true;
  }
}
