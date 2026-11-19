import type { AdminRow } from '../../../features/admin/types/admin.types';

export function formatProductAddedDate(
  createdAt: AdminRow['created_at']
): string {
  return new Date(createdAt).toLocaleDateString('en-ZA', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}
