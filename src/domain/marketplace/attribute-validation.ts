import type {
  AttributeDefinition,
  MeasurementValue,
  TypedAttributeValue,
} from './types';

export type AttributeValidationIssue = {
  attributeKey: string;
  message: string;
};

const isMeasurement = (value: unknown): value is MeasurementValue =>
  typeof value === 'object' &&
  value !== null &&
  'value' in value &&
  typeof value.value === 'number' &&
  Number.isFinite(value.value) &&
  'unit' in value &&
  typeof value.unit === 'string' &&
  value.unit.trim().length > 0;

const isEmpty = (value: unknown): boolean =>
  value === undefined ||
  value === null ||
  (typeof value === 'string' && value.trim().length === 0) ||
  (Array.isArray(value) && value.length === 0);

export function validateAttributeValue(
  definition: AttributeDefinition,
  value: unknown,
): string | null {
  if (isEmpty(value)) {
    return definition.required ? 'A value is required.' : null;
  }

  switch (definition.type) {
    case 'text':
    case 'date':
      if (typeof value !== 'string') return 'A text value is required.';
      if (definition.type === 'date' && Number.isNaN(Date.parse(value))) {
        return 'A valid date is required.';
      }
      return null;
    case 'number':
      if (typeof value !== 'number' || !Number.isFinite(value)) {
        return 'A valid number is required.';
      }
      if (definition.min !== undefined && value < definition.min) {
        return `Value must be at least ${definition.min}.`;
      }
      if (definition.max !== undefined && value > definition.max) {
        return `Value must be no more than ${definition.max}.`;
      }
      return null;
    case 'boolean':
      return typeof value === 'boolean' ? null : 'A true or false value is required.';
    case 'single_select':
      if (typeof value !== 'string') return 'Choose one valid option.';
      return definition.options?.some((option) => option.value === value)
        ? null
        : 'Choose one valid option.';
    case 'multi_select':
      if (!Array.isArray(value) || !value.every((item) => typeof item === 'string')) {
        return 'Choose valid options.';
      }
      return value.every((item) => definition.options?.some((option) => option.value === item))
        ? null
        : 'Choose valid options.';
    case 'measurement':
      if (!isMeasurement(value)) return 'A valid measurement and unit are required.';
      if (definition.unit && value.unit !== definition.unit) {
        return `Measurement unit must be ${definition.unit}.`;
      }
      if (definition.min !== undefined && value.value < definition.min) {
        return `Measurement must be at least ${definition.min}.`;
      }
      if (definition.max !== undefined && value.value > definition.max) {
        return `Measurement must be no more than ${definition.max}.`;
      }
      return null;
    default:
      return 'Unsupported attribute type.';
  }
}

export function validateAttributeValues(
  definitions: AttributeDefinition[],
  values: Record<string, TypedAttributeValue | undefined>,
): AttributeValidationIssue[] {
  return definitions.flatMap((definition) => {
    const issue = validateAttributeValue(definition, values[definition.key]);
    return issue ? [{ attributeKey: definition.key, message: issue }] : [];
  });
}
