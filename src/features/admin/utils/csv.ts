export function csvCell(value: string | number): string {
  const text = String(value);
  return '"' + text.replace(/"/g, '""') + '"';
}
