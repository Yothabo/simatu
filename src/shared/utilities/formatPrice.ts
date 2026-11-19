export function formatPrice(price: number): string {
  return `R ${price.toLocaleString('en-ZA')}`;
}
