import type { CategoryFilter } from '../../../types/admin.types';

export function getVisibleCategories(categories: string[]): CategoryFilter[] {
  return ['All', ...categories, 'Hidden'];
}
