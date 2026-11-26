import type { SponsoredPlacementStatus } from './types';

export type AdvertisingPlacement = {
  storeId: string;
  status: SponsoredPlacementStatus;
  startsAt: string;
  endsAt: string;
  budgetMinor: number;
  spentMinor: number;
  sponsoredLabelRequired: true;
};

export type AdvertisingEligibility = { eligible: boolean; reasons: string[] };

export function evaluateAdvertisingPlacement(
  placement: AdvertisingPlacement,
  now = Date.now(),
): AdvertisingEligibility {
  const reasons: string[] = [];
  const start = Date.parse(placement.startsAt);
  const end = Date.parse(placement.endsAt);
  if (placement.status !== 'active') reasons.push('Placement is not active.');
  if (!Number.isFinite(start) || start > now) reasons.push('Placement has not started.');
  if (!Number.isFinite(end) || end <= now) reasons.push('Placement has ended.');
  if (!Number.isSafeInteger(placement.budgetMinor) || placement.budgetMinor < 0) reasons.push('Budget is invalid.');
  if (!Number.isSafeInteger(placement.spentMinor) || placement.spentMinor < 0) reasons.push('Spend is invalid.');
  if (placement.spentMinor >= placement.budgetMinor) reasons.push('Placement budget has been exhausted.');
  if (placement.sponsoredLabelRequired !== true) reasons.push('Sponsored disclosure is required.');
  return { eligible: reasons.length === 0, reasons };
}

export function remainingAdvertisingBudget(placement: Pick<AdvertisingPlacement, 'budgetMinor' | 'spentMinor'>): number {
  if (!Number.isSafeInteger(placement.budgetMinor) || !Number.isSafeInteger(placement.spentMinor)) return 0;
  return Math.max(0, placement.budgetMinor - placement.spentMinor);
}
