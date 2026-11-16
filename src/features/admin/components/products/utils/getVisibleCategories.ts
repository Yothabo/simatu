import type { CategoryFilter, Storefront } from '../../../types/admin.types';

export function getVisibleCategories(
  storefront: 'all' | Storefront,
): CategoryFilter[] {
  if (storefront === 'yotaabo') {
    return ['All', 'His', 'Hers', 'Spaces', 'Hidden'];
  }
  if (storefront === 'poshies') {
    return ['All', 'His', 'Hers', 'Lounge', 'Hidden'];
  }
  return ['All', 'His', 'Hers', 'Spaces', 'Lounge', 'Hidden'];
}
