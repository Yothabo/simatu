import type { CampaignStatus } from './types';

export type CampaignDefinition = {
  status: CampaignStatus;
  startsAt: string;
  endsAt: string;
  budgetMinor?: number;
  goal: 'reach' | 'clicks' | 'sales' | 'conversions';
  participatingStoreIds: string[];
};

export type CampaignValidation = { valid: boolean; errors: string[] };

export function validateCampaign(input: CampaignDefinition): CampaignValidation {
  const errors: string[] = [];
  const start = Date.parse(input.startsAt);
  const end = Date.parse(input.endsAt);
  if (!Number.isFinite(start)) errors.push('Campaign start date is invalid.');
  if (!Number.isFinite(end)) errors.push('Campaign end date is invalid.');
  if (Number.isFinite(start) && Number.isFinite(end) && end <= start) errors.push('Campaign end must be after start.');
  if (input.budgetMinor !== undefined &&
      (!Number.isSafeInteger(input.budgetMinor) || input.budgetMinor < 0)) {
    errors.push('Campaign budget must be a non-negative whole amount in minor currency units.');
  }
  if (input.participatingStoreIds.some((id) => !id.trim())) errors.push('Store IDs must not be blank.');
  if (new Set(input.participatingStoreIds).size !== input.participatingStoreIds.length) {
    errors.push('A store may only be enrolled once per campaign.');
  }
  return { valid: errors.length === 0, errors };
}

export function isCampaignJoinable(status: CampaignStatus, now = Date.now()): boolean {
  return status === 'active' || status === 'scheduled';
}

export function getCampaignParticipationCount(storeIds: readonly string[]): number {
  return new Set(storeIds.filter((id) => id.trim().length > 0)).size;
}
