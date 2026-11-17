import { describe, expect, it } from 'vitest';
import { getFirstName } from '../../../src/features/admin/components/overview/overview/overviewDate.utils';

describe('getFirstName', () => {
  it.each([undefined, null, ''])('returns Admin when the name is missing or empty', (name) => {
    expect(getFirstName(name)).toBe('Admin');
  });

  it('trims whitespace and returns the first name', () => {
    expect(getFirstName('  thabo  molefe ')).toBe('Thabo');
  });

  it('supports names separated by punctuation', () => {
    expect(getFirstName('thabo.molefe')).toBe('Thabo');
  });
});
