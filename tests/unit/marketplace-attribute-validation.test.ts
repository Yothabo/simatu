import { describe, expect, it } from 'vitest';
import type { AttributeDefinition } from '../../src/domain/marketplace/types';
import {
  validateAttributeValue,
  validateAttributeValues,
} from '../../src/domain/marketplace/attribute-validation';

const definition = (overrides: Partial<AttributeDefinition> = {}): AttributeDefinition => ({
  id: 'attribute-1',
  key: 'material',
  label: 'Material',
  type: 'text',
  required: false,
  searchable: true,
  filterable: true,
  customerSelectable: false,
  variantDefining: false,
  inventoryDefining: false,
  affectsPrice: false,
  ...overrides,
});

describe('validateAttributeValue', () => {
  it('accepts optional empty values', () => {
    expect(validateAttributeValue(definition(), undefined)).toBeNull();
    expect(validateAttributeValue(definition(), '')).toBeNull();
  });

  it('requires a value when definition is required', () => {
    expect(validateAttributeValue(definition({ required: true }), '')).toBe('A value is required.');
  });

  it('validates text and date values', () => {
    expect(validateAttributeValue(definition(), 'Leather')).toBeNull();
    expect(validateAttributeValue(definition({ type: 'text' }), 4)).toBe('A text value is required.');
    expect(validateAttributeValue(definition({ type: 'date' }), '2026-11-26')).toBeNull();
    expect(validateAttributeValue(definition({ type: 'date' }), 'not-a-date')).toBe('A valid date is required.');
  });

  it('validates numeric bounds', () => {
    const numeric = definition({ type: 'number', min: 2, max: 10 });
    expect(validateAttributeValue(numeric, 5)).toBeNull();
    expect(validateAttributeValue(numeric, 1)).toBe('Value must be at least 2.');
    expect(validateAttributeValue(numeric, 11)).toBe('Value must be no more than 10.');
    expect(validateAttributeValue(numeric, Number.NaN)).toBe('A valid number is required.');
  });

  it('validates boolean values', () => {
    expect(validateAttributeValue(definition({ type: 'boolean' }), false)).toBeNull();
    expect(validateAttributeValue(definition({ type: 'boolean' }), 'false')).toBe('A true or false value is required.');
  });

  it('validates single-select options', () => {
    const select = definition({ type: 'single_select', options: [{ value: 'cotton', label: 'Cotton' }] });
    expect(validateAttributeValue(select, 'cotton')).toBeNull();
    expect(validateAttributeValue(select, 'silk')).toBe('Choose one valid option.');
  });

  it('validates multi-select options', () => {
    const select = definition({ type: 'multi_select', options: [{ value: 'red', label: 'Red' }, { value: 'blue', label: 'Blue' }] });
    expect(validateAttributeValue(select, ['red', 'blue'])).toBeNull();
    expect(validateAttributeValue(select, ['red', 'green'])).toBe('Choose valid options.');
    expect(validateAttributeValue(select, 'red')).toBe('Choose valid options.');
  });

  it('validates measurements including units and bounds', () => {
    const measurement = definition({ type: 'measurement', unit: 'cm', min: 1, max: 50 });
    expect(validateAttributeValue(measurement, { value: 12, unit: 'cm' })).toBeNull();
    expect(validateAttributeValue(measurement, { value: 12, unit: 'mm' })).toBe('Measurement unit must be cm.');
    expect(validateAttributeValue(measurement, { value: 0, unit: 'cm' })).toBe('Measurement must be at least 1.');
    expect(validateAttributeValue(measurement, { value: 51, unit: 'cm' })).toBe('Measurement must be no more than 50.');
    expect(validateAttributeValue(measurement, { value: '12', unit: 'cm' })).toBe('A valid measurement and unit are required.');
  });

  it('collects issues by attribute key', () => {
    const definitions = [
      definition({ key: 'material', required: true }),
      definition({ key: 'weight', type: 'number', required: true }),
    ];
    expect(validateAttributeValues(definitions, { material: '', weight: 0 })).toEqual([
      { attributeKey: 'material', message: 'A value is required.' },
    ]);
  });
});
