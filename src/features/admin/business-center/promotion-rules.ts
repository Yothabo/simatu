import type { Money, PromotionStatus } from './types';

export type PromotionDiscount =
  | { kind: 'percentage'; value: number }
  | { kind: 'fixed'; valueMinor: number };

export type PromotionRuleInput = {
  status: PromotionStatus;
  startsAt: string;
  endsAt: string;
  discount: PromotionDiscount;
  minimumSubtotalMinor?: number;
};

export type PromotionValidation = {
  valid: boolean;
  errors: string[];
};

export function validatePromotionRule(input: PromotionRuleInput): PromotionValidation {
  const errors: string[] = [];
  const start = Date.parse(input.startsAt);
  const end = Date.parse(input.endsAt);

  if (!Number.isFinite(start)) errors.push('A valid start date is required.');
  if (!Number.isFinite(end)) errors.push('A valid end date is required.');
  if (Number.isFinite(start) && Number.isFinite(end) && end <= start) {
    errors.push('The end date must be later than the start date.');
  }
  if (input.discount.kind === 'percentage') {
    if (!Number.isFinite(input.discount.value) || input.discount.value <= 0 || input.discount.value > 100) {
      errors.push('Percentage discounts must be greater than 0 and no more than 100%.');
    }
  } else if (!Number.isSafeInteger(input.discount.valueMinor) || input.discount.valueMinor <= 0) {
    errors.push('Fixed discounts must be a positive whole amount in minor currency units.');
  }
  if (input.minimumSubtotalMinor !== undefined &&
      (!Number.isSafeInteger(input.minimumSubtotalMinor) || input.minimumSubtotalMinor < 0)) {
    errors.push('The minimum subtotal must be a non-negative whole amount in minor currency units.');
  }
  return { valid: errors.length === 0, errors };
}

export function calculatePromotionDiscount(
  subtotal: Money,
  discount: PromotionDiscount,
  minimumSubtotalMinor = 0,
): Money {
  if (!Number.isSafeInteger(subtotal.amountMinor) || subtotal.amountMinor < 0) {
    throw new Error('Subtotal must be a non-negative whole amount in minor currency units.');
  }
  if (subtotal.amountMinor < minimumSubtotalMinor) return { amountMinor: 0, currency: subtotal.currency };

  const raw = discount.kind === 'percentage'
    ? Math.round(subtotal.amountMinor * discount.value / 100)
    : discount.valueMinor;

  if (!Number.isSafeInteger(raw) || raw < 0) throw new Error('Discount amount is invalid.');
  return { amountMinor: Math.min(subtotal.amountMinor, raw), currency: subtotal.currency };
}
