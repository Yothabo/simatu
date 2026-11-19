export function isNumericValue(value: unknown): boolean {
  return (
    (typeof value === 'number' || typeof value === 'string') &&
    String(value).trim() !== '' &&
    Number.isFinite(Number(value))
  );
}

export function isNullableString(value: unknown): boolean {
  return value === null || typeof value === 'string';
}
