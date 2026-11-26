import type { CommissionRule, Money } from './types';

export type CommissionCalculation = {
  base: Money;
  commission: Money;
  rateBps: number;
};

export function calculateCommission(
  base: Money,
  rule: Pick<CommissionRule, 'rateBps' | 'enabled'>,
): CommissionCalculation {
  if (!Number.isSafeInteger(base.amountMinor) || base.amountMinor < 0) {
    throw new Error('Commission base must be a non-negative whole amount in minor currency units.');
  }
  if (!Number.isSafeInteger(rule.rateBps) || rule.rateBps < 0 || rule.rateBps > 10000) {
    throw new Error('Commission rate must be between 0 and 10000 basis points.');
  }
  const commissionMinor = rule.enabled ? Math.round(base.amountMinor * rule.rateBps / 10000) : 0;
  return {
    base: { ...base },
    commission: { amountMinor: commissionMinor, currency: base.currency },
    rateBps: rule.rateBps,
  };
}
